import { Mobtime } from './sdk/mobtime.js';
import { Socket } from './sdk/socket.node.js';
import { Message } from './sdk/message.js';

const millisecondsToMMSS = (totalMilliseconds) => {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString();
  const seconds = (totalSeconds - (minutes * 60)).toString();
  return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
};

const timerFlag = process.argv.find(a => a.startsWith('--timer='));
if (!timerFlag) {
  console.error('must specify mobtime id with --timer=<timerid>');
  process.exit(0);
}
const timerId = timerFlag.split('=')[1];

const domainFlag = process.argv.find(a => a.startsWith('--domain='));
const domain = domainFlag
  ? domainFlag.split('=')[1]
  : 'mobti.me';

const secure = !Boolean(process.argv.find(a => a === '--insecure'))

const logGroup = (title, logs) => {
  console.log(`== ${title} ===============`);
  console.log();
  logs.forEach((data) => console.log(...([].concat(data))));
  console.log();
};


(new Mobtime())
  .usingSocket(new Socket(timerId, {
    secure,
    domain,
  }))
  .then((mobtime) => {
    let tickHandle = null;

    mobtime.events.on(Message.MOB_UPDATE, () => {
      logGroup('Mob', [
        ['new', mobtime.mob().newItems()],
        ['changed', mobtime.mob().changedItems()],
        ['removed', mobtime.mob().removedItems()],
        ['list', mobtime.mob().items().map(m => m.name)],
      ]);
    });

    mobtime.events.on(Message.GOALS_UPDATE, () => {
      logGroup('Goals', [
        ['new', mobtime.goals().newItems()],
        ['changed', mobtime.goals().changedItems()],
        ['removed', mobtime.goals().removedItems()],
        ['list', mobtime.goals().items().map(g => `[${g.completed ? 'x' : ' '}] ${g.text}`)],
      ]);
    });

    mobtime.events.on(Message.SETTINGS_UPDATE, () => {
      logGroup('Settings', [
        ['changed', mobtime.settings().changedItems()],
        ['all', mobtime.settings().items()],
      ]);
    });

    const timerTick = () => {
      const total = mobtime.timer().remainingMilliseconds();
      console.log(`Timer: ${millisecondsToMMSS(total)}`);

      if (total <= 0) {
        mobtime.timer().complete().commit();
      }
    };

    mobtime.events.on(Message.TIMER_START, () => {
      console.log('Timer Started: ', millisecondsToMMSS(mobtime.timer().items().duration));
      clearInterval(tickHandle);
      tickHandle = setInterval(timerTick, 250);
    });

    mobtime.events.on(Message.TIMER_UPDATE, () => {
    });

    mobtime.events.on(Message.TIMER_PAUSE, () => {
      clearInterval(tickHandle);
      timerTick();
      console.log('timer:paused')
    });

    mobtime.events.on(Message.TIMER_COMPLETE, () => {
      clearInterval(tickHandle);
      timerTick();
      console.log('timer:completed')
    });

    console.log('timer connected');

    mobtime.timer().start().commit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });
