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
      },
      created_at: {
        $gte: '2023-01-01',
        $lte: '2023-12-31',
      },
      $not: {
        
        created_at: {
          $lt: '2023-01-01',
          $gt: '2023-12-31',
        },
      }
    }
  ],
}

const query2: VQL = {
  search: 'tag:subscribed',
  $not:{
    search: 'tag:unsubscribed',
    $and: [
      {
        search: 'tag:subscribed',
        tomer: {
          $eq: 'tomer',
        },
      },
      // {
      //   $not: {
      //     search: 'tag:unsubscribed',
      //     tomer: {
      //       $eq: 'tomer',
      //     }
      //   }
      // }
    ]
  },
}

console.log('helo')