import { FAKE_IMAGE } from './mock.utils';
const mock = require('mock-fs');

export const BASIC_FACE_MOCK = () => {
  const tree = {
    '/home/images': {
      base: {
        '100_base1': FAKE_IMAGE,
        '100_base2': FAKE_IMAGE,
      },
      hair: {
        '50_hair1': FAKE_IMAGE,
        '100_hair2': FAKE_IMAGE,
        '100_hair3_LONG': FAKE_IMAGE,
      },
      // sub-layer
      hair_background: {
        '100_hair3_LONG': FAKE_IMAGE,
      },
      eyes: {
        '25_eyes1': FAKE_IMAGE,
        '100_eyes2': FAKE_IMAGE,
        '100_eyes3': FAKE_IMAGE,
      },
      mouth: {
        '1_mouth1': FAKE_IMAGE,
        '1_mouth2': FAKE_IMAGE,
      },
      nose: {
        '100_nose1': FAKE_IMAGE,
      },
    },
  };
  mock(tree);

  return { layersPath: '/home/images', tree };
};
