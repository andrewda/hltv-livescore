var io = require('socket.io-client');
var EE = require('events').EventEmitter;
var inherits = require('util').inherits;

var CONNECTION = 'https://scorebot-secure.hltv.org';
var PORT = 443;

function Livescore(options) {
    options = options || {};

    this.connected = false;
    this.started = false;

    this.listid = JSON.stringify({
        token: '',
        listId: options.listid
    }) || null;

    this.url = options.url || CONNECTION;
    this.port = options.port || PORT;

    this.socket = io(this.url + (this.port === 443 ? '' : ':' + PORT));

    this.time = 0;
    this.map;
    this.interval;

    this.scoreboard;

    this.players = {};
    this.teams = {};

    this.kills = 0;
    this.knifeKills = 0;

    this._lastLog;

    this.options = {};

    this.options[Livescore.Enums.EOption['ROUND_TIME']] = options.roundTime || 115; // 105 before update
    this.options[Livescore.Enums.EOption['BOMB_TIME']] = options.bombTime || 40; // 35 before update
    this.options[Livescore.Enums.EOption['FREEZE_TIME']] = options.freezeTime || 15;

    this.socket.on('connect', this._onConnect.bind(this));
}

inherits(Livescore, EE);

Livescore.Enums = require('../Livescore.js').Enums;
Livescore.Classes = require('../Livescore.js').Classes;

Livescore.prototype.start = function(options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    options = options || {};

    this.listid = JSON.stringify({
        token: '',
        listId: options.listid
    }) || null;

    if (this.connected) {
        this.socket.emit('readyForMatch', this.listid);

        if (callback) {
            callback(null);
        }
    } else if (callback) {
        callback(new Error('Not yet connected to HLTV'));
    }
};

Livescore.prototype.disconnect = function() {
    this.connected = false;
    this.socket.disconnect();
};

Livescore.prototype.getPlayers = function(callback) {
    callback(this.players);
};

Livescore.prototype.getTeams = function(callback) {
    callback(this.teams);
};

Livescore.prototype.setTime = function(time) {
    clearInterval(this.interval);

    this.time = time;
    this.interval = setInterval(() => {
        this.time = this.time - 1;
        this.emit('time', this.time);
    }, 1000);
};

Livescore.prototype.getTime = function(callback) {
    callback(this.time);
};

Livescore.prototype._onConnect = function() {
    if (!this.connected) {
        this.connected = true;

        this.socket.on('log', this._onLog.bind(this));
        this.socket.on('scoreboard', this._onScoreboard.bind(this));

        this.emit('connected');
    }

    if (this.listid) {
        this.socket.emit('readyForMatch', this.listid);
    }
};

Livescore.prototype._onReconnect = function() {
    this.socket.emit('readyForMatch', this.listid);
};

Livescore.prototype._onLog = function(logs) {
    try {
        logs = JSON.parse(logs).log.reverse();
    } catch (err) {
        logs = null;

        this.emit('debug', err);
    }

    if (logs && logs !== this._lastLog) {
        this.emit('log', logs);

        this.getPlayers((players) => {
            if (Object.keys(players).length && logs) {
                logs.forEach((log) => {
                    var event;

                    for (event in log) {
                        this.emit('debug', 'received event: ' + event);

                        switch (event) {
                            case 'Kill':
                            case 'Assist':
                            case 'BombPlanted':
                            case 'BombDefused':
                            case 'RoundStart':
                            case 'RoundEnd':
                            case 'PlayerJoin':
                            case 'PlayerQuit':
                            case 'MapChange':
                            case 'MatchStarted':
                            case 'Restart':
                            case 'Suicide':

                                if (typeof this['_on' + event] === 'function')
                                  this['_on' + event](log[event]);
                                break;
                            default:
                                this.emit('debug', 'unrecognized event: ' + event);
                                break;
                        }
                    }
                });
            }
        });

        this._lastLog = logs;
    }
};

Livescore.prototype._onScoreboard = function(event) {
    if (!this.started) {
        this.started = true;
        this.emit('started');
    }

    this._updateGame(event);

    this.getTeams((teams) => {
        var scoreboard = new Livescore.Classes.Scoreboard(event);

        scoreboard.teams[Livescore.Enums.ESide['TERRORIST']] = teams[Livescore.Enums.ESide['TERRORIST']];
        scoreboard.teams[Livescore.Enums.ESide['COUNTERTERRORIST']] = teams[Livescore.Enums.ESide['COUNTERTERRORIST']];

        this.emit('scoreboard', scoreboard);
    });
};

