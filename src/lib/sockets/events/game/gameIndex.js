const startGame = require('./gameEvents/startGame');
const submitMarker = require('./gameEvents/submitMarker');

exports.startGame = function(io, socket) {
    startGame(io, socket.id);
}

exports.submitMarker = function(io, socket, subbedMarker) {
    submitMarker(io, socket, subbedMarker);
}
