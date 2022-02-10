import { Mobtime, Message, nodeWebsocket } from "./sdk/index.js";

const millisecondsToMMSS = totalMilliseconds => {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString();
  const seconds = (totalSeconds - minutes * 60).toString();
  return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
};

const timerFlag = process.argv.find(a => a.startsWith("--timer="));
if (!timerFlag) {
  console.error("must specify mobtime id with --timer=<timerid>");
  process.exit(0);
}
const timerId = timerFlag.split("=")[1];

const domainFlag = process.argv.find(a => a.startsWith("--domain="));
const domain = domainFlag ? domainFlag.split("=")[1] : "mobti.me";

const secure = !process.argv.find(a => a === "--insecure");

const logGroup = (title, logs) => {
  console.log(`== ${title} ===============`);
  console.log();
  logs.forEach(data => console.log(...[].concat(data)));
  console.log();
};

/**
 * @param {Mobtime} mobtime
 * @return {PromiseLike<any>}
 */
const example = mobtime => {
  let tickHandle = null;

  mobtime.on(Message.MOB_UPDATE, () => {
    logGroup("Mob", [
      ["new", mobtime.mob().newItems()],
      ["changed", mobtime.mob().changedItems()],
      ["removed", mobtime.mob().removedItems()],
      [
        "list",
        mobtime
          .mob()
          .items()
          .map(m => m.name),
      ],
    ]);
  });

  mobtime.on(Message.GOALS_UPDATE, () => {
    logGroup("Goals", [
      ["new", mobtime.goals().newItems()],
      ["changed", mobtime.goals().changedItems()],
      ["removed", mobtime.goals().removedItems()],
      [
        "list",
        mobtime
          .goals()
          .items()
          .map(g => `[${g.completed ? "x" : " "}] ${g.text}`),
      ],
    ]);
  });

  mobtime.on(Message.SETTINGS_UPDATE, () => {
    logGroup("Settings", [
      ["changed", mobtime.settings().changedItems()],
      ["all", mobtime.settings().items()],
    ]);
  });

  let lastTime = "";
  const timerTick = () => {
    if (!mobtime.timer().isRunning()) return;

    const total = mobtime.timer().remainingMilliseconds();
    const time = millisecondsToMMSS(total);
    if (time === lastTime) return;
    console.log(`Timer: ${time}`);
    lastTime = time;

    if (total <= 0) {
      mobtime
        .timer()
        .complete()
        .commit();
    }
  };

  mobtime.on(Message.TIMER_START, () => {
    console.log(
      "Timer Started: ",
      millisecondsToMMSS(mobtime.timer().items().duration),
    );
  });

  mobtime.on(Message.TIMER_UPDATE, () => {});

  mobtime.on(Message.TIMER_PAUSE, () => {
    console.log("timer:paused");
  });

  mobtime.on(Message.TIMER_COMPLETE, () => {
    clearInterval(tickHandle);
    timerTick();
    console.log("timer:completed");
  });

  tickHandle = setInterval(timerTick, 250);

  console.log("timer connected");
};

new Mobtime()
  .usingSocket(
    nodeWebsocket(timerId, {
      secure,
      domain,
    }),
  )
  .then(mobtime => mobtime.ready())
  .then(example)
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
