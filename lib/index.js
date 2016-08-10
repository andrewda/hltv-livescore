var io = require('socket.io-client');
var EE = require('events').EventEmitter;
var inherits = require('util').inherits;

var CONNECTION = 'http://scorebot2.hltv.org';
var PORT = 10022;

var that;

function Livescore(options) {
    this.connected = false;

    this.matchid = options.matchid;
    this.listid = options.listid;
    this.url = options.url || CONNECTION;
    this.port = options.port || PORT;

    this.socket = io(this.url + ':' + this.port);
    this.reconnect = false;

    this.time = 0;
    this.map;
    this.interval;

    this.scoreboard;

    this.players = {};
    this.teams = {};

    this.kills = 0;
    this.knifeKills = 0;

    this.options = {};

    this.options[Livescore.Enums.EOption['ROUND_TIME']] = options.roundTime || 115; // 105 before update
    this.options[Livescore.Enums.EOption['BOMB_TIME']] = options.bombTime || 40; // 35 before update
    this.options[Livescore.Enums.EOption['FREEZE_TIME']] = options.freezeTime || 15;

    this.socket.on('connect', this._onConnect.bind(this));

    that = this;
}

inherits(Livescore, EE);

Livescore.Enums = require('../Livescore.js').Enums;
Livescore.Classes = require('../Livescore.js').Classes;

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
    this.interval = setInterval(function() {
        this.time = this.time - 1;
        this.emit('time', this.time);
    }.bind(this), 1000);
};

Livescore.prototype.getTime = function(callback) {
    callback(this.time);
};

Livescore.prototype._onConnect = function() {
    if (!this.reconnect) {
        this.socket.on('log', this._onLog.bind(this));
        this.socket.on('scoreboard', this._onScoreboard.bind(this));
    }

    this.socket.emit('readyForMatch', this.listid);
};

Livescore.prototype._onReconnect = function() {
    this.reconnect = true;
    this.socket.emit('readyForMatch', this.listid);
};

Livescore.prototype._onLog = function(logs) {
    this.getPlayers(function(players) {
        if (Object.keys(players).length) {
            logs = JSON.parse(logs).log.reverse();
            logs.forEach(function(log) {
                for (event in log) {
                    that.emit('debug', 'received event: ' + event);

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
                            that['_on' + event](log[event]);
                            break;
                        default:
                            that.emit('debug', 'unrecognized event: ' + event);
                            break;
                    }
                }
            }.bind(this));
        }
    });
};

Livescore.prototype._onScoreboard = function(event) {
    if (!this.connected) {
        this.connected = true;
        this.emit('connected');
    }

    updateGame(event);

    var scoreboard = {
        teams: {},
        map: event.mapName,
        bombPlanted: event.bombPlanted,
        currentRound: event.currentRound
    };

    this.getTeams(function(teams) {
        scoreboard.teams[Livescore.Enums.ESide['TERRORIST']] = teams[Livescore.Enums.ESide['TERRORIST']];
        scoreboard.teams[Livescore.Enums.ESide['COUNTERTERRORIST']] = teams[Livescore.Enums.ESide['COUNTERTERRORIST']];

        that.emit('scoreboard', scoreboard);
    });
};

Livescore.prototype._onKill = function(event) {
    this.getPlayers(function(players) {
        that.emit('kill', {
            killer: players[event.killerName],
            victim: players[event.victimName],
            weapon: event.weapon,
            headshot: event.headShot
        });
    });

    this.kills++;
    if (event.weapon.indexOf('knife') > -1) {
        this.knifeKills++;
    }
};

Livescore.prototype._onSuicide = function(event) {
    this.emit('suicide', {
        playerName: event.playerName,
        playerSide: event.side
    });
};

Livescore.prototype._onBombPlanted = function(event) {
    this.setTime(this.options[Livescore.Enums.EOption['BOMB_TIME']]);

    this.getPlayers(function(players) {
        that.emit('bombPlanted', {
            player: players[event.playerName]
        });
    });
};

Livescore.prototype._onBombDefused = function(event) {
    this.getPlayers(function(players) {
        that.emit('bombDefused', {
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
    var teams = {};

    var winner;
    if (event.winner === 'TERRORIST') {
        winner = Livescore.Enums.ESide['TERRORIST'];
    } else {
        winner = Livescore.Enums.ESide['COUNTERTERRORIST'];
    }

    this.setTime(this.options[Livescore.Enums.EOption["FREEZE_TIME"]]);

    this.getTeams(function(teams) {
        var t = teams[Livescore.Enums.ESide['TERRORIST']];
        var ct = teams[Livescore.Enums.ESide['COUNTERTERRORIST']];

        if (t && ct) {
            t.score = event.terroristScore;
            ct.score = event.counterTerroristScore;

            teams[Livescore.Enums.ESide['TERRORIST']] = t;
            teams[Livescore.Enums.ESide['COUNTERTERRORIST']] = ct;

            // If at least 80% of the kills are knife kills, count it as a knife
            // round. Sometimes players will have pistols on knife rounds and
            // kill teammates after the round is over, so this takes that into
            // account.
            that.emit('roundEnd', {
                teams: teams,
                winner: teams[winner],
                roundType: Livescore.Enums.ERoundType[event.winType],
                knifeRound: (this.knifeKills/this.kills) >= 0.8
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
    this.getPlayers(function(players) {
        that.emit('playerQuit', {
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

function updateGame(scoreboard) {
    var tPlayers = [];
    var ctPlayers = [];

    that.teams[Livescore.Enums.ESide['TERRORIST']] = new Livescore.Classes.Team({
        name: scoreboard.terroristTeamName,
        id: scoreboard.tTeamId,
        score: scoreboard.terroristScore,
        side: Livescore.Enums.ESide['TERRORIST'],
        players: tPlayers,
        history: scoreboard.terroristMatchHistory
    });

    that.teams[Livescore.Enums.ESide['COUNTERTERRORIST']] = new Livescore.Classes.Team({
        name: scoreboard.ctTeamName,
        id: scoreboard.ctTeamId,
        score: scoreboard.counterTerroristScore,
        side: Livescore.Enums.ESide['COUNTERTERRORIST'],
        players: ctPlayers,
        history: scoreboard.ctMatchHistory
    });

    that.getTeams(function(teams) {
        scoreboard.TERRORIST.forEach(function(player) {
            var player = new Livescore.Classes.Player(player);
            player.team = teams[Livescore.Enums.ESide['TERRORIST']];

            that.players[player.name] = player;
            tPlayers.push(player);
        });

        scoreboard.CT.forEach(function(player) {
            var player = new Livescore.Classes.Player(player);
            player.team = teams[Livescore.Enums.ESide['COUNTERTERRORIST']];

            that.players[player.name] = player;
            ctPlayers.push(player);
        });
    });

    that.scoreboard = scoreboard;
}

module.exports = Livescore;
