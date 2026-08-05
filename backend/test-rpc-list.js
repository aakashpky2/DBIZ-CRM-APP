const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const https = require('https');

const url = process.env.SUPABASE_URL + '/rest/v1/?apikey=' + process.env.SUPABASE_SERVICE_ROLE_KEY;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const paths = Object.keys(json.paths).filter(p => p.startsWith('/rpc/'));
    console.log('Available RPCs:', paths);
  });
}).on('error', (err) => console.error(err));
