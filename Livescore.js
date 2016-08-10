module.exports = require('./lib/');

module.exports.Classes = {
    Player: require('./lib/classes/Player.js'),
    Team: require('./lib/classes/Team.js'),
    Round: require('./lib/classes/Round.js')
};

module.exports.Enums = {
    EOption: require('./resources/EOption.js'),
    ERoundType: require('./resources/ERoundType.js'),
    ESide: require('./resources/ESide.js')
};
