const default_renderer: React.FC<{item:any}> = ({item}) => <span children={item}/>

export type TableParams = {
  chat: {
    content: (string | number | boolean)[][],
    renderers?: React.FC<{item: any}>[]
  }
} & React.ComponentProps<'div'>;

export const Table = (
  {
    chat, ...rest
  }: TableParams
) => {

  // console.log({table: 'table'})

  return (
    <div {...rest} className=" overflow-x-scroll">
      <table className='w-full table-auto'>
        <thead>
          <tr className='border-b chat-bg-overlay 
            chat-border-overlay --font-inter --rounded-md
              text-gray-400'>
            {
              chat.content[0].map(
                (item, ix) => (
                  <th 
                    className={
                      'text-ellipsis py-2  ' +
                      (
                        ix==0 ? 'text-left rounded-tl-lg --px-3' : 
                        ix<chat.content[0].length-1 ? 
                        'text-center px-3' : 
                        'text-right px-0 rounded-tr-lg --sticky right-0 '
                      )
                    }
                    key={ix} 
                    children={
                      <span 
                        className='px-3 text-ellipsis font-light 
                          font-mono text-sm w-32 '>
                        {item}
                      </span>
                    } 
                  /> 
                )
              )
            }
          </tr>
        </thead>
        <tbody>
        {
          chat.content.slice(1).map(
            (item, ix) => (
              <tr key={ix} className='border-b chat-border-overlay'>
                {
                  item.map(
                    (cell, ix) => (
                      <td key={ix} className='relative'>
                        <div 
                          className={
                            'text-ellipsis py-2 overflow-hidden ' +
                            (
                              ix==0 ? 'text-left --px-3' : 
                              ix<item.length-1 ? 
                              'flex flex-row justify-center text-center px-3' : 
                              'text-right px-0 sticky right-0 '
                            )
                          }
                        >
                        {
                          chat.renderers?.[ix] ? 
                            chat.renderers[ix]({item: cell}) : 
                            default_renderer({item: cell}) as any
                        }
                        </div>
                      </td> 
                    )
                  )
                }
              </tr>
            )
          )
        }
        </tbody>
      </table>
    </div>
  )
}