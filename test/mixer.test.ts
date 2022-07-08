import { Layer } from './../src/classes/Layer';
import { ImageMixer } from './../src/classes/ImageMixer';
import { BASIC_FACE_MOCK } from './mocks/files';
import { getAllPossibleCombinations } from '../src/utils';

import mock from 'mock-fs';

describe('Basic image tree', () => {
  afterAll(() => {
    // remove the mock-fs
    mock.restore();
  });

  const { layersPath, tree } = BASIC_FACE_MOCK();
  const files = tree[layersPath];
  const layers = Object.keys(files)
    .map((layerName, position) => {
      if (layerName == 'hair_background') return null;
      if (layerName.startsWith('hair')) {
        return new Layer({
          name: layerName,
          position,
          probability: 0.9,
          childLayers: [{ name: 'hair_background', position: 0 }],
        });
      }
      return new Layer({ name: layerName, position, probability: 1 });
    })
    .filter((v) => !!v) as Layer[];
  const mixer = new ImageMixer({ layersPath, layers });

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

    // hacer que combinations y generatedCombinatiosn sean iguales
    console.log(combinations);
  });
});
