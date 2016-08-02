# HLTV Scorebot

[![Join the chat at https://gitter.im/andrewda/hltv-scorebot](https://badges.gitter.im/andrewda/hltv-scorebot.svg)](https://gitter.im/andrewda/hltv-scorebot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/52d5dd690f734a32b47b9cdc58b558b6)](https://www.codacy.com/app/dassonville-andrew/hltv-scorebot)

## Introduction

This version of hltv-scorebot is much like @Nols1000's [original version](https://github.com/Nols1000/hltv-scorebot), created back in May of 2015. It is packed full of features, but was never updated to the newest version of HLTV's scorebot. The purpose of this version is to be more of a wrapper for HLTV, and to incorporate all of the features available with the new scorebot.

## Getting started

**Install with npm:**
```
npm install andrewda/hltv-scorebot
```

**Using HLTV-Scorebot:**
```javascript
var Scorebot = require('hltv-scorebot');
var sb = new Scorebot();
sb.connect(383564, 2299033);

sb.on('kill', function(data) {
    console.log(data.killer.name, 'killed', data.victim.name, 'with', data.weapon, data.headshot ? '(headshot)' : '');
});
```

## Methods

- `connect(matchid, listid, url [optional], port [optional], oldtime [optional])`
    - `matchid` identifier for the wanted match. [andrewda](https://github.com/andrewda) made a module to get the matchid <https://github.com/andrewda/hltv-live-games>
    - `listid` secondary identifier for the wanted match. It can be found in the URL immediatly after `/match/` or on the HLTV page when the game goes live.
       - The list id for http://www.hltv.org/match/2298994-maxandrelax-arcade-dngit-2000-weekly-cup-24 would be 2298994.
    - `url` [OPTIONAL] the ip of the scorebot server (default `http://scorebot2.hltv.org`).
    - `port` [OPTIONAL] the port of the scorebot server (default `10022`).
    - `oldtime` [OPTIONAL] if we want to use the old match time (default `false`)
- `getPlayers()`
    - returns all players connected
- `getTeams()`
    - returns both teams connected
- `on(event, callback)`

## Events
- `time`
    - `seconds`: the time displayed on the timer in seconds
- `scoreboard`
    - `TERRORIST` / `CT`: an array of players on the specified team
    - `terroristMatchHistory` / `ctMatchHistory`
        - `firstHalf` / `secondHalf` / `overtime`
            - `type`: the type of round
            - `roundOrdinal`: the round number
    - `bombPlanted`: `true` if the bomb is planted
    - `mapName`: the map being played
    - `currentRound`: the current round number
    - `terroristTeamName`: the id of the T team
    - `ctTeamName`: the id of the CT team
    - `terroristScore`: the score of the T team
    - `counterTerroristScore`: the score of the CT team
    - `tTeamId`: the id of the T team
    - `ctTeamId`: the id of the CT team
- `kill`
    - `killer`: a player object of the killer
    - `victim`: a player object of the victim
    - `weapon`: the weapon used
    - `headshot`: `true` if the kill was a headshot
- `bombPlanted`
    - `player`: a player object of the bomb planter
- `bombDefused`
    - `player`: a player object of the bomb defuser
- `roundStart`
- `roundEnd`
    - `teams`: a list of
    - `winner`: the team that won
    - `winType`: how the team won
    - `knifeRound`: if we think the round was a knife round (>5 kills)
- `playerJoin`
    - `playerName`: the player's name
- `playerQuit`
    - `player`: a player object of the player who quit
- `mapChange`
    - `map`: the new map
- `restart`

## Examples

To be done
