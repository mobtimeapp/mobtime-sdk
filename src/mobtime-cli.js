import process from "process";
import Mobtime from "./mobtime-sdk";
import getopts from "getopts";

const args = getopts(process.argv.slice(2), {
  alias: {
    help: "h"
  },
  default: {
    domain: "mobti.me",
    timerId: null,
    mob: "",
    goals: "",
    timerDuration: ""
  }
});

const timerId = args._[0];
const action = args._[1];

console.log("mobtime-sdk", { timerId, action });

const timer = new Mobtime(`wss://${args.domain}/${timerId}`);

timer.addMessageListener("*", event => {
  console.log("[TIMER]", event);
});

timer
  .connect()
  .then(() => {
    console.log("Connected to timer");
  })
  .then(() => timer.isNewTimer())
  .then(isNew => {
    console.log("Timer is new?", isNew);
    console.log(`Get your timer here: https://${args.domain}/${timerId}`);
  })
  .then(() => timer.disconnect());
