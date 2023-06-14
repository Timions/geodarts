const common = require("../common");
const io = common.io;
const url = common.url;
const ioOptions = common.ioOptions;
const assert = common.assert;

// Man soll einen Raum erstellen können mit einem angegebenen GameType
it('Client should be able to create a room', function(done) {
    let client = io.connect(url, ioOptions);

    client.on('connect', function() {
        client.emit('createRoom', 'de_cities');

    });

    client.on('roomCreated', function(data) {
        assert.isString(data.roomId);
        assert.equal(data.roomId.length, 36);

        client.disconnect();
        done();
    });
});

// Man soll keinen Raum erstellen können, wenn ein unbekannter Gametype verwendet wird
it('Client should not create a room with an unknown gametype', function(done) {
    let client = io.connect(url, ioOptions);

    client.on('connect', function() {
        client.emit('createRoom', 'fr_cities');

    });

    client.on('err', function(data) {
        assert.equal(data, 'Unkown GameType.');

        client.disconnect();
        done();
    });
});

// Man soll keinen Raum erstellen können, wenn kein Gametype angegeben ist
it('Client should not create a room with no gameType', function(done) {
    let client = io.connect(url, ioOptions);

    client.on('connect', function() {
        client.emit('createRoom');

    });

    client.on('err', function(data) {
        assert.equal(data, 'No GameType.');

        client.disconnect();
        done();
    });
});

// Ein Client sollte einen Raum erstellen mit einer eigenen roomId
it('Create a Room with a custom roomId', (done) => {
    let client1 = io.connect(url, ioOptions);
    let client2 = io.connect(url, ioOptions);

    let roomId = 123;

    client1.on('connect', function() {
        client1.emit('createRoom', { roomId: roomId, gameType: 'de_cities' });

    });

    client1.on('roomCreated', function(data) {
        client2.emit('createRoom', { roomId: roomId, gameType: 'de_cities' });

    });

    client2.on('err', function(msg) {
        assert.equal(msg, 'Room with same RoomId already exists.');
        
        client1.disconnect();
        client2.disconnect();

        done();
    });
});