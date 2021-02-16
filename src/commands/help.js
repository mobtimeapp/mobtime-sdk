const setup = () => {};

const run = () => {
  console.log('mobtime [command] [...arguments]');
  console.log();
  console.log(' mobtime init --timerId=[timer slug]');
  console.log(' mobtime help');
};

const teardown = () => {};

export const help = {
  setup,
  run,
  teardown,
};
