function Scoreboard(scoreboard) {
    this.map = scoreboard.mapName;
    this.bombPlanted = !!scoreboard.bombPlanted;
    this.currentRound = parseInt(scoreboard.currentRound);

    this.teams = {};
}

module.exports = Scoreboard;
