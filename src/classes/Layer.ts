import { LayerFile } from './LayerFile';

import fs from 'fs';
import path from 'path';

const PATH_DIR = path.resolve(`${process.cwd()}/layers`);

export interface childLayers {
  name: string;
  position: number;
}

interface LayerConstructor {
  position: number;
  name: string;
  probability?: number;
  childLayers?: childLayers[];
  getFilesWeight?: (filename: string) => number;
}

export class Layer {
  position: number;
  name: string;
  probability: number;

  required: boolean;
  directory: string;
  files: string[];
  childLayers: childLayers[];

  /** Custom function that will calculate the file weight based on filename */
  getFilesWeight: (filename: string) => number;

  constructor(args: LayerConstructor) {
    this.position = args.position;
    this.name = args.name;
    this.probability = args.probability || 1;

    this.required = this.probability === 1 ? true : false;
    this.directory = `${PATH_DIR}/${this.name}`;
    this.childLayers = args.childLayers;
    this.getFilesWeight = args.getFilesWeight;
  }

  async getAllFiles(): Promise<LayerFile[]> {
    const filenames = await fs.promises.readdir(this.directory);
    const weightSum = this.getWeightSum(filenames);
    const files = filenames.map(
      (file) =>
        new LayerFile({
          filename: file,
          probability: (this.getFilesWeight(file) / weightSum) * this.probability,
          rootPath: this.directory,
          position: this.position,
          related: this.childLayers,
        })
    );

    // append an empty png on each layer if the layer probability is not 1
    if (this.probability !== 1) {
      files.push(
        new LayerFile({
          filename: 'transparent.png',
          probability: 1 - this.probability,
          rootPath: `${process.cwd()}/node_modules/image-mixer/assets/`, // TODO: check if this handle all import cases.
        })
      );
    }

    return files;
  }

  getWeightSum(files: Array<string>): number {
    return files.reduce((acum, item) => acum + this.getFilesWeight(item), 0);
  }
}
