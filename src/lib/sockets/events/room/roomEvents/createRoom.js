// Logger
const log = require('./../../../../../logging/log')(__filename); 

// Redis
const db = require('../../../../database/redis');

// UUID
const uuid = require('uuid');

// Room Helper
const { room } = require('../../../../room/roomHelper');

// Disconnecting
const disconnecting = require('./disconnecting');

// GameTypes
const gameTypes = ['de_cities'];

/*
 *  1. Von anderen Räumen disconnecten
 *  2. Raum generieren
 *  3. Raum in DB speichern
 */ 
module.exports = async(io, socket, data) => {
    log.info('Socket[' + socket.id + '] wants to create a room.');
    await cleanUpSocketStuff(io, socket);

    let room = await generateRoom(socket, data);

    if(room != 0) {
        insertRoom(socket, room);
    }
}

// Disconnects socket from rooms
let cleanUpSocketStuff = async(io, socket) => {
    log.info('Before creating a room -> disconnecting socket from old rooms.');

    await disconnecting(io, socket);
}

/*
 *  Generates a room object
 */
let generateRoom = async(socket, data) => {
    log.info('Gernerate a room.');

    // Schauen, ob ein gameType angegeben wurde
    if(data == undefined) {
        log.warn('Can not create a Room because there is no gameType.');
        socket.emit('err', 'No GameType.');

        return 0;
    }

    // Nur gameType angegeben
    if(data.length > 2) {
        data = { 'gameType': data }
    }

    // Checks if gameType is valid
    room.gameType = data.gameType.toLowerCase();

    for(let t = 0; t < gameTypes.length; t++) {
        if(gameTypes[t] == room.gameType) {

            // Create Room/Game Id
            if(data.roomId == undefined) {
                room.roomId = uuid.v4();

            } else {
                let exists = await db.getObject(data.roomId);

                if(exists == null) {
                    room.roomId = data.roomId;

                } else {
                    socket.emit('err', 'Room with same RoomId already exists.');
                    log.warn('Room[' + data.roomId + '] with same RoomId already exists.');
                    return 0;

                }

            }

            // Id wurde generiert
            log.info('Room generated with roomID: ' + room.roomId + ' and GameType ' + room.gameType + '.');
            return room;
        }
    }

    // Gametype is not valid
    socket.emit('err', 'Unkown GameType.');
    log.warn('Unkown GameType.');

    return 0;
}

/*
 *  Inserts the room to the DB
 */
let insertRoom = async(socket, room) => {
    log.info('Insert new Room[' + room.roomId + '] to DB.');

    // Insert room Object without roomId
    let reply = await db.insertObject(room.roomId, { gameType: room.gameType, hasStarted: room.hasStarted, round: room.round });
    await db.insertObject(room.roomId + ':creator:' + socket.id, {roomId: room.roomId});

    // Send roomId to client to join the game
    if(reply) {
        socket.emit('roomCreated', { roomId: room.roomId });
        log.info('Done creating room with roomID: ' + room.roomId + '.');

    } else {
        socket.emit('err', 'Error while creating a room.');
        log.warn('Error while creating a room with roomID: ' + room.roomId + '.');
    }
}