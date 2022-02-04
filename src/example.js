import { Mobtime } from './sdk/mobtime.js';
import { WebSocket } from './sdk/socket.node.js';
import { Message } from './sdk/message.js';

const millisecondsToMMSS = (totalMilliseconds) => {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString();
  const seconds = (totalSeconds - (minutes * 60)).toString();
  return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
};

const timerFlag = process.argv.find(a => a.startsWith('--timer='));
if (!timerFlag) {
  console.error('must specify timer id with --timer=<timerid>');
  process.exit(0);
}
const timerId = timerFlag.split('=')[1];

const domainFlag = process.argv.find(a => a.startsWith('--domain='));
const domain = domainFlag
  ? domainFlag.split('=')[1]
  : 'mobti.me';


(new Mobtime)
  .usingSocket(new WebSocket(timerId, {
    secure: true,
    domain,
  }))
  .then((timer) => {
    timer.events.on(Message.MOB_UPDATE, () => {
      console.log('Mobbers: ', timer.mob().items().map(m => m.name).join(', '));
    });
    timer.events.on(Message.GOALS_UPDATE, () => {
      console.log('Goals:');
      timer.goals().items().forEach((g) => {
        console.log(` [${g.completed ? 'X' : ' '}] ${g.text}`);
      });
    });
    timer.events.on(Message.SETTINGS_UPDATE, () => {
      console.log('Settings: ', JSON.stringify(timer.getState().settings));
    });
    timer.events.on(Message.TIMER_START, () => {
      console.log('Timer Started: ', millisecondsToMMSS(timer.getState().timer.duration));
    });
    timer.events.on(Message.TIMER_UPDATE, () => {
      console.log('Timer Already Going: ', millisecondsToMMSS(timer.getState().timer.duration));
    });
    timer.events.on(Message.TIMER_PAUSE, () => {
      console.log('Timer Paused: ', millisecondsToMMSS(timer.getState().timer.duration));
    });
    console.log('timer connected');
  })
  .catch(() => {
    process.exit(-1);
  });
