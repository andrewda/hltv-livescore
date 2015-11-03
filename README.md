# HLTV Scorebot

## Getting started

**Get the module with the npm:**

Coming soon

**Using HLTV-Scorebot:**

```javascript
var Scorebot = require('hltv-scorebot');
var sb = new Scorebot();
sb.connect('http://scorebot2.hltv.org', 10022, 383258, 2298994);

sb.on('kill', function(data) {
    console.log(data.killer.name, 'killed', data.victim.name, 'with', data.weapon, data.headshot ? '(headshot)' : '');
});
```

## Methods

- `connect(url, port, matchid, listid)`
    - `url` the ip of the scorebot server (def. `http://scorebot.hltv.org`).
    - `port` the port of the scorebot server (def. `10023`).
    - `matchid` identifier for the wanted match. [andrewda](https://github.com/andrewda) made a module to get the matchid <https://github.com/andrewda/hltv-live-games>
    - `listid` secondary identifier for the wanted match. It can be found in the URL immediatly after `/match/` or on the HLTV page when the game goes live.
       - The list id for http://www.hltv.org/match/2298994-maxandrelax-arcade-dngit-2000-weekly-cup-24 would be 2298994.
- `playersOnline()`
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
       - `bombplanted`
          - `callback: function(player) [Object]`
          - `player`
             - [Player]
       - `bombdefused`
          - `callback: function(player) [Object]`
          - `player`
             - [Player]
       - `roundstart`
          - `callback: function()`
       - `roundend`
          - `callback: function(end) [Object]`
          - `end`
             - `score`
                - `ct`: the CT score
                - `t`: the T score
             -  `winner`: the team that won
             -  `winType`: how the team won
       - `playerjoin`
          - `callback: function(player) [Object]`
          - `player`
             - `playerName`: the player's name
       - `playerquit`
          - `callback: function(player) [Object]`
          - `player`
             - [Player]
       - `mapchange`
          - `callback: function(map) [Object]`
          - `map`
             - `map`: the new map
       - `restart`
          - `callback: function()`


## Examples

To be done
