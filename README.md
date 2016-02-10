# HLTV Scorebot

[![Join the chat at https://gitter.im/andrewda/hltv-scorebot](https://badges.gitter.im/andrewda/hltv-scorebot.svg)](https://gitter.im/andrewda/hltv-scorebot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Codacy Badge](https://api.codacy.com/project/badge/grade/52d5dd690f734a32b47b9cdc58b558b6)](https://www.codacy.com/app/dassonville-andrew/hltv-scorebot)

## Introduction

This version of hltv-scorebot is much like @Nols1000's [original version](https://github.com/Nols1000/hltv-scorebot) created back in May of 2015. It is packed full of features, but was never updated to the newest version of HLTV's scorebot. I created this version to be more of a wrapper to HLTV, and to incorporate all of the features available with the new scorebot.

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
- `getPlayersOnline()`
    - returns a list of all players connected
- `getPlayerByName(name)`
- `on(event, callback)`
    - `event`
       - `time`
          - `callback: function(time) [int]`
          - updates game clock every second 
          - freeze timer is **experimental**
       - `score`
          - `callback: function(score) [Object]`
          - `score`
             - `currentMap` / `mapScores`
                - `firstHalf`
                   - `ctTeamDbId`: the id of the CT team
                   - `ctScore`: the score of the CT team after (or during) the first half
                   - `tTeamDbId`: the id of the T team
                   - `tScore`: the score of the T team after (or during) the first half
                - `secondHalf`
                   - `ctTeamDbId`: the id of the CT team
                   - `ctScore`: the score of the CT team after (or during) the second half
                   - `tTeamDbId`: the id of the T team
                   - `tScore`: the score of the T team after (or during) the second half
                - `overtime`
                   - `ctTeamDbId`: the id of the CT team
                   - `ctScore`: the score of the CT team after (or during) the overtime
                   - `tTeamDbId`: the id of the T team
                   - `tScore`: the score of the T team after (or during) the overtime
                - `live`: whether the map is being played or not
                - `liveLog`: requirements returned by HLTV
                - `map`: the map being played
                - `currentCTTeam`: the id of the CT team
                - `currentTTeam`: the id of the T team
                - `currentCtScore`: the score of the CT team
                - `currentTScore`: the score of the T team
                - `mapOrdinal`: the map number being played (e.g. Map 2 of a Best of Three)
             - `listid`: the game's listid
             - `wins`
             - `matchLive`: whether the match is live or not
       - `kill`
          - `callback: function(kill) [Object]`
          - `kill`
             - `killer`
                - [Player]
             - `victim`
                - [Player]
             - `weapon`: the weapon used
             - `headshot`: whether the kill was with a headshot, boolean
       - `bombPlanted`
          - `callback: function(player) [Object]`
          - `player`
             - [Player]
       - `bombDefused`
          - `callback: function(player) [Object]`
          - `player`
             - [Player]
       - `roundStart`
          - `callback: function()`
       - `roundEnd`
          - `callback: function(end) [Object]`
          - `end`
             - `score`
                - `ct`: the CT score
                - `t`: the T score
             -  `winner`: the team that won
             -  `winType`: how the team won
             -  `knifeRound`: if we think the round was a knife round (>5 kills)
       - `playerJoin`
          - `callback: function(player) [Object]`
          - `player`
             - `playerName`: the player's name
       - `playerQuit`
          - `callback: function(player) [Object]`
          - `player`
             - [Player]
       - `mapChange`
          - `callback: function(map) [Object]`
          - `map`
             - `map`: the new map
       - `restart`
          - `callback: function()`


## Examples

To be done
