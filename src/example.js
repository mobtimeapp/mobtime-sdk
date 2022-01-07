import { Mobtime } from './sdk/mobtime.js';
import { Message } from './sdk/message.js';

(new Mobtime('foo', {
  secure: true,
  domain: 'mobti.me',
}))
  .connect()
  .then((timer) => timer.ready())
  .then((timer) => {
    timer.events.on(Message.TYPES.MOB_UPDATE, () => {
      console.log('Mobbers: ', timer.getState().mob.map(m => m.name).join(', '));
    });
    timer.events.on(Message.TYPES.GOALS_UPDATE, () => {
      console.log('Goals:');
      timer.getState().goals.forEach((g) => {
        console.log(` [${g.completed ? 'X' : ' '}] ${g.text}`);
      });
    });
    timer.events.on(Message.TYPES.SETTINGS_UPDATE, () => {
      console.log('Settings: ', JSON.stringify(timer.getState().settings));
    });
    console.log('timer connected');
  });
