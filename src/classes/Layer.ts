import { LayerFile } from './LayerFile';

const fs = require('fs');
const path = require('path');

const PATH_DIR = path.resolve(`${process.cwd()}/layers`);

export interface childLayers {
  name: string;
  position: number;
}

interface LayerConstructor {
  position: number;
  name: string;
  probability: number;
  childLayers?: childLayers[];
}

export class Layer {
  position: number;
  name: string;
  probability: number;

  required: boolean;
  directory: string;
  files: string[];
  childLayers: childLayers[];

  constructor(args: LayerConstructor) {
    this.position = args.position;
    this.name = args.name;
    this.probability = args.probability;

    this.required = this.probability === 1 ? true : false;
    this.directory = `${PATH_DIR}/${this.name}`;
    this.childLayers = args.childLayers;
  }

  async getAllFiles(): Promise<LayerFile[]> {
    const filenames = await fs.promises.readdir(this.directory);
    const weightSum = this.getWeightSum(filenames);
    const files = filenames.map(
      (file) =>
        new LayerFile({
          filename: file,
          probability: (this.getFileWeightByName(file) / weightSum) * this.probability,
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
    return files.reduce((acum, item) => acum + this.getFileWeightByName(item), 0);
  }

  getFileWeightByName(file: string): number {
    // TODO: Change with a customizable function
    const weight = parseInt(file.split('_')[0]);
    return weight;
  }
}
