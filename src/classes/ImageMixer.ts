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

  constructor({
    layersPath,
    layers,
    returnImages = true,
    output = '',
    sync = false,
  }: ImageMixerConstructorOptions) {
    this.layersPath = layersPath;
    this.layers = layers.map((layer) => {
      layer.directory = `${this.layersPath}/${layer.name}`;
      return layer;
    });

    this.output = output;
    this.returnImages = returnImages;
    this.sync = sync;

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
      const imgOutput = `${this.output}/${result.probability}_${idx}.png`;
      if (this.sync) {
        // save images synchronously
        saveBase64ImageSync(img, imgOutput);
      } else {
        saveBase64Image(img, imgOutput);
      }
    }
  }
}
