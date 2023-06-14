// Config
const { MAX_ROUNDS, TESTING } = require('../../../../../config/config');

// Logger
const log = require('./../../../../../logging/log')(__filename); 

// Redis
const db = require('../../../../database/redis');

// Turf
const turf = require('@turf/turf');

// UUID
const uuid = require('uuid');

// Game Helper
const { startRound } = require('../../../../game/gameHelper');

// Socket Helper
const { getRoomsFromClient } = require('../../../socketHelper');

/*
 *  1. Den Raum von Socket bekommen
 *  2. Schauen ob man den Marker submitten darf
 *  3. Den Marker submitten
 *  4. Schauen ob alle Marker submitted wurden
 *  5. Ergebnisse berechnen + ausgeben
 */
module.exports = async(io, socket, subbedMarker) => {
    log.info('Marker got submitted by Socket ' + socket.id + '.');

    let roomId = await getRoom(io, socket.id);

    // Schauen ob der Raum exestiert
    if(roomId != 0) {
        let canSubmit = await checkCanSubmit(roomId);

        // Schauen ob man einen Marker submitten darf
        if(canSubmit) {

            // Marker submitten
            await submit(roomId, socket.id, subbedMarker);

            let allSubmitted = await checkAllSubmitted(roomId);

            // Wurden alle Marker Submitted
            if(allSubmitted) {
                calculateResult(io, roomId);
            }
        }
    }
};

// Get the roomId from a given socketId
let getRoom = async(io, socketId) => {
    log.info('Get the room from socket ' + socketId + '.');

    // Aktuelle Räume vom Socket selektieren
    let roomsConnected = await getRoomsFromClient(io, socketId);

    let index = roomsConnected.indexOf(socketId);
    roomsConnected.splice(index, 1);

    // Socket nur in einem Raum drin ?
    if(roomsConnected.length != 1) {
        log.error('Socket ' + socketId + ' is not in ONE room [' + roomsConnected.length + '].');
        return 0;
    }

    // Raum der übrig geblieben ist ausgeben
    log.info('Room found with id ' + roomsConnected[0] + '.');
    return roomsConnected[0];
}

// Checks if a socket can submit a marker
let checkCanSubmit = async(roomId) => {
    log.info('Check if room ' + roomId + ' has Started a Game.');
    let hasStarted = await db.getValueFromObject(roomId, 'hasStarted');

    // Spiel hat noch nicht angefangen
    if(hasStarted == 'false') {
        log.info('Cannot start game in room ' + roomId + ' because there is no active game in this room.');
        return false;

    } else {
        log.info('There is an active game in room ' + roomId + '.');
        return true;

    }
}

// Submits Marker from Player
let submit = async(roomId, socketId, subbedMarker) => {

    // Eigentlicher submit
    // marker umkonvertieren
    log.info('Set Marker Object from socket ' + socketId + '.');

    let markerTemplate = {
        socketId: '',
        lng: '',
        lat: '',
        points: ''
    }

    // Setzt socketId
    markerTemplate.socketId = socketId;

    // Setzt LngLat vom Marker
    if(subbedMarker.lngLat == null) {
        markerTemplate.lng = 'null';
        markerTemplate.lat = 'null';
        
    } else {
        markerTemplate.lng = subbedMarker.lngLat[0].toString();
        markerTemplate.lat = subbedMarker.lngLat[1].toString();

    }

    // Insert Marker
    log.info('Insert sockets[' + socketId + '] marker to DB.');
    await db.insertObject(roomId + ':marker:' + socketId, markerTemplate);
};

// Schau ob alle Marker in einem gegebenen Raum submittet wurden
let checkAllSubmitted = async(roomId) => {
    log.info('Check if all Markers were submitted in room ' + roomId + '.');

    let playerKeys = await db.getKeys(roomId + ':player:*');
    let markerKeys = await db.getKeys(roomId + ':marker:*');

    // Nicht alle Marker abgegeben
    if(markerKeys.length != playerKeys.length) {
        log.info('Not all Markers were submitted in room ' + roomId + '.');
        return false;
    
    }

    // Es kann sein, dass mehr als einer bis hier kommt
    log.info('RoomID: ' + roomId + ', Making sure showResults will only be emitted once');
    let reply = await db.insertIfNotExists(roomId + ':complete', 'DONE');

    // Ein anderes Event war schneller
    if(reply != 1) {
        return false;
    }

    log.info('Done checking. All Markers were submitted.');
    return true;
};

