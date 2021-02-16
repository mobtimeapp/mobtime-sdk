import { MESSAGE_TYPES } from "../mobtime-sdk";

const setup = async ({ timer }) => {
  await timer.connect();
};

const run = async ({ args, timer }) => {
  const isNewTimer = await timer.isNewTimer();
  if (!isNewTimer) {
    console.log("Cannot initialize timer, it is already in use");
    return;
  }

  const mob = [].concat(args.mob || []).map(name => ({
    id: Math.random()
      .toString(36)
      .slice(2),
    name
  }));

  if (mob.length > 0) {
    timer.mobUpdate(mob);
  }

  console.log("Timer is available");

  console.log(timer.getUrl("http"));
  console.log("Waiting for your connection before disconnecting...");

  await timer.waitForMessageType(MESSAGE_TYPES.TIMER_OWNERSHIP);
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
