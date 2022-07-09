import fs from 'fs';

/** Saves a Base64 image into a file (sync) */
export function saveBase64ImageSync(saveBase64Image: any, filename: string) {
  const base64 = saveBase64Image.split(',')[1];
  const imageBuffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(filename, imageBuffer);
}

/** Saves a Base64 image into a file (async) */
export function saveBase64Image(saveBase64Image: any, filename: string) {
  const base64 = saveBase64Image.split(',')[1];
  const imageBuffer = Buffer.from(base64, 'base64');
  fs.writeFile(filename, imageBuffer, (err: any) => {
    if (!err) console.log(filename, 'saved');
  });
}

/**
 * Returns all possible combinations of elements inside the list
 *
 * @param list list of elements to combine.
 * @returns all possible combinations
 */
export function getAllPossibleCombinations<T>(list: T[][]): T[][] {
  const listCopy = [...list]; // a copy to avoid mutating the original list
  const first = listCopy.shift();
  return concatArray(first as Array<any>, listCopy);
}

function concatArray<T>(array: T[], others: T[][]): T[] {
  const first = others.shift();
  if (!first) return array;

  const lastConcat = concatArray(first, others);
  const merged = mergeArrays(array, lastConcat);

  return merged;
}

function mergeArrays(arr1: any[], arr2: any[]): any[] {
  // check the type of the first element on arr2.
  const isArray = Array.isArray(arr2[0]);

  if (isArray) {
    // add every element in arr1, to every array in arr2
    const elements = [];
    for (let el1 of arr1) {
      for (let el2 of arr2) {
        elements.push([...el2, el1]);
      }
    }
    return elements;
  } else {
    // return combinations for elements in A and B
    const elements = [];
    for (let el1 of arr1) {
      for (let el2 of arr2) {
        elements.push([el1, el2]);
      }
    }
    return elements;
  }
}

export function areSameArray(array1: any[], array2: any[]): boolean {
  if (array1.length === array2.length) {
    return array1.every((el1) => (array2.includes(el1) ? true : false));
  }
  return false;
}
