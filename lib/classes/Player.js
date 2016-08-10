var SteamID = require('steamid');

function Player(player) {
    this.steamid = fixSteamid(player.steamId);
    this.hltvid = parseInt(player.dbId);

    this.name = player.name;
    this.alive = !!player.alive;
    this.money = parseInt(player.money);

    this.rating = parseFloat(player.rating);
    this.kills = parseInt(player.score);
    this.assists = parseInt(player.assists);
    this.deaths = parseInt(player.deaths);

    this.team = player.team;
}

function fixSteamid(steamid) {
    try {
        return new SteamID(steamid);
    } catch (e) {
        return new SteamID('STEAM_' + steamid)
    }
}

module.exports = Player;
