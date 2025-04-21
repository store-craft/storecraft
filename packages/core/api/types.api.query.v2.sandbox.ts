import { type VQL } from './types.api.query.v2.js'

type Data = {
  id: string
  name: string
  age: number
  active: boolean
  created_at: string
}

const query: VQL<Data> = {
  active: {
    $eq: true,
  },
  created_at: {
    $gt: '2023-01-01',
  },
  $or: [
    {
      name: {
        $eq: 'John',
      },
    },
  ],
}