import process from 'process';
import WebSocket from 'ws';

console.log('mobtime-sdk', process.argv);

const timerId = process.argv[process.argv.length - 1];

class Mobtime {
  constructor(mobtimeUrl) {
    const socket = new WebSocket(mobtimeUrl);

    this.callbacks = {
      'timer:ownership': [],
      'mob:update': [],
      'goals:update': [],
      'settings:update': [],
    };

    socket.on('open', () => {
      console.log(`Connected to ${mobtimeUrl}`);
      socket.send(JSON.stringify({type:'client:new'}));
    });

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      console.log('> ', message);
      for(const callback of (this.callbacks[message.type] || [])) {
        callback();
      }
    });
  }
  
  addEventListener(type, callback){
    if (!(type in this.callbacks)) {
      return false;
    }

    this.callbacks[type].push(callback);

    return true;
  }

}

const timer = new Mobtime(`wss://dev.mobti.me/${timerId}`);
timer.addEventListener('timer:ownership', () => {
  console.log('!!!!!! someone set the ownership !!!!!!');
});
