var io = require('socket.io-client');
var EE = require('events').EventEmitter;
var inherits = require('util').inherits;

var TERRORIST = 0;
var COUNTERTERRORIST = 1;

var OPTION_MATCHROUNDTIME = 0;
var OPTION_MATCHBOMBTIME = 1;
var OPTION_MATCHFREEZETIME = 2;

var players = {};

var playersAvailable = false;

function Scorebot() {
    this.ip = "";
    this.port = 0;
    this.matchid = 0;
    this.listid = 0;

    this.socket = null;
    this.reconnect = false;

    this.map = "de_dust2";
    this.time = 0;
    this.interval;

    this.options = {};

    this.options[OPTION_MATCHROUNDTIME] = 105;
    this.options[OPTION_MATCHBOMBTIME] = 35;
    this.options[OPTION_MATCHFREEZETIME] = 15;
}

inherits(Scorebot, EE);

Scorebot.prototype.connect = function() {

    this.ip = arguments[0];
    this.port = arguments[1];
    this.matchid = arguments[2];
    this.listid = arguments[3];

    this.socket = io(this.ip + ':' + this.port);

    this.socket.on('connect', this.onConnect.bind(this));
};

Scorebot.prototype.onConnect = function() {
    if (!this.reconnect) {
        this.socket.on('log', this.onLog.bind(this));
        this.socket.on('score', this.onScore.bind(this));
        this.socket.on('scoreboard', this.onScoreboard.bind(this));
    }

    this.socket.emit('readyForMatch', this.listid);
    
    players = {};
};

Scorebot.prototype.playersOnline = function() {
    if (Object.keys(players).length !== 0) {
        return players;
    } else {
        return false;
    }
};

Scorebot.prototype.onReconnect = function() {
    this.reconnect = true;
    this.socket.emit('readyForMatch', this.listid);
};

Scorebot.prototype.onLog = function(logs) {
    if (this.playersOnline()) {
        logs = JSON.parse(logs).log.reverse();
        logs.forEach(function(log) {
            for (event in log) {
                switch (event) {
                case 'Kill':
                    this.onKill(log[event]);
                    break;
                case 'Assist':
                    this.onAssist(log[event]);
                    break;
                case 'BombPlanted':
                    this.onBombPlanted(log[event]);
                    break;
                case 'BombDefused':
                    this.onBombDefused(log[event]);
                    break;
                case 'RoundStart':
                    this.onRoundStart(log[event]);
                    break;
                case 'RoundEnd':
                    this.onRoundEnd(log[event]);
                    break;
                case 'PlayerJoin':
                    this.onPlayerJoin(log[event]);
                    break;
                case 'PlayerQuit':
                    this.onPlayerQuit(log[event]);
                    break;
                case 'MapChange':
                    this.onMapChange(log[event]);
                    break;
                case 'MatchStarted':
                    this.onMatchStarted(log[event]);
                    break;
                case 'Restart':
                    this.onServerRestart(log[event]);
                    break;
                case 'Suicide':
                    this.onSuicide(log[event]);
                    break;
                default:
                	break;
                }
            }
        }.bind(this));
    }
};

Scorebot.prototype.onScore = function(score) {
    this.emit('score', score);
};

Scorebot.prototype.onScoreboard = function(score) {
    playersAvailable = true;
    this.updatePlayers(score.TERRORIST, score.CT, {
        terrorist: { name: score.terroristTeamName, id: score.tTeamId },
        counterterrorist: { name: score.ctTeamName, id: score.ctTeamId }
    });
    this.emit('score');
};

Scorebot.prototype.updatePlayers = function(t, ct, data) {
    t.forEach(function(player) {
        players[player.name] = {
            steamId: player.steamId,
            dbId: player.dbId,
            name: player.name,
            score: player.score,
            deaths: player.deaths,
            assists: player.assists,
            alive: player.alive,
            rating: player.rating,
            money: player.money,
            side: 'TERRORIST',
            team: {
                name: data.terrorist.name,
                id: data.terrorist.id
            }
        };
    });
    
    ct.forEach(function(player) {
        players[player.name] = {
            steamId: player.steamId,
            dbId: player.dbId,
            name: player.name,
            score: player.score,
            deaths: player.deaths,
            assists: player.assists,
            alive: player.alive,
            rating: player.rating,
            money: player.money,
            side: 'CT',
            team: {
                name: data.counterterrorist.name,
                id: data.counterterrorist.id
            }
        };
    });
};

Scorebot.prototype.getPlayerByName = function(name) {
    if (players[name] !== undefined) {
        return players[name];
    } else {
        return false;
    }
};

Scorebot.prototype.onKill = function(event) {
    this.emit('player', this.player);

    this.emit('kill', {
    	killer: this.getPlayerByName(event.killerName),
    	victim: this.getPlayerByName(event.victimName),
    	weapon: event.weapon,
    	headshot: event.headShot
    });
};

Scorebot.prototype.onSuicide = function(event) {
    this.emit('player', this.player);
    
    this.emit('suicide', {
		playerName: event.playerName,
		playerSide: event.side,
    });
};

Scorebot.prototype.onBombPlanted = function(event) {
    this.setTime(this.options[OPTION_MATCHBOMBTIME]);
    this.emit('bombplanted', {
        player: this.getPlayerByName(event.playerName)
    });
};

Scorebot.prototype.onBombDefused = function(event) {
    this.emit('bombdefused', {
        player: this.getPlayerByName(event.playerName)
    });
};

Scorebot.prototype.onMatchStarted = function(event) {
    this.emit('matchstart', event);
};

Scorebot.prototype.onRoundStart = function() {
    this.setTime(this.options[OPTION_MATCHROUNDTIME]);
    this.emit('roundstart');
};

Scorebot.prototype.onRoundEnd = function(event) {
    this.setTime(this.options[OPTION_MATCHFREEZETIME]);
    this.emit('roundend', {
        score: {
            ct: event.counterTerroristScore,
            t: event.terroristScore
        },
        winner: event.winner,
        winType: event.winType
    });
};

Scorebot.prototype.onPlayerJoin = function(event) {
    this.emit('playerjoin', {
        playerName: event.playerName
    });
};

Scorebot.prototype.onPlayerQuit = function(event) {
    this.emit('playerquit', {
        player: this.getPlayerByName(event.playerName)
    });
};

Scorebot.prototype.onServerRestart = function() {
    this.emit('restart');
};

Scorebot.prototype.onMapChange = function(event) {
    this.emit('map', event);
};

Scorebot.prototype.setTime = function(time) {
    clearInterval(this.interval);

    this.time = time;
    this.interval = setInterval(function() {

        this.time = this.time - 1;
        this.emit('time', this.time);
    }.bind(this), 1000);
};

module.exports = Scorebot;