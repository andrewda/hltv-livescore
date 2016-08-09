# HLTV Livescore

[![NPM Version][npm-img]][npm-url]
[![Downloads][downloads-img]][npm-url]
[![Codacy][codacy-img]][codacy-url]
[![Gitter][gitter-img]][gitter-url]
[![License][license-img]][license-url]

## Introduction

This module is based on [@Nols1000](https://github.com/Nols1000)'s [original version](https://github.com/Nols1000/hltv-scorebot), created back in May of 2015. It is packed full of features, but was never updated to the newest version of HLTV's scorebot. The purpose of this version is to be more of a wrapper for HLTV, and to incorporate all of the features available with the new scorebot.

## Getting started

**Install with npm:**
```bash
$ npm install hltv-livescore
```

**Usage:**
```javascript
var Livescore = require('hltv-livescore');
var live = new Livescore({
    matchid: 383564,
    listid: 2299033
});

live.on('kill', function(data) {
    console.log(data.killer.name, 'killed', data.victim.name, 'with', data.weapon, data.headshot ? '(headshot)' : '');
});
```

## Methods

### getPlayers()

Returns all players connected.

### getTeams()

Returns both teams connected.

## Events

Events emit an object containing the parameters listed under each event.

### time
- `seconds` - The time displayed on the timer in seconds

Emitted every time the timer on the scoreboard is updated.

### scoreboard
- `TERRORIST` / `CT` - An array of players on the specified team
- `terroristMatchHistory` / `ctMatchHistory`
    - `firstHalf` / `secondHalf` / `overtime`
        - `type` - The type of round
        - `roundOrdinal` - The round number
- `bombPlanted` - `true` if the bomb is planted
- `mapName` - The map being played
- `currentRound` - The current round number
- `terroristTeamName` - The id of the T team
- `ctTeamName` - The id of the CT team
- `terroristScore` - The score of the T team
- `counterTerroristScore` - The score of the CT team
- `tTeamId` - The id of the T team
- `ctTeamId` - The id of the CT team

Emitted whenever HLTV sends us a scoreboard update. The scoreboard may not be any different from the last update.

### kill
- `killer` - The player object of the killer
- `victim` - The player object of the victim
- `weapon` - The weapon used
- `headshot` - `true` if the kill was a headshot

Emitted after every kill.

### bombPlanted
- `player` - The player object of the bomb planter

Emitted when the bomb is planted.

### bombDefused
- `player` - The player object of the bomb defuser

Emitted when the bomb is defused.

### roundStart

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

## Examples

To be completed

<!-- Badge URLs -->

[codacy-img]:    https://img.shields.io/codacy/grade/2af21149af4445768438cb611c76f310.svg?style=flat-square
[codacy-url]:    https://www.codacy.com/app/dassonville-andrew/hltv-livescore
[downloads-img]: https://img.shields.io/npm/dm/hltv-livescore.svg?style=flat-square
[downloads-url]: https://www.npmjs.com/package/hltv-livescore
[npm-img]:       https://img.shields.io/npm/v/hltv-livescore.svg?style=flat-square
[npm-url]:       https://www.npmjs.com/package/hltv-livescore
[gitter-img]:    https://img.shields.io/gitter/room/hltv-livescore/Lobby.svg?style=flat-square
[gitter-url]:    https://gitter.im/hltv-livescore/Lobby
[license-img]:   https://img.shields.io/npm/l/hltv-livescore.svg?style=flat-square
[license-url]:   https://opensource.org/licenses/MIT
