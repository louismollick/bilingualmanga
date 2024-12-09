/**
 * Map a transformed subset back to the original array size.
 *
 * @param {Array} array - The original array.
 * @param {Function} filterFn - The filter function to select elements.
 * @param {Function} transformFn - The transformation applied to the entire filtered subset.
 * @param {*} defaultValue - The default value for non-transformed elements.
 * @returns {Array} - The reconstructed array of the same length as the original.
 */
async function mapOnlyFilteredItems<T, R>(
  array: T[],
  filterFn: (item: T) => boolean,
  transformFn: (array: T[]) => Promise<R[]>,
  defaultValue: R,
) {
  // Get the indices and values of filtered elements
  const filtered = array
    .map((item, index) => (filterFn(item) ? { index, item } : null))
    .filter(Boolean) as { index: number; item: T }[];

  // Extract indices and values
  const indices = filtered.map((entry) => entry.index);
  const values = filtered.map((entry) => entry.item);

  // Apply transformation to the entire filtered subset
  const transformed = await transformFn(values);

  // Map back to the original array with default values
  const result = Array<R>(array.length).fill(defaultValue);
  indices.forEach((index, i) => {
    result[index] = transformed[i]!;
  });

  return result;
}

export default mapOnlyFilteredItems;
