// Logger
const log = require('./../../../../../logging/log')(__filename); 

// Redis
const db = require('../../../../database/redis');

/*
 *  Check if a player can open an url 
 */
module.exports = function(socket, roomId) {
    canJoin(socket, roomId);

}

let canJoin = async function(socket, roomId) {
    log.info('Check if Room with id ' + roomId + ' exists (Join link)');

    let reply = await db.getObject(roomId);

    if(reply != null) {
        log.info('Room[' + roomId + '] exists.');
        log.info('Room[' + roomId + '] check if Game already started.');

        let room = db.getObject(roomId);

        if(room.hasStarted == true) {
            log.info('Room[' + roomId + '] already started.');
            socket.emit('checkRoomAnswer', 3);

        } else {
            log.info('Room[' + roomId + '] has not started a game.');
            socket.emit('checkRoomAnswer', 1);
        }
    } else {
        log.info('Room[' + roomId + '] does not exist (from checkRoom event).');
        socket.emit('checkRoomAnswer', 2);

    }
}