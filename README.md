# HLTV Livescore

[![NPM Version][npm-img]][npm-url]
[![Downloads][downloads-img]][npm-url]
[![Build][travis-img]][travis-url]
[![Codacy][codacy-img]][codacy-url]
[![Steam Donate][steam-donate-img]][steam-donate-url]

## Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Methods](#methods)
- [Events](#events)
- [Classes](#classes)
- [Enums](#enums)
- [Examples](#examples)

## Introduction

This module is based on [@Nols1000](https://github.com/Nols1000)'s [original version](https://github.com/Nols1000/hltv-scorebot), created back in May of 2015. It is packed full of features, but was never updated to the newest version of HLTV's scorebot. The purpose of this version is to be more of a wrapper for HLTV, and to incorporate all of the features available with the new scorebot.

## Getting Started

**Install with npm:**
```bash
$ npm install hltv-livescore
```

**Usage:**
```javascript
var Livescore = require('hltv-livescore');
var live = new Livescore({
    listid: 2299033
});

live.on('kill', function(data) {
    console.log(data.killer.name, 'killed', data.victim.name, 'with', data.weapon, data.headshot ? '(headshot)' : '');
});
```

## Methods

### Constructor([options])
- `options` - An optional object containing some of the following options
    - `listid` - The game's listid
    - `url` - The URL to listen on. Defaults to `http://scorebot2.hltv.org`
    - `port` - The port to listen on. Defaults to `10022`

Constructs a new `Livescore`. You will be automatically connected to the HLTV scorebot server. The game with the specified `listid` will be automatically started if provided. If not provided, you must specify them using them using the `start()` method.

### start([options][, callback])
- `options` - An optional object containing some of the following options
    - `listid` - The game's listid
- `callback` - An optional callback.

Start the game with the specified `listid`. If provided in the Constructor, the `listid` is not required. An error will be thrown if you are not connected to the HLTV scorebot server before calling this method.

### getPlayers(callback)
- `callback` - Required. Called with an object of players
    - `players` - An object containing all the players connected to the server, with their name as the key

Retrieve all players connected to the server.

### getTeams(callback)
- `callback` - Required. Called with an object of players
    - `teams` - An object containing both teams connected to the server

Retrieve both teams connected to the server.

### setTime(time)
- `time` - Required. The time to set the scoreboard to (in seconds)

Set the scoreboard to a new time.

### getTime(callback)
- `callback` - Required. Called with the remaining time
    - `time` - The time remaining in seconds as displayed on the scoreboard

Retrieve the time remaining.

## Events

Events emit an object containing the parameters listed under each event.

### connected

Emitted when we successfully connect to the HLTV Socket.io server.

### started

Emitted immediately before the first `scoreboard` event is emitted.

### log
- `log` - The log given to us by HLTV since the last log was emitted

Emitted whenever HLTV feels like giving us logs (after kills, round events, etc).

### time
- `seconds` - The time displayed on the timer in seconds

Emitted every time the timer on the scoreboard is updated.

### scoreboard
- `teams` - An object containing the two teams' objects
- `map` - The current map
- `bombPlanted` - `true` if the bomb is planted
- `currentRound` - The current round number

Emitted whenever HLTV sends us a scoreboard update. The scoreboard may not be any different from the last update.

### kill
- `killer` - The player object of the killer
- `victim` - The player object of the victim
- `weapon` - The weapon used
- `headshot` - `true` if the kill was a headshot

Emitted after every kill.

### suicide
- `player` - The player object of the suicider

Emitted after a player commits suicide.

### bombPlanted
- `player` - The player object of the bomb planter

Emitted when the bomb is planted.

### bombDefused
- `player` - The player object of the bomb defuser

Emitted when the bomb is defused.

### roundStart
- `round` - The round number.

Emitted at the start of every round.

### roundEnd
- `teams` - The list of teams
- `winner` - The team that won
- `winType` - How the team won
- `knifeRound` - If we think the round was a knife round (>=5 knife kills)

Emitted at the end of every round.

### playerJoin
- `playerName` - The player's name

Emitted when a player joins the server.

### playerQuit
- `player` - The player object of the player who quit

Emitted when a player leaves the server.

### mapChange
- `map` - The new map

Emitted when the map is changed.

### restart

Emitted when the score is restarted

## Classes

### Player
- `steamid` - A [SteamID](https://github.com/DoctorMcKay/node-steamid) object
- `hltvid` - The player's HLTV id
- `name` - The player's username
- `alive` - `true` if the player is alive
- `money` - The player's in-game money
- `rating` - The player's HLTV rating for this game
- `kills` - The player's total kills
- `assists` - The player's total assists
- `deaths` - The player's total deaths
- `team` - The player's [Team](#team) class

Example:

```
Player {
    steamid: [Object],
    hltvid: 11654,
    name: 'almazer1',
    alive: true,
    money: 12300,
    rating: 1.16,
    kills: 19,
    assists: 4,
    deaths: 17,
    team: [Object]
}
```

### Team
- `id` - The team's HLTV id
- `name` - The team's name
- `score` - The team's score
- `side` - The team's side (ESide)
- `players` - An array of the team's [Player](#player) classes
- `history` - The team's round history

Example:

```
Team {
    id: 6921,
    name: 'Vesuvius',
    score: 16,
    side: 1,
    players: [Array],
    history: [Object]
}
```

### Round
- `type` - How the round ended for this team (ERoundType)
- `round` - The round number

Example:

```
Round {
    type: 6
    round: 12
}
```

## Enums

There are numerous enums available for your use. All enums are located in the `/resources/` directory.

### EOption

Primarily for internal use. Specifies options about the module.

### ERoundType

Specifies how a team ended the round.

### ESide

Specifies team constants.

## Examples

- [CSGOScoreBot (Reddit Live Threads)](https://github.com/andrewda/CSGOScoreBot)

<!-- Badge URLs -->

[codacy-img]:       https://img.shields.io/codacy/grade/2af21149af4445768438cb611c76f310.svg?style=flat-square
[codacy-url]:       https://www.codacy.com/app/dassonville-andrew/hltv-livescore
[downloads-img]:    https://img.shields.io/npm/dm/hltv-livescore.svg?style=flat-square
[downloads-url]:    https://www.npmjs.com/package/hltv-livescore
[npm-img]:          https://img.shields.io/npm/v/hltv-livescore.svg?style=flat-square
[npm-url]:          https://www.npmjs.com/package/hltv-livescore
[travis-img]:       https://img.shields.io/travis/andrewda/hltv-livescore.svg?style=flat-square
[travis-url]:       https://travis-ci.org/andrewda/hltv-livescore
[steam-donate-img]: https://img.shields.io/badge/donate-Steam-lightgrey.svg?style=flat-square
[steam-donate-url]: https://steamcommunity.com/tradeoffer/new/?partner=132224795&token=HuEE9Mk1
