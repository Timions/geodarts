// Logger
const log = require('./../../../../../logging/log')(__filename); 

// Redis
const db = require('../../../../database/redis');

// Socket Helper
const { getRoomsFromClient } = require('../../../socketHelper');

/*
 *  1. Raum bekommen, in dem der Socket drin ist
 *  2. Schauen, ob man eine Nachricht senden kann
 *  3. Nachricht senden
 */
module.exports = async(io, socketId, msg) => {
    log.info('Socket ' + socketId + ' wants to send a message.');

    let roomId = await getRoomFromSocket(io, socketId);

    // Schauen, ob es einen Fehler bei der Raumsuche gab
    if(roomId != 0) {
        let canSend = await checkCanSendMsg(roomId, socketId);

        // Schauen, ob man die Nachricht senden kann/darf
        if(canSend) {
            sendMsgToRoom(io, roomId, socketId, msg);

        }
    }
}

/*
 *  Ermittelt die Raum ID von dem Raum in der der angegebene Socket drin ist
 */
let getRoomFromSocket = async(io, socketId) => {
    log.info('Get Room from Socket ' + socketId + ' to send a message.');

    // Alle Räume bekommen, mit denen der Client connected ist
    let rooms = await getRoomsFromClient(io, socketId);

    // Socket sollte normalerweise in 2 Räumen sein: In seinem privaten(socketId) und in dem öffentlichen 'Game' Raum
    let index = rooms.indexOf(socketId);
    rooms.splice(index, 1);

    if(rooms.length != 1) {
        log.warn('Socket ' + socketId + ' is not in one room [' + rooms.length + '].');
        return 0;
    }

    // Raum der übrig geblieben ist ausgeben
    log.info('Room found with id ' + rooms[0] + '.');
    return rooms[0];
};

/*
 *  Prüft, ob man eine Nachricht im angegebenen Raum schreiben kann/darf
 */
let checkCanSendMsg = async(roomId, socketId) => {
    log.info('Check if ' + socketId + ' can send the message to room ' + roomId + '.');

    // Raum von Redis finden
    let room = await db.getObject(roomId);

    // Raum exestiert nicht
    if(!room) {
        log.warn('The room ' + roomId + ' where ' + socketId + ' wants to send a message does not exist.');
        return false;
    }

    // Spiel hat noch nicht angefangen
    if(room.hasStarted == 'false') {
        log.warn('The room ' + roomId + ' where ' + socketId + ' wants to send a message has not started yet.');
        return false;
    }

    // Spieler kann Nachricht senden
    log.info('Socket ' + socketId + ' can send a message to room ' + roomId + '.');
    return true;
}

/*
 *  Send a message to a given room
 */
let sendMsgToRoom = async(io, roomId, socketId, msg) => {
    log.info('Try sending message "' + msg + '" from socket ' + socketId + ' to room ' + roomId + '.' );

    // Spielernamen bekommen um message zu senden
    log.info('Get Playername from Socket ' + socketId + '.');
    let player = await db.getObject(roomId + ':player:' + socketId);

    // Spieler exestiert nicht mehr
    if(!player) {
        log.warn('The socket ' + socketId + ' does not exists in db.');
        return;
    }

    // Nachricht kann gesendet werden
    log.info('Sending now Message from socket ' + socketId + ' to room ' + roomId + '.');
    io.to(roomId).emit('receiveMsg', { playername: player.playername, msg: msg});
}