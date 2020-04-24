import { Aria2 } from '../main';

async function main() {

  const aria2 = new Aria2({
    host: '192.168.0.241',
    port: 6800,
    secure: false,
    path: '/jsonrpc',
    secret: 'SECRET'
  });

  await aria2.connect();
  const uri = 'https://storage.don.red/download/ubuntu-20.04-live-server-amd64.iso?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=Bscefq2J99vuUjZz%2F20200424%2F%2Fs3%2Faws4_request&X-Amz-Date=20200424T115117Z&X-Amz-Expires=432000&X-Amz-SignedHeaders=host&X-Amz-Signature=274b09035b5a490941a01fd58adafc0e5bca442f094c182896237cadd498feab';
  // const response = await aria2.addUri([uri]);
  // const response = await aria2.tellActive();
  const response = await aria2.tellWaiting(0, 10).catch(err => console.error(err));
  console.log('Response:', JSON.stringify(response));
  // aria2.disconnect();

}

main();
