






const A = ['0', '1']//, '1', '2']
const B = ['B1', 'B2', 'B3']
const C = ['C1', 'C2', 'C3']


const Collection = [A, B, []]
const R = []


const compute_combinations = (idx, collection=[]) => {
  let result = [];

  if(idx==collection.length)
    return []

  if(idx==collection.length-1)
    return collection[idx].map(c => [c])

  let funki = compute_combinations(idx + 1, collection) ?? [[]]

  for (let ix = 0; ix < collection[idx].length; ix++) {

    for (let jx = 0; jx < funki.length; jx++) {
      // const computed = collection[idx][ix] + '-' + funki[jx]
      const computed = [
        collection[idx][ix], ...funki[jx]
      ]

      result.push(computed)
    }
  }

  return result
}

const res = compute_combinations(0, Collection)
console.log(res)

