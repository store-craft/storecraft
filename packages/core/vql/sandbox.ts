import { VQL } from "./types.js"

type Data = {
  id: string
  name: string
  age: number
  active: boolean
  created_at: string
}

const query: VQL<Data> = {
  search: 'tag:subscribed',
  $and: [
    {
      age: {
        $gte: 18,
        $lt: 35,
      },
    },
    {
      active: {
        $eq: true,
      }
    }
  ],
}



console.log('helo')