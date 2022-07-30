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

export const MOCK_WITH_CUSTOM_WEIGHTS = () => {
  const tree = {
    '/home/images': {
      base: {
        '100_base1': FAKE_IMAGE,
        '200_base2': FAKE_IMAGE,
      },
      hair: {
        'image_0weight:50': FAKE_IMAGE,
        'image1_weight:100': FAKE_IMAGE,
        'image_2weight:100': FAKE_IMAGE,
      },
      // sub-layer
      hair_background: {
        '100_hair3_LONG': FAKE_IMAGE,
      },
      eyes: {
        'USE_A_REGEX_HERE_asdasdas:dasd_weight_50_randomtext': FAKE_IMAGE,
        'as:djashdh_weight_100_sadsdzxxxx': FAKE_IMAGE,
        'lññlññl_weight_100_xasd:': FAKE_IMAGE,
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
