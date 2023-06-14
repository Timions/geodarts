// Redis
const db = require('../database/redis');

// Logger
const log = require('./../../logging/log')(__filename); 

exports.room = {
    roomId: '',
    gameType: '',
    hasStarted: 'false',
    round: '0',
}

exports.player = {
    socketId: '',
    playername: '',
    total: '0',
    points: '0',
    totalDistance: '0'
}

exports.playerUpdate = async function(io, roomId) {
    log.info('Updating Players in room[' + roomId + ']');

    log.info('Getting all SocketIds from room ' + roomId + '.');

    // Alle Spieler im Raum bekommen
    let keys = await db.getKeys(roomId + ':player:*');
    
    // Spielernamen speichern
    let result = [];

    // Alle Spieler durchgehen
    log.info('Getting all playernames from room ' + roomId + '.');

    for(key of keys) {
        let player = await db.getObject(key);

        // Spieler name hinzufügen
        result.push({playername: player.playername});
    }

    // Emit Player Update
    log.info('Done. Submitting updated players to room[' + roomId + ']');
    io.to(roomId).emit('playerUpdate', result);
}

exports.inGamePlayerUpdate = async(io, roomId) => {
    let playerKeys = await db.getKeys(roomId + ':player:*');
    let players = await db.getMultipleObjects(playerKeys);

    if(players.length > 1) {
        let result = [];

        for(player of players) {
            result.push({ playername: player.playername, points: parseInt(player.points), total: parseInt(player.total) });
        }

        io.to(roomId).emit('inGamePlayerUpdate', result);

    } else {
        io.to(roomId).emit('endGameByPlayerCount');
        
    }
};