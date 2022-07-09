import fs from 'fs';

const readBase64Str = (imgPath) => {
  const buff = fs.readFileSync(imgPath);
  return buff.toString('base64');
};

export const FAKE_IMAGE_PATH = `${process.cwd()}/assets/transparent.png`;
export const FAKE_IMAGE = fs.readFileSync(FAKE_IMAGE_PATH);
