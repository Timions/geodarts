// Logger
const log = require('./../../../../../logging/log')(__filename); 

// Redis
const db = require('../../../../database/redis');

// Room Helper
const { playerUpdate, inGamePlayerUpdate } = require('../../../../room/roomHelper');

// Socket Helper
const { getClientsFromRoom, getRoomsFromClient } = require('../../../socketHelper');

/*
 *  1. Get all Rooms the socket is connected to
 *  2. Delete the socket from rooms and delete room when 0 players left
 *  3. Update Players in rooms, if room is not deleted
 */
module.exports = async(io, socket) => {
    log.info('Socket[' + socket.id + '] is disconnecting.');

    let joinedRooms = await getRoomsFromPlayer(io, socket.id);

    // Einem Spiel gejoined -> löschen notwendig
    if(joinedRooms != 0) {
        let roomsForUpdating = await deleteFromRooms(io, socket, joinedRooms);

        // Noch Spieler im Raum übrig -> update players
        if(roomsForUpdating.length != 0){
            await updatePlayers(io, roomsForUpdating);
        }
    }
};

let getRoomsFromPlayer = async(io, socketId) => {
    log.info('Get all rooms the socket[' + socketId + '] is connected with.');
    let joinedRooms = [];

    // Alle Räume bekommen, mit dem Socket verbunden ist
    let rooms = await getRoomsFromClient(io, socketId);

    log.info('Socket[' + socketId + '] is connected to ' + rooms.length + ' Rooms:');
    log.info('Socket[' + socketId + '] Looping through connected rooms.');

    // durch jeden Raum gehen, mit dem der socket verbunden ist
    for(let counter = 0; counter < rooms.length; counter++) {
        log.info('-> Socket[' + socketId+ '] is connected to Room: ' + rooms[counter]);

        // jeden Raum speichern
        if(rooms[counter] != socketId) {
            log.info('--> Room[' + rooms[counter] + '] is game room.');
            joinedRooms.push(rooms[counter]);

        } else {
            log.info('--> Room[' + rooms[counter] + '] is default room.');

        }
    }

    // Räume suchen, die er erstellt hat aber nicht gejoint ist
    log.info('Check if the socket ' + socketId + ' created rooms but never joined them.');

    let keys = await db.getKeys('*:creator:' + socketId);

    // RoomId bekommen
    let createdRoomIds = [];

    // Wenn Räume gefunden wurden
    if(keys.length != 0) {

        let reply = await db.getMultipleObjects(keys);

        for(let r = 0; r < reply.length; r++) {
            createdRoomIds.push(reply[r].roomId);

        }

        log.info('Found rooms that were created by ' + socketId + ': ' + createdRoomIds);
        await db.remove(keys);

    // Wenn keine Räume gefunden wurden
    } else {
        log.info('Found no rooms that were created by ' + socketId + '.');

    }

    // noch keinem Room gejoined
    if(joinedRooms.length == 0) {
        log.info('=> Socket[' + socketId + '] has not joined a game yet.');

        // Falls Räume gefunden wurden, die er erstellt hat, aber nicht gejoined ist
        if(createdRoomIds.length !== 0) {
            log.info('Remove rooms that were created by socket ' + socketId + ' but were never joined');
            return createdRoomIds;
        }

        log.info('Socket ' + socketId + ' is disconnected. DONE.');
        return 0;

    // einem Room gejoined
    } else if(joinedRooms.length == 1) {
        log.info('=> Socket[' + socketId + '] has joined ONE game -> delete socket from room and check if room can be ' + 
        'deleted and if players have to be updated.');

        // Falls Räume gefunden wurden, die er erstellt hat, aber nicht gejoined ist
        if(createdRoomIds.length !== 0) {
            let uniqueRoomIds =  joinedRooms.concat(createdRoomIds.filter((id) => joinedRooms.indexOf(id) < 0));
            return uniqueRoomIds;
        }

        return joinedRooms;

    // mehr wie in einem drin -> Aus allen Räumen löschen
    } else {
        log.error('=> Socket[' + socketId + '] has joined MULTIPLE rooms -> ERROR: Socket is only allowed to join one room. ' +
        'Delete Socket Stuff from every room and check if room can be deletet and if players have to be updated.');

        // Falls Räume gefunden wurden, die er erstellt hat, aber nicht gejoined ist
        if(createdRoomIds.length !== 0) {
            let uniqueRoomIds =  joinedRooms.concat(createdRoomIds.filter((id) => joinedRooms.indexOf(item) < 0));
            return uniqueRoomIds;
        }

        return joinedRooms;
    }
}

// Delete Socket Stuff from rooms and check if the rooms can be deleted. Returns rooms that have not been deleted
// -> Updated these rooms
let deleteFromRooms = async(io, socket, rooms) => {
    
    // Räume, die geupdatet werden müssen
    let roomsForUpdating = [];
    log.info('Looping through joined[' + socket.id + '] rooms.');

    // Räume durchgehen
    for(let i = 0; i < rooms.length; i++) {
        log.info('-> Selecting room ' + rooms[i] + '.');

        // Schauen, ob der Raum gelöscht werden kann, weil niemand mehr drin ist
        log.info('--> Check if room[' + rooms[i] + '] can be deleted.');
        let online = await getClientsFromRoom(io, rooms[i]);

        // Raum ist noch nicht leer
        if(online.length != 0) {
            log.info('---> Not deleting room[' + rooms[i] + '] -> ' + (online.length) + ' Players left.');

            // Socket aus Raum löschen
            log.info('---> Deleting socket[' + socket.id + '] stuff in room[' + rooms[i] + ']');
            await db.remove(rooms[i] + ':player:' + socket.id);
            await db.remove(rooms[i] + ':marker:' + socket.id);
            await db.remove(rooms[i] + ':creator:' + socket.id);

            // Updating Players
            roomsForUpdating.push(rooms[i]);


        // Raum ist leer und Raum muss gelöscht werden
        } else {
            log.info('---> Deleting ' + socket.id + ' room[' + rooms[i] + '] -> 0 Players left.');

            // Alles was mit dem Raum zu tun hat -> löschen
            let roomKeys = await db.getKeys(rooms[i] + '*');
            log.info('Found ' + roomKeys.length + ' keys for room[' + rooms[i] + '] to delete.');

            if(roomKeys.length != 0) {
                await db.remove(roomKeys);

            }

            // Keine Spieler updaten
        }
    }

    return roomsForUpdating;
};

let updatePlayers = async(io, roomsForUpdating) => {
    log.info('Update players in ' + roomsForUpdating.length + ' rooms.');

    for(let r = 0; r < roomsForUpdating.length; r++) {
        log.info('Start updating Players in room ' + roomsForUpdating[r] + '.');
        log.info('Check if room ' + roomsForUpdating[r] + ' already started a game.');

        // Update Players
        let hasStarted = await db.getValueFromObject(roomsForUpdating[r], 'hasStarted');

        // Wenn ein Spiel gestarted wurde, müssen spieler anderes geupdatet werden
        if(hasStarted == 'true') {
            log.info('Room[' + roomsForUpdating[r] + '] already started a game -> in game player update');
            inGamePlayerUpdate(io, roomsForUpdating[r]);

        } else {
            log.info('Room[' + roomsForUpdating[r] + '] has not started a game -> player update');
            playerUpdate(io, roomsForUpdating[r]);

        }
    }
};