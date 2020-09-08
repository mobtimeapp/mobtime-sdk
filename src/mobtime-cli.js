import process from 'process';
import WebSocket from 'ws';

console.log('mobtime-sdk', process.argv);

const timerId = process.argv[process.argv.length - 1];
const mobtimeUrl = `wss://dev.mobti.me/${timerId}`;

const socket = new WebSocket(mobtimeUrl);

socket.on('open', () => {
  console.log(`Connected to ${mobtimeUrl}`);
  socket.send(JSON.stringify({type:'client:new'}));
});

socket.on('message', (data) => {
  console.log('> ', data);
});
