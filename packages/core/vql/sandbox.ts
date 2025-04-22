import { VQL } from "./types.js"

type Data = {
  id: string
  name: string
  age: number
  active: boolean
  created_at: string
}

const query: VQL<Data> = {

  // active: {
  //   $eq: true,
  // },
  // created_at: {
  //   $gt: '2023-01-01',
  // },
  search: 'hello',
  $and: [
    {
      search: 'hello',
      age: {
        $gt: 18,
      },
      active: {
        $eq: true,
      },
      $and: [
        {
          active: {
            $eq: true,
          }
        }
      ]
    },
  ],
}



console.log('helo')