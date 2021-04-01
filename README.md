# Mobtime SDK

A commandline interface and SDK for [mobtime](https://mobti.me).

## Command-line

 - [ ] `mobtime [timer-id] init [options]` to create a timer
   - Options:
     - [x] `--mob="name"` to add names to mob, can be set multiple times
     - [x] `--goal="goal text"` to add goals, can be set multiple times
     - [ ] `--setting="[key]:[value]"` to set a setting, can be set multiple times
     - [ ] `--config="path to json file"` to load mob, goals, and settings from a file
       - `{ mob: [], goals: [], settings: {} }`
 - [x] `mobtime [timer-id] add-member [name of person]`
 - [ ] `mobtime [timer-id] start [options]` to start the timer
   - `--duration=[minutes]` to specify the number of minutes to run the timer for
 - [ ] `mobtime [timer-id] pause` to pause the timer
 - [ ] `mobtime [timer-id] cycle` to cycle the mob
 - [ ] `mobtime [timer-id] randomize` to randomize the mob order
 - [ ] `mobtime [timer-id] serialize` to output the json to rebuild this timer, can be used like `mobtime foo serialize > my-mob.json`
 - [ ] General options to support
   - [ ] `--domain="mobti.me"` to support special domains, like `dev.mobti.me`


## SDK

 - [x] Can connect to timer
 - [ ] Can listen for timer events
   - [x] Timer ownership changes
   - [x] Mob changes
   - [x] Goals changes
   - [x] Setting Changes
   - [x] New client connects `client:new`
   - [ ] Timer starts `timer:start`
   - [ ] Timer pauses `timer:pause`
   - [ ] Timer completes `timer:complete`
 - [ ] Can detect when timer does not exist (connection is owner, and no timer information)
 - [ ] Can issue commands
   - [ ] `Mobtime#setMob(mob)` to immutably set the mob array
   - [ ] `Mobtime#setGoals(goals)` to immutably set the goals array
   - [ ] `Mobtime#setSettings(settings)` to immutably set the settings object
   - [ ] `Mobtime#timerStart(milliseconds)` to start the timer
   - [ ] `Mobtime#timerPause()` to pause the timer
   - [ ] `Mobtime#timerComplete()` to notify all users that the timer should complete
   - [ ] `Mobtime#timerComplete()` to notify all users that the timer should complete
