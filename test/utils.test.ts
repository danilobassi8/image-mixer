import { getAllPossibleCombinations } from '../src/utils';

const NUMERICAL_TEST_CASES = [
  {
    elements: [
      [1, 2, 3],
      [10, 20, 30],
    ],
    shouldInclude: [
      [1, 10],
      [1, 20],
      [1, 30],
      [2, 10],
      [2, 20],
      [3, 30],
    ],
  },
  {
    elements: [
      [1, 2],
      [10, 20],
      [100, 200],
    ],
    shouldInclude: [
      [1, 10, 100],
      [1, 20, 100],
      [1, 10, 200],
      [1, 20, 200],
      [2, 10, 100],
      [2, 20, 100],
      [2, 10, 200],
      [2, 20, 200],
    ],
  },
];

const STRING_TEST_CASES = [
  {
    elements: [['tomato', 'pizza'], ['chocolate']],
    shouldInclude: [
      ['tomato', 'chocolate'],
      ['pizza', 'chocolate'],
    ],
  },
  {
    elements: [['js', 'py', 'ts'], ['10', '20'], ['dota2'], ['world', 'mouse']],
    shouldInclude: [
      ['js', '10', 'dota2', 'world'],
      ['js', '20', 'dota2', 'world'],
      ['js', '10', 'dota2', 'mouse'],
      ['js', '20', 'dota2', 'mouse'],
      ['py', '10', 'dota2', 'world'],
      ['py', '20', 'dota2', 'world'],
      ['py', '10', 'dota2', 'mouse'],
      ['py', '20', 'dota2', 'mouse'],
      ['ts', '10', 'dota2', 'world'],
      ['ts', '20', 'dota2', 'world'],
      ['ts', '10', 'dota2', 'mouse'],
      ['ts', '20', 'dota2', 'mouse'],
    ],
  },
];

describe('All combinations should work as expected', () => {
  function testCombinations(combinations: any[], original: any[], include: any[]) {
    const expectedLength = original.reduce(
      (acum, el) => (acum = acum ? acum * el.length : el.length),
      0
    );
    expect(combinations.length).toEqual(expectedLength);

    include.forEach((includeElement: any[]) => {
      const found = combinations.filter((combElement) => {
        return combElement.reduce(
          (acum, item) => (acum = acum && includeElement.includes(item)),
          true
        );
      });
      expect(found.length).toBe(1);
    });
  }

  it('test it with numbers', () => {
    NUMERICAL_TEST_CASES.forEach((testCase) => {
      const combinations = getAllPossibleCombinations(testCase.elements);
      testCombinations(combinations, testCase.elements, testCase.shouldInclude);
    });
  });

  it('test it with strings', () => {
    STRING_TEST_CASES.forEach((testCase) => {
      const combinations = getAllPossibleCombinations(testCase.elements);
      testCombinations(combinations, testCase.elements, testCase.shouldInclude);
    });
  });
});
