// Logger
const log = require('./../../../../../logging/log')(__filename); 

// Redis
const db = require('../../../../database/redis');

// Room Helper
const { player, playerUpdate } = require('../../../../room/roomHelper');

// Socket Helper
const { getRoomsFromClient } = require('../../../socketHelper');

// Disconnecting
const disconnecting = require('./disconnecting');

/*
 *  1. Disconnect from rooms
 *  2. Check if a socket can join a room
 *  3. Join the room
 *  4. Update Playerlist
 */ 
module.exports = async(io, socket, data) => {
    log.info('Socket[' + socket.id + '] with playername: "' + data.name + '" wants to join Room[' + data.roomId + '].');

    await cleanUpSocketStuff(io, socket, data);

    if(await checkCanJoin(socket, data)) {
        await joinRoomById(io, socket, data);
        await updatePlayersInRoom(io, data.roomId);
    }
};

// Disconnects socket from rooms
let cleanUpSocketStuff = async(io, socket, data) => {
    log.info('Before joining room ' + data.roomId + ' disconnecting socket from old rooms.');
    log.info('Check if socket ' + socket.id + ' has created the room.');

    let reply = await db.getObject(data.roomId + ':creator:' + socket.id);

    // Socket hat den Raum erstellt -> Wurde schon von anderen Räumen vorher disconnected
    if(reply == null) {
        log.info('Socket ' + socket.id + ' has not created the room -> disconnecting from old rooms.');
        await disconnecting(io, socket);

    // Socket hat Raum erstellt
    } else {
        log.info('Socket ' + socket.id + ' has created the room -> not disconnecting from old rooms.');

    }
}

/*
 *  Check if a player can join a given room
 */
let checkCanJoin = async(socket, data) => {
    log.info('Check if the socket ' + socket.id + ' can join the room ' + data.roomId + '.');

    let hasStarted = await db.getValueFromObject(data.roomId, 'hasStarted');

    // Schauen ob der Raum exestiert
    log.info('Check if the room[' + data.roomId + '] exists.');

    if(hasStarted == null) {
        socket.emit('err', 'Room does not exist.');
        log.warn('The room[' + data.roomId + '] the socket[' + socket.id + '] wants to join does not exist.');
        return false;
    }

    log.info('The room[' + data.roomId + '] does exists.');

    // Schauen, ob das Spiel schon angefangen hat
    log.info('Check if the room[' + data.roomId + '] has already started a game.');

    if(hasStarted == 'true') {
        socket.emit('err', 'Game already started.');
        log.warn('The room[' + data.roomId + '] the socket[' + socket.id + '] wants to join has already started a game.');
        return false;
    }


    // Socket can Join the room
    log.info('Socket[' + socket.id + '] can join the room[' + data.roomId + '].');
    return true;
};

let joinRoomById = async(io, socket, data) => {
    // Von alten Räumen disconnecten, damit die events nicht mehr empfangen werden
    let rooms = await getRoomsFromClient(io, socket.id);

    for(let r = 0; r < rooms.length; r++) {
        if(rooms[r] != socket.id) {
            socket.leave(rooms[r]);
        }
    }

    // Joining room
    log.info('Socket[' + socket.id + '] is joining room[' + data.roomId + '].');
    io.of('/').adapter.remoteJoin(socket.id, data.roomId);

    // Create Player
    player.playername = data.name;
    player.socketId = socket.id;

    // DB
    log.info('Inserting socket[' + data.roomId + ':player:' + socket.id + '] into DB.');
    db.insertObject(data.roomId + ':player:' + socket.id, player);

    log.info('Socket[' + socket.id + '] joined room ' + data.roomId + '.');
}

/*
 *  Updates Players in a given Room
 */
let updatePlayersInRoom = function(io, roomId) {
    playerUpdate(io, roomId);
    
}