require('dotenv').config();
const { getRiesgosAction } = require('./actions/riesgos.actions');

async function test() {
  console.log("Testing getRiesgosAction...");
  const res = await getRiesgosAction({ fichaIds: ['cmul86vlj001eumqg483s3p08'], tamano: 1000 });
  console.log(JSON.stringify(res, null, 2));
}

test().catch(console.error);