// Berechnet das Ergebnis einer Runde
let calculateResult = async(io, roomId) => {
    log.info('Calculate Results in room ' + roomId + '.');

    // Alle Marker und Spieler bekommen
    let playerKeys = await db.getKeys(roomId + ':player:*');
    let markerKeys = await db.getKeys(roomId + ':marker:*');

    // Alle Spieler bekommen
    log.info(' RoomID: ' + roomId + ', Get all Players');
    let players = await db.getMultipleObjects(playerKeys);

    // Alle Marker bekommen
    log.info(' RoomID: ' + roomId + ', Get all Markers');
    let markers = await db.getMultipleObjects(markerKeys);

    // Marker können jetzt gelöscht werden
    db.remove(markerKeys);

    /*
     *  Distanzen berechnen
     */
    log.info(' RoomID: ' + roomId + ', Calculate Distances.');

    // Stadt bekommen
    let round = await db.getValueFromObject(roomId, 'round');

    let city  = await db.getObject(roomId + ':city' + round);
    let cityCoords = [parseFloat(city.lng), parseFloat(city.lat)];
    log.info('Current City in room ' + roomId + ' is: ' + city.name);

    for(let m = 0; m < markers.length; m++) {
        if(markers[m].lng == 'null') {
            markers[m].distance = null;
            markers[m].lng = null;
            markers[m].lat = null;

        } else {
            markers[m].distance = (turf.distance(cityCoords, [parseFloat(markers[m].lng), parseFloat(markers[m].lat)])).toString();

        }
    }

    /*
     *  Marker sotieren nach Distanz
     */
    log.info(" RoomID: " + roomId + ", Sort Markers by distance.");
    markers.sort(function(a, b) {
        if(a.distance == null) {
            return -1;

        } else {
            return parseFloat(a.distance) - parseFloat(b.distance);

        }
    });

    /*
     *  Punkte verteilen
     */
    log.info(" RoomID: " + roomId + ", Calculate Points.");

    let maxPoints = markers.length;

    for(let m = 0; m < markers.length; m++) {
        if(markers[m].distance != null) {
            markers[m].points = (maxPoints--).toString();

        } else {
            markers[m].points = '0';

        }

        // Spieler zum Marker finden
        let player = players.find(p => p.socketId == markers[m].socketId);

        // Total Score berechnen
        let total = (parseInt(player.total) + parseInt(markers[m].points)).toString();
        markers[m].total = total;
        player.total = total;
        player.points = markers[m].points;

        // Zur total Distance hinzufügen
        if(markers[m].distance != null && markers[m].distance != 'null') {
            player.totalDistance = (parseFloat(player.totalDistance) + parseInt(markers[m].distance)).toString();

        }

        // Spielername setzten
        markers[m].playername = player.playername;
        await db.insertObject(roomId + ':player:' + player.socketId, player);
    }

    /*
     *  Emitt Results
     */
    log.info(' RoomID: ' + roomId + ', Emit Results');

    io.sockets.in(roomId).emit('showResult', [markers.map(m => {
        return {lngLat: [m.lng, m.lat], playername: m.playername, distance: parseInt(m.distance), points: parseInt(m.points), total: parseInt(m.total) }
    }), cityCoords]);

    // Zeit beim Testen runter machen, damit man nicht so lange warten muss
    let timeout;

    if(TESTING == 'true') {
        timeout = 50;

    } else {
        timeout = 5000;

    }

    /*
     *  Nach der Runde aufräumen
     */
    setTimeout(async() => {
        log.info(' RoomID: ' + roomId + ', Delete City from last round.');

        db.remove(roomId + ':city' + round);
        db.remove(roomId + ':complete');

        // noch eine Runde
        if(parseInt(round) < MAX_ROUNDS - 1) {
            log.info(" RoomID: " + roomId + ", Starting new Round.");
            
            // Runde hochzählen
            await db.insertObject(roomId, {round: (parseInt(round) + 1).toString()});

            // Runde starten
            startRound(io, roomId);

        // Spiel vorbei
        } else {
            log.info(" RoomID: " + roomId + ", End game.");

            // Gesamt Ergebnis zusammenfassen
            let result = markers.map(function(m) {
                let player = players.find(p => p.socketId == m.socketId);

                return {playername: m.playername, total: parseInt(m.total), totalDistance: parseFloat(player.totalDistance)}
            });

            // Gesamt Ergebnis ausgeben
            io.sockets.in(roomId).emit('gameOver', { result: result, roomId: uuid.v4() });

        }
    }, timeout);
};