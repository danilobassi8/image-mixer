const fs = require('fs');

export class LayerFile {
  filename: string;
  path: string;
  probability: number;
  position: number;
  relatedFiles: LayerFile[];
  rootPath: string;
  isChild: boolean;

  constructor({ filename, rootPath, probability, position = 0, related = [], isChild = false }) {
    this.filename = filename;
    this.probability = probability;
    this.position = position;
    this.rootPath = rootPath;
    this.isChild = isChild;

    this.path = `${rootPath}/${filename}`;
    this.relatedFiles = related
      .map((related) => {
        return new LayerFile({
          rootPath: `${this.rootPath.substring(0, this.rootPath.lastIndexOf('/'))}/${related.name}`,
          filename: this.filename, // should have the same name as parent
          probability: 1,
          position: related.position,
          isChild: true,
        });
      })
      .filter((file) => file.exists());
  }

  /** return itself and every files related */
  getAllRelatedFiles(): LayerFile[] {
    return [this, ...this.relatedFiles];
  }

  /** check if the file exists */
  exists(): boolean {
    try {
      return fs.existsSync(this.path);
    } catch (err) {
      return false;
    }
  }
}
