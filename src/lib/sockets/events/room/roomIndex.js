const createRoom = require('./roomEvents/createRoom');
const joinRoom = require('./roomEvents/joinRoom');
const checkRoom = require('./roomEvents/checkRoom');
const disconnecting = require('./roomEvents/disconnecting');

// Create a room
exports.createRoom = function(io, socket, data) {
    createRoom(io, socket, data);
};

// Join a room
exports.joinRoom = function(io, socket, data) {
    joinRoom(io, socket, data);
};

// Check if a room exists
exports.checkRoom = function(socket, roomId) {
    checkRoom(socket, roomId);
};

// Client disconnecting
exports.disconnecting = function(io, socket) {
    disconnecting(io, socket);
}