# Mobtime SDK

A mobtime NodeJS/browser SDK

## Example

```javascript
import { Mobtime, Message, nodeWebsocket } from "@mobtime/sdk";

const onMobUpdate = (message, mobtime) => {
  const mob = mobtime.mob();
  const toString = m => m.name;

  console.log("mob updated", {
    changed: mob.changedItems().map(toString),
    removed: mob.removedItems().map(toString),
    all: mob.items().map(toString),
  });
};

const onGoalsUpdate = (message, mobtime) => {
  const goals = mobtime.goals();
  const toString = g => `[${g.completed ? "X" : " "}] ${g.text}`;

  console.log("goals updated", {
    changed: mob.changedItems().map(toString),
    removed: mob.removedItems().map(toString),
    all: mob.items().map(toString),
  });
};

const main = mobtime =>
  new Promise((resolve, reject) => {
    let intervalHandle = null;

    const onClose = closeFn => () => {
      clearInterval(intervalHandle);
      closeFn();
    };

    mobtime.on(Message.MOB_UPDATE, onMobUpdate);
    mobtime.on(Message.GOALS_UPDATE, onGoalsUpdate);
    mobtime.on("close", onClose(resolve));
    mobtime.on("error", onClose(reject));

    mobtime
      .mob()
      .add("Alex", "gh:mrozbarry") // Add or update mobber with id 'gh:mrozbarry'
      .add("Debbie") // Add 'Debbie', don't worry about updating if it already exists
      .commit(); // Send the changes to the server

    mobtime
      .goals()
      .add("Write great code", "good-day") // Add or update the goal with id 'good-day'
      .add("Be the best team") // Add this goal, don't worry about updating if it already exists
      .commit(); // Send the changes to the server

    mobtime
      .settings()
      .change("duration", 5 * 60 * 1000) // Set duration to 60 seconds
      .change("mobOrder", "driver,navigator") // Set mob order by string, or...
      .change("mobOrder", ["driver", "navigator"]) // ...with an array of strings (overrides the first)
      .commit(); // Send the changes to the server

    mobtime
      .timer() // the timer object is a little different, you can only commit one thing at a time, since the timer is atomic
      .start(4 * 60 * 1000) // Start the timer with 4 minutes (as milliseconds)
      .start() // Start the timer with the default duration from settings
      .commit();

    mobtime
      .timer()
      .pause() // Pause the timer
      .resume() // This resume will actually override the pause command
      .commit(); // Commit only sends resume

    setInterval(() => {
      if (!mobtimer.timer().isRunning()) return;

      const remaining = mobtime.timer().remainingMilliseconds();

      console.log("Timer countdown", remaining);
      if (remaining === 0) {
        mobtime
          .timer()
          .complete()
          .commit();
      }
    }, 250);
  });

new Mobtime()
  .withSocket(
    nodeWebsocket(
      // there is also a browserWebsocket export, which works the same
      "your-timer-id", // as in mobti.me/<your-timer-id>
      {
        domain: "mobti.me", // defaults to mobti.me, but can be configured to another server (ie localhost)
        secure: true, // defaults to true for wss://, false results in ws://
      },
    ),
  )
  .then(main)
  .catch(error => {
    console.error("mobtime connection failed", error);
    process.exit(1);
  })
  .then(() => process.exit(0));
```

### A note on immutability

The mob, goals, settings, and timer classes are immutable, meaning that when you cue up changes, those changes all exist in isolation.
What this means is this will not work as expected:

```javascript
mobtime.mob().add("Joe");
mobtime.mob().add("Jane");
mobtime.mob().commit();
```

In reality, this will behave as if you didn't make those changes.
Instead, you should either track the updated `Mob` reference, or use chaining.

```javascript
// Tracking the mob
let mob = mobtime.mob();
mob = mob.add("Joe");
mob = mob.add("Jane");
mob.commit();

// OR with chaining
mobtime
  .mob()
  .add("Joe")
  .add("Jane")
  .commit();
```

## Testing

Mobtime is essential an input/output blackbox, which means you can safely test outputs given a set of inputs.
The only kicker is that inputs are a combination of user input (or calling functions) and responding to socket events.
Luckily, you can make a custom test socket.

### Test sockets

#### Use `@mobtime/sdk/support/socket.js`

```javascript
import { Mobtime, Message } from "@mobtime/sdk";
import { Socket } from "@mobtime/sdk/support/socket.js";

new Mobtime().usingSocket(Socket.use()).then(mobtime => {
  const { socket } = mobtime; // Get your test socket

  // do your testing...
});
```

#### Roll your own

You can also extend `BaseSocket` if you do not like how the default support socket is set up.

```javascript
import { BaseSocket } from "@mobtime/sdk";

export class TestSocket extends BaseSocket {
  constructor(timerId) {
    super(timerId);
  }

  //  Whatever you need in here...
}

TestSocket.use = timerId => Promise.resolve(new TestSocket(timerId));
```
