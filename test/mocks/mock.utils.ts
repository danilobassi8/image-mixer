import fs from 'fs';

const readBase64Str = (imgPath) => {
  const buff = fs.readFileSync(imgPath);
  return buff.toString('base64');
};

export const FAKE_IMAGE = readBase64Str(`${process.cwd()}/assets/transparent.png`);
