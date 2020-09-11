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

console.log("mobtime-sdk");

const timer = new Mobtime(`wss://${args.domain}/${timerId}`);

timer.connect().then(() => {
  console.log("Connected to timer");
});
timer.isNewTimer().then(isNew => {
  if (!isNew) return;
  console.log("Timer is new");
  console.log(`Get your timer here: https://${args.domain}/${timerId}`);
});
