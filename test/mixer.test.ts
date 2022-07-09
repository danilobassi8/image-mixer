import { Layer } from './../src/classes/Layer';
import { ImageMixer } from './../src/classes/ImageMixer';
import { BASIC_FACE_MOCK } from './mocks/files';
import { getAllPossibleCombinations } from '../src/utils';
import { areSameArray } from '../src/utils';
import mock from 'mock-fs';

// Mock the merge-images library.
jest.mock('merge-images', () => {
  return () => '';
});

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

    combinations.forEach((comb) => {
      // foreach combinations, should check if all elements are the same with other the other combination array.
      const filenames = comb.map((file) => file.filename).sort();
      const match = generatedCombinations.filter((generated) => {
        const genFilenames = generated.map((file) => file.filename).sort();
        return areSameArray(genFilenames, filenames);
      });

      expect(match.length).toBe(1);
    });
  });

  it('Should return an error if the output directory is not valid', () => {
    const path = '/fake/path/to/test';
    expect(() => new ImageMixer({ layersPath, layers, output: path })).toThrow(
      `${path} is not a valid directory.`
    );
  });

  it('All results should be ordered by layer position', async () => {
    const results = await mixer.generateResults();
    results.forEach((res) => {
      const positions = res.files.map((files) => files.position);

      let lastElement;
      for (let current of positions) {
        if (!lastElement) lastElement = current;
        expect(current).toBeGreaterThanOrEqual(lastElement);
        lastElement = current;
      }
    });
  });

  it('The probability of a result is the multiplication of all the files in it', async () => {});
});
