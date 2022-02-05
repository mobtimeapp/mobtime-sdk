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
  console.error('must specify timer id with --timer=<timerid>');
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


(new Mobtime)
  .usingSocket(new Socket(timerId, {
    secure,
    domain,
  }))
  .then((timer) => {
    let tickHandle = null;

    timer.events.on(Message.MOB_UPDATE, () => {
      logGroup('Mob', [
        ['new', timer.mob().newItems()],
        ['changed', timer.mob().changedItems()],
        ['removed', timer.mob().removedItems()],
        ['list', timer.mob().items().map(m => m.name)],
      ]);
    });

    timer.events.on(Message.GOALS_UPDATE, () => {
      logGroup('Goals', [
        ['new', timer.goals().newItems()],
        ['changed', timer.goals().changedItems()],
        ['removed', timer.goals().removedItems()],
        ['list', timer.goals().items().map(g => `[${g.completed ? 'x' : ' '}] ${g.text}`)],
      ]);
    });

    timer.events.on(Message.SETTINGS_UPDATE, () => {
      logGroup('Settings', [
        ['changed', timer.settings().changedItems()],
        ['all', timer.settings().items()],
      ]);
    });

    const timerTick = () => {
      const total = timer.timer().remainingMilliseconds();
      console.log(`Timer: ${millisecondsToMMSS(total)}`);

      if (total <= 0) {
        timer.timer().complete().commit();
      }
    };

    timer.events.on(Message.TIMER_START, () => {
      console.log('Timer Started: ', millisecondsToMMSS(timer.getState().timer.duration));
      clearInterval(tickHandle);
      tickHandle = setInterval(timerTick, 250);
    });

    timer.events.on(Message.TIMER_UPDATE, () => {
    });

    timer.events.on(Message.TIMER_PAUSE, () => {
      clearInterval(tickHandle);
      timerTick();
      console.log('timer:paused')
    });

    timer.events.on(Message.TIMER_COMPLETE, () => {
      clearInterval(tickHandle);
      timerTick();
      console.log('timer:completed')
    });

    console.log('timer connected');

    timer.timer().start().commit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });
