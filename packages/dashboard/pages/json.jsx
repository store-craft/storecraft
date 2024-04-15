import { Inspector } from 'react-inspector'
import { chromeLight, chromeDark } from 'react-inspector'

const Page = ({}) => {
  console.log(chromeLight)
  return (
<div className='w-full h-full text-3xl'>
  {/* <JSONPretty id="json-pretty" 
              data={test} 
              theme={theme} /> */}
  <Inspector theme={{...chromeLight, TREENODE_FONT_SIZE: '14px' }} data={test}  />
</div>
  )
}

export default Page

const test = {
  "tags": [
      "company_nintendo",
      "filter:condition_like-new",
      "filter:condition_cart",
      "filter:condition_used",
      "filter:console_ds",
      "filter:type_game",
      "filter:region_PAL",
      "filter:genre_fps"
  ],
  "media": [
      "https://upload.wikimedia.org/wikipedia/en/a/a3/Call_of_Duty_4_-_Modern_Warfare_%28Nintendo_DS%29_Coverart.png",
      "https://firebasestorage.googleapis.com/v0/b/wushwushgames-14ee2.appspot.com/o/images%2F20230322_162655_1680548077491.png?alt=media&token=0d8dd15a-e585-45c5-b66d-ad24fffd76a8"
  ],
  "createdAt": 1680548104948,
  "updatedAt": 1680556155344,
  "qty": 1,
  "handle": "call-of-duty-4-ds-game-only-",
  "price": 30,
  "collections": [
      "nintendo-ds-games"
  ],
  "video": "https://www.youtube.com/watch?v=ppR4a6LGk-4",
  "related_products": [
      {
          "updatedAt": 1680545822967,
          "title": "Birds of prey (Game Only)",
          "createdAt": 1680545668329,
          "collections": [
              "nintendo-ds-games"
          ],
          "handle": "birds-of-prey-game-only-",
          "tags": [
              "filter:condition_used",
              "filter:condition_like-new",
              "filter:condition_cart",
              "filter:console_ds",
              "filter:region_PAL",
              "filter:type_game",
              "filter:genre_fps",
              "company_nintendo"
          ],
          "search": [
              "birds-of-prey-game-only-",
              "birds of prey (game only)",
              "birds",
              "of",
              "prey",
              "(game",
              "only)",
              "used",
              "like-new",
              "cart",
              "ds",
              "PAL",
              "game",
              "fps",
              "nintendo",
              "filter:condition_used",
              "filter:condition_like-new",
              "filter:condition_cart",
              "filter:console_ds",
              "filter:region_PAL",
              "filter:type_game",
              "filter:genre_fps",
              "company_nintendo",
              "tag:filter:condition_used",
              "tag:filter:condition_like-new",
              "tag:filter:condition_cart",
              "tag:filter:console_ds",
              "tag:filter:region_PAL",
              "tag:filter:type_game",
              "tag:filter:genre_fps",
              "tag:company_nintendo",
              "nintendo-ds-games",
              "col:nintendo-ds-games",
              "price:30"
          ],
          "media": [
              "https://m.media-amazon.com/images/W/IMAGERENDERING_521856-T1/images/I/51J-iEXXRUL._AC_UF1000,1000_QL80_.jpg",
              "https://firebasestorage.googleapis.com/v0/b/wushwushgames-14ee2.appspot.com/o/images%2F20230322_162721_1680545637462.png?alt=media&token=36d0ffe7-3a57-4f81-9508-46638268b273"
          ],
          "video": "https://www.youtube.com/watch?v=_2Xy8PDa1BY",
          "qty": 1,
          "price": 30
      },
      {
          "tags": [
              "company_nintendo",
              "filter:condition_like-new",
              "filter:condition_cart",
              "filter:condition_used",
              "filter:console_ds",
              "filter:type_game",
              "filter:region_PAL",
              "filter:genre_fps"
          ],
          "media": [
              "https://upload.wikimedia.org/wikipedia/en/a/a3/Call_of_Duty_4_-_Modern_Warfare_%28Nintendo_DS%29_Coverart.png",
              "https://firebasestorage.googleapis.com/v0/b/wushwushgames-14ee2.appspot.com/o/images%2F20230322_162655_1680548077491.png?alt=media&token=0d8dd15a-e585-45c5-b66d-ad24fffd76a8"
          ],
          "createdAt": 1680548104948,
          "updatedAt": 1680556155344,
          "qty": 1,
          "handle": "call-of-duty-4-ds-game-only-",
          "price": 30,
          "collections": [
              "nintendo-ds-games"
          ],
          "video": "https://www.youtube.com/watch?v=ppR4a6LGk-4",
          "related_products": [
              {
                  "tags": [
                      "filter:condition_used",
                      "filter:condition_like-new",
                      "filter:condition_cart",
                      "filter:console_ds",
                      "filter:region_PAL",
                      "filter:type_game",
                      "filter:genre_fps",
                      "company_nintendo"
                  ],
                  "search": [
                      "birds-of-prey-game-only-",
                      "birds of prey (game only)",
                      "birds",
                      "of",
                      "prey",
                      "(game",
                      "only)",
                      "used",
                      "like-new",
                      "cart",
                      "ds",
                      "PAL",
                      "game",
                      "fps",
                      "nintendo",
                      "filter:condition_used",
                      "filter:condition_like-new",
                      "filter:condition_cart",
                      "filter:console_ds",
                      "filter:region_PAL",
                      "filter:type_game",
                      "filter:genre_fps",
                      "company_nintendo",
                      "tag:filter:condition_used",
                      "tag:filter:condition_like-new",
                      "tag:filter:condition_cart",
                      "tag:filter:console_ds",
                      "tag:filter:region_PAL",
                      "tag:filter:type_game",
                      "tag:filter:genre_fps",
                      "tag:company_nintendo",
                      "nintendo-ds-games",
                      "col:nintendo-ds-games",
                      "price:30"
                  ],
                  "collections": [
                      "nintendo-ds-games"
                  ],
                  "media": [
                      "https://m.media-amazon.com/images/W/IMAGERENDERING_521856-T1/images/I/51J-iEXXRUL._AC_UF1000,1000_QL80_.jpg",
                      "https://firebasestorage.googleapis.com/v0/b/wushwushgames-14ee2.appspot.com/o/images%2F20230322_162721_1680545637462.png?alt=media&token=36d0ffe7-3a57-4f81-9508-46638268b273"
                  ],
                  "qty": 1,
                  "video": "https://www.youtube.com/watch?v=_2Xy8PDa1BY",
                  "createdAt": 1680545668329,
                  "updatedAt": 1680545822967,
                  "title": "Birds of prey (Game Only)",
                  "handle": "birds-of-prey-game-only-",
                  "price": 30
              },
              {
                  "createdAt": 1680547977044,
                  "price": 30,
                  "search": [
                      "quantom-of-solace-ds-game-only-",
                      "quantom of solace ds (game only) ",
                      "quantom",
                      "of",
                      "solace",
                      "ds",
                      "(game",
                      "only)",
                      "nintendo",
                      "like-new",
                      "cart",
                      "used",
                      "game",
                      "PAL",
                      "action",
                      "ds",
                      "company_nintendo",
                      "filter:condition_like-new",
                      "filter:condition_cart",
                      "filter:condition_used",
                      "filter:type_game",
                      "filter:region_PAL",
                      "filter:genre_action",
                      "filter:console_ds",
                      "tag:company_nintendo",
                      "tag:filter:condition_like-new",
                      "tag:filter:condition_cart",
                      "tag:filter:condition_used",
                      "tag:filter:type_game",
                      "tag:filter:region_PAL",
                      "tag:filter:genre_action",
                      "tag:filter:console_ds",
                      "nintendo-ds-games",
                      "col:nintendo-ds-games",
                      "price:30"
                  ],
                  "media": [
                      "https://m.media-amazon.com/images/W/IMAGERENDERING_521856-T1/images/I/513JJbVncjL._AC_.jpg",
                      "https://firebasestorage.googleapis.com/v0/b/wushwushgames-14ee2.appspot.com/o/images%2F20230322_162622_1680547942838.png?alt=media&token=d04db113-ea8c-4c21-be5f-776db6124411"
                  ],
                  "qty": 1,
                  "collections": [
                      "nintendo-ds-games"
                  ],
                  "tags": [
                      "company_nintendo",
                      "filter:condition_like-new",
                      "filter:condition_cart",
                      "filter:condition_used",
                      "filter:type_game",
                      "filter:region_PAL",
                      "filter:genre_action",
                      "filter:console_ds"
                  ],
                  "video": "https://www.youtube.com/watch?v=JyjP_ToizM0",
                  "title": "Quantom of solace Ds (Game Only) ",
                  "updatedAt": 1680547977483,
                  "handle": "quantom-of-solace-ds-game-only-"
              }
          ],
          "search": [
              "call-of-duty-4-ds-game-only-",
              "call of duty 4 ds (game only)",
              "call",
              "of",
              "duty",
              "4",
              "ds",
              "(game",
              "only)",
              "nintendo",
              "like-new",
              "cart",
              "used",
              "ds",
              "game",
              "PAL",
              "fps",
              "company_nintendo",
              "filter:condition_like-new",
              "filter:condition_cart",
              "filter:condition_used",
              "filter:console_ds",
              "filter:type_game",
              "filter:region_PAL",
              "filter:genre_fps",
              "tag:company_nintendo",
              "tag:filter:condition_like-new",
              "tag:filter:condition_cart",
              "tag:filter:condition_used",
              "tag:filter:console_ds",
              "tag:filter:type_game",
              "tag:filter:region_PAL",
              "tag:filter:genre_fps",
              "nintendo-ds-games",
              "col:nintendo-ds-games",
              "price:30"
          ],
          "title": "Call of duty 4 Ds (Game Only)"
      },
      {
          "price": 75,
          "video": "https://www.youtube.com/watch?v=yUAzklNTkUc",
          "search": [
              "yugioh-world-championship-2008-game-only-",
              "yugioh world championship 2008 (game only)",
              "yugioh",
              "world",
              "championship",
              "2008",
              "(game",
              "only)",
              "used",
              "like-new",
              "cart",
              "ds",
              "game",
              "PAL",
              "rpg",
              "nintendo",
              "filter:condition_used",
              "filter:condition_like-new",
              "filter:condition_cart",
              "filter:console_ds",
              "filter:type_game",
              "filter:region_PAL",
              "filter:genre_rpg",
              "company_nintendo",
              "tag:filter:condition_used",
              "tag:filter:condition_like-new",
              "tag:filter:condition_cart",
              "tag:filter:console_ds",
              "tag:filter:type_game",
              "tag:filter:region_PAL",
              "tag:filter:genre_rpg",
              "tag:company_nintendo",
              "nintendo-ds-games",
              "col:nintendo-ds-games",
              "price:75"
          ],
          "collections": [
              "nintendo-ds-games"
          ],
          "qty": 1,
          "updatedAt": 1680545943916,
          "title": "Yugioh world championship 2008 (Game Only)",
          "createdAt": 1680544804222,
          "handle": "yugioh-world-championship-2008-game-only-",
          "media": [
              "https://firebasestorage.googleapis.com/v0/b/wushwushgames-14ee2.appspot.com/o/images%2Fyugi_1680544759589.png?alt=media&token=3ddaf01c-26a6-4036-ade3-c8b27975f4e9",
              "https://firebasestorage.googleapis.com/v0/b/wushwushgames-14ee2.appspot.com/o/images%2F20230322_162634_1680544765277.png?alt=media&token=19e85cff-999d-4282-826f-73d69df1757d"
          ],
          "tags": [
              "filter:condition_used",
              "filter:condition_like-new",
              "filter:condition_cart",
              "filter:console_ds",
              "filter:type_game",
              "filter:region_PAL",
              "filter:genre_rpg",
              "company_nintendo"
          ]
      }
  ],
  "search": [
      "call-of-duty-4-ds-game-only-",
      "call of duty 4 ds (game only)",
      "call",
      "of",
      "duty",
      "4",
      "ds",
      "(game",
      "only)",
      "nintendo",
      "like-new",
      "cart",
      "used",
      "ds",
      "game",
      "PAL",
      "fps",
      "company_nintendo",
      "filter:condition_like-new",
      "filter:condition_cart",
      "filter:condition_used",
      "filter:console_ds",
      "filter:type_game",
      "filter:region_PAL",
      "filter:genre_fps",
      "tag:company_nintendo",
      "tag:filter:condition_like-new",
      "tag:filter:condition_cart",
      "tag:filter:condition_used",
      "tag:filter:console_ds",
      "tag:filter:type_game",
      "tag:filter:region_PAL",
      "tag:filter:genre_fps",
      "nintendo-ds-games",
      "col:nintendo-ds-games",
      "price:30"
  ],
  "title": "Call of duty 4 Ds (Game Only)"
}