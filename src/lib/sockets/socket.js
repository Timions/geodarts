const room = require('./events/room/roomIndex');
const game = require('./events/game/gameIndex');
const chat = require('./events/chat/chatIndex');

module.exports = function(io) {
    io.on('connection', function(socket) {
        /**
         * Rooms
         */
        socket.on('createRoom', function(data) {
            room.createRoom(io, socket, data)
        });

        socket.on('joinRoom', function(data) {
            room.joinRoom(io, socket, data)
        });
    
        socket.on('checkRoom', function(roomId) {
            room.checkRoom(socket, roomId);
        })

        socket.on('disconnecting', function() {
            room.disconnecting(io, socket);
        });
    
        /**
         * Game
         */
        socket.on('startGame', function() {
            game.startGame(io, socket);
        });

        
        socket.on('submitMarker', function(marker) {
            game.submitMarker(io, socket, marker);
        });

        /**
         * Chat
         */
        socket.on('sendMsg', function(msg) {
            console.log('message sent');
            chat.sendMsg(io, socket.id, msg);
        });
    });
}
