import 'dotenv/config';


const list = async () => {

  let url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database`;
  
  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json', 
      Authorization: `Bearer ${process.env.CLOUDFLARE_D1_API_TOKEN}`
    }
  };
  
  fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error('error:' + err));  
}


list()