Livescore.prototype._onKill = function(event) {
    this.getPlayers((players) => {
        this.emit('kill', {
            killer: players[event.killerName],
            victim: players[event.victimName],
            weapon: event.weapon,
            headshot: event.headShot
        });
    });

    this.kills++;
    if (event.weapon.indexOf('knife') > -1 || event.weapon.indexOf('bayonet') > -1) {
        this.knifeKills++;
    }
};

Livescore.prototype._onSuicide = function(event) {
    this.getPlayers((players) => {
        this.emit('suicide', {
            player: players[event.playerName]
        });
    });
};

Livescore.prototype._onAssist = function(event) {

};

Livescore.prototype._onBombPlanted = function(event) {
    this.setTime(this.options[Livescore.Enums.EOption['BOMB_TIME']]);

    this.getPlayers((players) => {
        this.emit('bombPlanted', {
            player: players[event.playerName]
        });
    });
};

Livescore.prototype._onBombDefused = function(event) {
    this.getPlayers((players) => {
        this.emit('bombDefused', {
            player: players[event.playerName]
        });
    });
};

Livescore.prototype._onMatchStarted = function(event) {
    this.emit('matchStart', event);
};

Livescore.prototype._onRoundStart = function() {
    this.setTime(this.options[Livescore.Enums.EOption["ROUND_TIME"]]);
    this.emit('roundStart', {
        round: this.scoreboard.currentRound
    });

    this.kills = 0;
    this.knifeKills = 0;
};

Livescore.prototype._onRoundEnd = function(event) {
    var winner = Livescore.Enums.ESide[event.winner === 'TERRORIST' ? 'TERRORIST' : 'COUNTERTERRORIST'];

    this.setTime(this.options[Livescore.Enums.EOption["FREEZE_TIME"]]);

    this.getTeams((teams) => {
        if (Object.keys(teams).length) {
            teams[Livescore.Enums.ESide['TERRORIST']].score = event.terroristScore;
            teams[Livescore.Enums.ESide['COUNTERTERRORIST']].score = event.counterTerroristScore;

            // If at least 80% of the kills are knife kills, count it as a knife
            // round. Sometimes players will have pistols on knife rounds and
            // kill teammates after the round is over, so this takes that into
            // account.
            this.emit('roundEnd', {
                teams: teams,
                winner: teams[winner],
                roundType: Livescore.Enums.ERoundType[event.winType],
                knifeRound: (this.knifeKills / this.kills) >= 0.8
            });
        }
    });
};

Livescore.prototype._onPlayerJoin = function(event) {
    this.emit('playerJoin', {
        playerName: event.playerName
    });
};

Livescore.prototype._onPlayerQuit = function(event) {
    this.getPlayers((players) => {
        this.emit('playerQuit', {
            player: players[event.playerName]
        });
    });
};

Livescore.prototype._onRestart = function() {
    this.emit('restart');
};

Livescore.prototype._onMapChange = function(event) {
    this.emit('mapChange', event);
};

Livescore.prototype._updateGame = function(scoreboard) {
    var tPlayers = [];
    var ctPlayers = [];

    this.teams[Livescore.Enums.ESide['TERRORIST']] = new Livescore.Classes.Team({
        name: scoreboard.terroristTeamName,
        id: scoreboard.tTeamId,
        score: scoreboard.terroristScore,
        side: Livescore.Enums.ESide['TERRORIST'],
        players: tPlayers,
        history: scoreboard.terroristMatchHistory
    });

    this.teams[Livescore.Enums.ESide['COUNTERTERRORIST']] = new Livescore.Classes.Team({
        name: scoreboard.ctTeamName,
        id: scoreboard.ctTeamId,
        score: scoreboard.counterTerroristScore,
        side: Livescore.Enums.ESide['COUNTERTERRORIST'],
        players: ctPlayers,
        history: scoreboard.ctMatchHistory
    });

    this.getTeams((teams) => {
        scoreboard.TERRORIST.forEach((pl) => {
            var player = new Livescore.Classes.Player(pl);
            player.team = teams[Livescore.Enums.ESide['TERRORIST']];

            this.players[player.name] = player;
            tPlayers.push(player);
        });

        scoreboard.CT.forEach((pl) => {
            var player = new Livescore.Classes.Player(pl);
            player.team = teams[Livescore.Enums.ESide['COUNTERTERRORIST']];

            this.players[player.name] = player;
            ctPlayers.push(player);
        });
    });

    this.scoreboard = scoreboard;
};

module.exports = Livescore;
