var ERoundType = require('../../resources/ERoundType.js');

function Round(round) {
    this.type = ERoundType[round.type];
    this.round = parseInt(round.roundOrdinal);
}

module.exports = Round;
