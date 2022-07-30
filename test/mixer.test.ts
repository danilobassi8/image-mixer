import { Layer } from './../src/classes/Layer';
import { ImageMixer } from './../src/classes/ImageMixer';
import { BASIC_FACE_MOCK, MOCK_WITH_CUSTOM_WEIGHTS } from './mocks/files';
import { getAllPossibleCombinations } from '../src/utils';

import mock from 'mock-fs';

const getLayersForMixerTest = (layersPath, tree) => {
  const files = tree[layersPath];
  const layers = Object.keys(files)
    .map((layerName, position) => {
      if (layerName == 'hair_background') return null;
      if (layerName.startsWith('hair')) {
        return new Layer({
          name: layerName,
          position,
          probability: 1,
          childLayers: [{ name: 'hair_background', position: 0 }],
        });
      }
      return new Layer({ name: layerName, position, probability: 1 });
    })
    .filter((v) => !!v) as Layer[];
  return layers;
};

describe('mixer tests', () => {
  afterAll(() => {
    // remove the mock-fs
    mock.restore();
  });

  describe('Basic mixer tests', () => {
    const { layersPath, tree } = BASIC_FACE_MOCK();
    const layers = getLayersForMixerTest(layersPath, tree);
    const mixer = new ImageMixer({ layers, layersPath });

    it('All directories names should be <root>/<layername>', () => {
      mixer.layers.forEach((layer) => {
        expect(layer.directory).toEqual(`${layersPath}/${layer.name}`);
      });
    });

    it('Hair should be the only layer with a child layer', () => {
      mixer.layers.forEach((layer) => {
        if (layer.name == 'hair') {
          expect(layer.childLayers).toBeTruthy();
          expect(layer.childLayers.length).toBe(1);
          expect(layer.childLayers[0].name).toBe('hair_background');
        } else {
          expect(layer.childLayers ?? 'ok').toBe('ok'); // null or undefined
        }
      });
    });

    it('Should generate all possible combinations.', async () => {
      const generatedCombinations = await mixer.getAllPossibleCombinations();
      const layerFiles = await Promise.all(mixer.layers.map(async (layer) => layer.getAllFiles()));
      const combinations = getAllPossibleCombinations(layerFiles);

      // TODO: test that this both combinations are the same.
      // console.log(combinations);
    });
  });

  describe('Custom weight and format result function', () => {
    const formatResultName = (idx, prob) => `index:${idx}-prob:${prob}`;
    const getFilesWeight = (filename) => parseInt(filename.split('_')[0]);

    const { layersPath, tree } = MOCK_WITH_CUSTOM_WEIGHTS();

    it('All weights should be one by default.', async () => {
      const layers = getLayersForMixerTest(layersPath, tree);
      const mixer = new ImageMixer({ layers, layersPath });
      const promises = mixer.layers.map((layer) => layer.getAllFiles());
      const layersFiles = await Promise.all(promises);
      layersFiles.forEach((layer) =>
        layer.forEach((file) => expect(file.probability).toBe(1 / layer.length))
      );
    });

    it('Three layers with three diferent weights detector function', async () => {
      const mixer = new ImageMixer({
        layers: [
          new Layer({
            name: 'base',
            position: 0,
          }),
          new Layer({
            name: 'hair',
            position: 1,
            getFilesWeight(filename) {
              return parseInt(filename.split(':')[1]);
            },
          }),
          new Layer({
            name: 'eyes',
            position: 2,
            getFilesWeight(filename) {
              const regex = new RegExp('.*weight_(.*)_.*');
              const match = filename.match(regex);
              return parseInt(match ? match[1] : '1');
            },
          }),
        ],
        layersPath,
        formatResultName,
        getFilesWeight,
      });

      const PROBABILITIES = {
        '100_base1': 1 / 3,
        '200_base2': 2 / 3,
        'image_0weight:50': 50 / 250,
        'image1_weight:100': 100 / 250,
        'image_2weight:100': 100 / 250,
        'USE_A_REGEX_HERE_asdasdas:dasd_weight_50_randomtext': 50 / 250,
        'as:djashdh_weight_100_sadsdzxxxx': 100 / 250,
        'lññlññl_weight_100_xasd:': 100 / 250,
      };

      const promises = mixer.layers.map((layer) => layer.getAllFiles());
      const layersFiles = await Promise.all(promises);
      layersFiles.forEach((layer) =>
        layer.forEach((file) => {
          expect(file.probability).toBe(PROBABILITIES[file.filename]);
        })
      );
    });
  });
});
