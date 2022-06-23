import { LayerFile } from './LayerFile';
import mergeImages from 'merge-images';
const { Canvas, Image } = require('canvas');

export class MixerResult {
  files: LayerFile[] = [];
  probability = 1;
  image: any = undefined;
  shouldGenerateImage: boolean;

  constructor(files: LayerFile[], shouldGenerateImage = true) {
    files.forEach((file) => {
      this.files.push(file);
      this.probability = this.probability * file.probability;
      this.shouldGenerateImage = shouldGenerateImage;
    });
  }

  async init() {
    this.image = this.shouldGenerateImage ? await this.generateImage() : undefined;
    return this;
  }

  async generateImage() {
    const images = this.files.map((file) => file.path);
    return mergeImages(images, { Canvas: Canvas, Image: Image });
  }

  async getImage() {
    return this.image ?? this.generateImage();
  }
}
