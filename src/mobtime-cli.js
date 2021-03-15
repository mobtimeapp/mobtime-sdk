import process from "process";
import getopts from "getopts";

import Mobtime from "./sdk/index";
import * as Commands from "./commands";

const args = getopts(process.argv.slice(2), {
  alias: {
    help: "h"
  },
  default: {
    domain: "mobti.me",
    secure: true,
    timerId: null,
    mob: "",
    goals: "",
    timerDuration: ""
  }
});

const timerId = args._[0];
const commandName = args._[1];

const timer = new Mobtime(timerId, {
  domain: args.domain,
  secure: args.secure == "true"
});

const command = Commands[commandName] || Commands.help;
if (!command) {
  console.log("Command not found");
  process.exit(1);
}

const props = { args, timer };

Promise.resolve(null)
  .then(() => command.setup(props))
  .then(() => command.run(props))
  .catch(err => {
    console.error("ERROR", err);
  })
  .finally(() => command.teardown(props))
  .finally(() => process.exit(0));
