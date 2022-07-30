import { Layer } from './Layer';
import { MixerResult } from './MixerResult';
import { getAllPossibleCombinations, saveBase64Image, saveBase64ImageSync } from '../utils';
import fs from 'fs';

type ImageMixerConstructorOptions = {
  layers: Layer[];
  layersPath: string;
  returnImages?: boolean;
  output?: string;
  sync?: boolean;

  /** Custom function that will calculate the file weight based on filename. You can also assign this function to each layer individually. */
  getFilesWeight?: (filename: string) => number;
  formatResultName?: (idx: number, probability: number) => string;
};

export class ImageMixer {
  public layers: Layer[];
  public layersPath: string;

  /** Indicates if we should return the images in the response object (defaults to true) */
  private returnImages: boolean;
  /** where files will be saved */
  private output: string;
  /** when saving results, if true, will wait to save all files before returning */
  private sync: boolean;
  /** Function that will return the name of generated files given a secuential index and the images' probability */
  formatResultName: (idx: number, probability: number) => string;

  constructor({
    layersPath,
    layers,
    returnImages = true,
    output = '',
    sync = false,
    getFilesWeight = () => 1,
    formatResultName = (idx, prob) => `${prob}_${idx}.png`,
  }: ImageMixerConstructorOptions) {
    this.layersPath = layersPath;
    this.layers = layers.map((layer) => {
      layer.directory = `${this.layersPath}/${layer.name}`;
      // is the layer doesn't have a function to get the weights, assign one.
      if (!layer.getFilesWeight) {
        layer.getFilesWeight = getFilesWeight;
      }
      return layer;
    });

    this.output = output;
    this.returnImages = returnImages;
    this.sync = sync;
    this.formatResultName = formatResultName;

    this.initialChecks();
  }

  private initialChecks() {
    /** check if the output directory is valid */
    if (this.output) {
      if (!fs.existsSync(this.output)) throw new Error(`${this.output} is not a valid directory.`);
    }
  }

  async getAllPossibleCombinations() {
    const layers = await Promise.all(this.layers.map((layer) => layer.getAllFiles()));
    return getAllPossibleCombinations(layers);
  }

  /**
   * Generate all mixer results based on mixer attrs. This method will also save the results in the output path
   * @returns results
   */
  async generateResults() {
    const combinedLayers = await this.getAllPossibleCombinations();
    const combinations = await combinedLayers
      .map((combination) => {
        return combination
          .map((files) => {
            return files.getAllRelatedFiles();
          })
          .flat()
          .sort((file1, file2) => file1.position - file2.position);
      })
      .map(async (combination) => await new MixerResult(combination, this.returnImages).init());

    const results = await Promise.all(combinations);

    if (this.output) {
      this.saveAllResults(results);
    }

    return results;
  }

  /** Saves all the results on the output directory  */
  private async saveAllResults(results: MixerResult[]) {
    let idx = 0;
    for (const result of results) {
      idx++;
      const img = await result.getImage();
      const imgOutput = `${this.output}/${this.formatResultName(idx, result.probability)}`;
      if (this.sync) {
        // save images synchronously
        saveBase64ImageSync(img, imgOutput);
      } else {
        saveBase64Image(img, imgOutput);
      }
    }
  }
}
