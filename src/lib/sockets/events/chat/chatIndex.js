const sendMsg = require("./chatEvents/sendMsg");

// Sends a message to a room
exports.sendMsg = function(io, socketId, msg) {
    sendMsg(io, socketId, msg);
}