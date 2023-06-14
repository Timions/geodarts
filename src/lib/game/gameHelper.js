const db = require('../database/redis');
const fs = require('fs')
const path = require('path');

// Config
const { MAX_ROUNDS } = require('../../config/config');

// Logger
const log = require('./../../logging/log')(__filename); 

exports.selectCities = function(roomId, gameType) {

    let result = [];

    try {
        // liest Städte .geojson Datei aus
        const geojson = fs.readFileSync(path.join(__dirname + '/../../data/') + gameType + '.geojson');

        // ganze Datei mit Städten
        let allCities = JSON.parse(geojson).features;

        log.info("RoomId: " + roomId + ", Start Random city selection.");
        log.info("RoomId: " + roomId + ", Choose " + MAX_ROUNDS + " from " + allCities.length + " cities.");

        // so viele zufällige Städte auswählen wie es Runden gibt
        let rnd;

        for(let i = 0; i < MAX_ROUNDS; i++) {
            rnd = Math.floor(Math.random() *  allCities.length);
            log.info(" RoomId: " + roomId + " '" + allCities[rnd].properties.place_name + "' was choosen.");

            result.push({'name': allCities[rnd].properties.place_name,
                'lng': allCities[rnd].geometry.coordinates[0].toString(), 
                'lat': allCities[rnd].geometry.coordinates[1].toString()
            });

            allCities.splice(rnd, 1);
        }

        allCities = [];
        log.info("RoomId: " + roomId + ", Random city selection done.");

        for(city in result) {
            db.insertObject(roomId + ':city' + city, result[city]);
        }

    } catch(err) {
        log.error("RoomId: " + roomId + ", " + err);
        return;

    }
}

// neu Runde starten
exports.startRound = async(io, roomId) => {
    log.info('Starting new round in room ' + roomId + '.');

    let room = await db.getObject(roomId);

    if(room != null) {
        let round = parseInt(room.round);

        // Stadt bekommen für Runde
        let city = await db.getObject(roomId + ':city' + round);

        // Neue Stadt an Spieler schicken
        io.to(roomId).emit('startRound', { city: city.name, round: round, max_round: MAX_ROUNDS });

        // den Spielern 10 Sekunden Zeit lassen um Marker zu setzen
        setTimeout(function() {
            io.to(roomId).emit('roundOver');
        }, 10000);
    }
}