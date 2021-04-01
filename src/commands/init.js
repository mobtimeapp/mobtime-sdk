import { MESSAGE_TYPES } from "../sdk";

const setup = async ({ timer }) => {
  await timer.connect();
};

const run = async ({ args, timer }) => {
  const isNewTimer = await timer.isNewTimer();
  if (!isNewTimer) {
    console.log("Cannot initialize timer, it is already in use");
    return;
  }

  console.log("Timer is available");

  console.log(timer.getUrl("http"));
  console.log("Waiting for your connection before disconnecting...");

  await timer.waitForMessageType(MESSAGE_TYPES.TIMER_OWNERSHIP);

  const promises = [];

  const mob = [].concat(args.mob || []);
  for (let name of mob) {
    promises.push(timer.mobAdd(name));
  }

  const goals = [].concat(args.goal || []);
  for (let text of goals) {
    promises.push(timer.goalAdd(text));
  }

  await Promise.all(promises);
};

const teardown = async ({ timer }) => {
  await timer.disconnect();
  return 0;
};

export const init = {
  setup,
  run,
  teardown
};
