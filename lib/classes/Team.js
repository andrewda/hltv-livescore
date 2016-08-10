var Round = require('./Round.js');

function Team(team) {
    this.id = team.id;

    this.name = team.name;
    this.score = parseInt(team.score);
    this.side = team.side;

    this.players = team.players;
    this.history = fixHistory(team.history);
}

function fixHistory(h) {
    return h.firstHalf.concat(h.secondHalf).map(function(round) {
        return new Round(round);
    });
}

module.exports = Team;
