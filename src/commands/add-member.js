const setup = async ({ timer }) => {
  await timer.connect();
};

const run = async ({ args, timer }) => {
  await timer.mobAdd(args.name);
};

const teardown = async ({ timer }) => {
  await timer.disconnect();
  return 0;
};

export const addMember = {
  setup,
  run,
  teardown,
};
