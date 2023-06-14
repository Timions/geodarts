// Logger
const log = require('../../logging/log')(__filename); 

exports.getClientsFromRoom = function(io, roomId) {
    log.info('Requesting all Clients in room ' + roomId + '.');

    return new Promise((resolve, reject) => {
        io.of('/').in(roomId).clients((error, clients) => {
            if(error) {
                log.error("Error: " + error);
                throw error;
                //reject(error);

            } else {
                log.info("Returning Promise from Request[" + roomId + "] with Clients: " + clients.length);
                resolve(clients);

            }
        });
    });
}

exports.getRoomsFromClient = function(io, socketId) {
    log.info('Requesting all Rooms from Client ' + socketId + '.');

    return new Promise((resolve, reject) => {
        io.of('/').adapter.clientRooms(socketId, async(error, rooms) => {
            if(error) {
                log.error("Error: " + error);
                throw error;
                //reject(error);

            } else {
                log.info("Returning Promise from Request[" + socketId + "] with Rooms: " + rooms.length);
                resolve(rooms);

            }
        });
    });
}