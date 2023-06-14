// Config
const { TESTING } = require('./../../../../../config/config');

// Logger
const log = require('./../../../../../logging/log')(__filename); 

// Redis
const db = require('../../../../database/redis');

// Game Helper
const { selectCities, startRound } = require('../../../../game/gameHelper');

// Socket Helper
const { getClientsFromRoom, getRoomsFromClient } = require('../../../socketHelper');

/*
 *  1. Raum bekommen, der gestartet werden soll
 *  2. Schauen ob ein Spiel gestartet werden kann
 *  3. Spiel starten
 */ 
module.exports = async(io, socketId) => {
    log.info('Socket ' + socketId + ' wants to start a game.');

    // Get room the player wants to start
    let roomId = await getRoom(io, socketId);
    
    // Wenn room = 0 -> error (in mehreren Räumen drin)
    if(roomId != 0) {

        // Check if the player can start a game
        let canStart = await checkCanStart(io, roomId, socketId);

        // Wenn room = 0 -> error
        if(canStart) {
            startGameInRoom(io, roomId);
        }
    }
};

// Liefert die roomId zurück vom aktuellen Raum vom Socket
let getRoom = async(io, socketId) => {
    log.info('Get the room, the player[' + socketId + '] wants to start.');

    // Alle Räume bekommen, in denen Client drin ist
    let roomsConnected = await getRoomsFromClient(io, socketId);

     // Socket sollte normalerweise in 2 Räumen sein: In seinem privaten(socketId) und in dem öffentlichen 'Game' Raum
     let index = roomsConnected.indexOf(socketId);
     roomsConnected.splice(index, 1);

     if(roomsConnected.length != 1) {
         log.error('Socket ' + socketId + ' is not in ONE room [' + roomsConnected.length + '].');
         return 0;
     }

     // Raum der übrig geblieben ist ausgeben
     log.info('Room found with id ' + roomsConnected[0] + '.');
     return roomsConnected[0];
};

// Checks if the socket can start a game.
let checkCanStart = async(io, roomId, socketId) => {
    log.info('Check if socket[' + socketId + '] can start a game in room ' + roomId + '.');
    log.info('Check if minimum player limit is reached in room ' + roomId + '.');

    let clients = await getClientsFromRoom(io, roomId);

    // zu wenig Spieler im Raum
    if(clients.length < 1) {
        log.info('There are not enough Players in room ' + roomId + ' to start a game (online: ' + clients.length + ').');
        socket.emit('minPlayerError');

    // genug Spieler zum starten vom Spiel
    } else {
        log.info('There are enough Players in room ' + roomId + ' to start a game (online: ' + clients.length + ').');

        // Schauen ob das Spiel schon angefangen hat
        log.info('Check if the room[' + roomId + '] already has started a game.');

        let hasStarted = await db.getValueFromObject(roomId, 'hasStarted');

        // Spiel hat schon angefangen
        if(hasStarted == 'true') {
            log.info('Cannot start game in room ' + roomId + ' because there is a running game in this room.');

        // Spiel hat noch nicht angefangen
        } else {
            log.info('There is not active game in room ' + roomId + '.');
            return true;

        }
    }

    return false;
};

// start a game
let startGameInRoom = async(io, roomId) => {
    log.info('Starting a game in room ' + roomId + '.');

    // Raum als 'aktiv' makieren
    await db.insertObject(roomId, { 'hasStarted': 'true' });

    // Select Cities for Game
    let gameType = await db.getValueFromObject(roomId, 'gameType');

    log.info('Start random City selection[' + roomId + '] -> ' + gameType + '.');
    selectCities(roomId, gameType);

    // Start Game
    log.info('Starting game Countdown in room ' + roomId + '.');
    io.to(roomId).emit('gameStarted');

    // Zeit beim Testen runter machen, damit man nicht so lange warten muss
    let timeout;

    if(TESTING == 'true') {
        timeout = 50;

    } else {
        timeout = 5000;

    }

    setTimeout(function() {
        log.info(" RoomID: " + roomId + ", Starting Game.");
        
        startRound(io, roomId);
    }, timeout);

};