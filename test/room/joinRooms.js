const common = require("../common");
const io = common.io;
const url = common.url;
const ioOptions = common.ioOptions;
const assert = common.assert;
const expect = common.expect;

// Man sollte Raume joinen können, nachdem man einen erstellt hat
it('Clients should be able to join a room', (done) => {
    let client1 = io.connect(url, ioOptions);
    let client2 = io.connect(url, ioOptions);
    let client3 = io.connect(url, ioOptions);

    // Raum erstellen
    client1.on('connect', function() {
        client1.emit('createRoom', 'de_cities');

    });

    // Spielernamen
    let name1 = 'Hans';
    let name2 = 'Eva';
    let name3 = 'Peter';

    // Raum Id
    let roomId;

    // Nachdem Raum erstellt -> Raum beitreten (Socket1)
    client1.on('roomCreated', function(data) {
        roomId = data.roomId;

        client1.emit('joinRoom', { name: name1, roomId: roomId });
    });

    let counter = 0;

    // Immer nach Playerupdate den nächsten socket joinen lassen und die namen überprüfen
    client1.on('playerUpdate', function(result) {
        if(counter == 0) {
            // Check
            expect(result).to.deep.include({playername: name1});

            // Join
            client2.emit('joinRoom', {name: name2, roomId: roomId});
            counter++;

        } else if(counter == 1) {
            // Check
            expect(result).to.deep.include({playername: name1});
            expect(result).to.deep.include({playername: name2});

            // Join
            client3.emit('joinRoom', {name: name3, roomId: roomId});

            counter++;
        } else {
            // Check
            expect(result).to.deep.include({playername: name1});
            expect(result).to.deep.include({playername: name2});
            expect(result).to.deep.include({playername: name3});

            client1.disconnect();
            client2.disconnect();
            client3.disconnect();

            done();
        }
    });
});

// Man soll nur Räume joinen können, die auch exestieren
it('Client should not be able to join a game with an invalid RoomId', (done) => {
    let client = io.connect(url, ioOptions);

    client.on('connect', function() {
        client.emit('joinRoom', { name: 'Thomas', roomId: 123 });

    });

    client.on('err', function(reply) {
        assert.equal(reply, 'Room does not exist.');
        
        client.disconnect();
        done();
    });
});

// Ein Client sollte einen Raum nicht betreten dürfen, wenn das Spiel schon angefangen hat
it('Client should not be able to join a room when the room has already started a game', (done) => {
    let client1 = io.connect(url, ioOptions);
    let client2 = io.connect(url, ioOptions);
    let client3 = io.connect(url, ioOptions);

    let roomId;

    client1.on('connect', function() {
        client1.emit('createRoom', 'de_cities');
    });

    client1.on('roomCreated', function(data) {
        roomId = data.roomId;

        client1.emit('joinRoom', { name: 'Olaf', roomId: roomId });
    });

    let counter = 0;

    client1.on('playerUpdate', function(players) {
        if(counter == 1) {
            client1.emit('startGame');

            counter++
        }

        if(counter == 0) {
            client2.emit('joinRoom', { name: 'Laura', roomId: roomId });

            counter++;
        }
    });

    client1.on('gameStarted', function() {
        client3.emit('joinRoom', { name: 'Marc', roomId: roomId });
    });

    client3.on('err', function(reply) {
        assert.equal(reply, 'Game already started.');
        
        client1.disconnect();
        client2.disconnect();
        client3.disconnect();

        done();
    });
});

// Ein Client sollte einen Raum erstellen mit einer eigenen roomId
it('Create and Join a room while still in another room', (done) => {
    let client1 = io.connect(url, ioOptions);
    let client2 = io.connect(url, ioOptions);

    let roomId1;
    let roomId2 = 456;

    let name1 = 'Hannah';
    let name2 = 'Alice';

    client1.on('connect', function() {
        client1.emit('createRoom', 'de_cities');

    });

    let createdCounter = 0;

    client1.on('roomCreated', function(data) {
        if(createdCounter == 0) {
            roomId1 = data.roomId;
            client1.emit('joinRoom', { name: name1, roomId: roomId1 });

        } 
        
        if(createdCounter == 1) {
            client1.emit('joinRoom', { name: name1, roomId: roomId2 });

        }

        createdCounter++;
    });

    let updateCounter = 0;

    client1.on('playerUpdate', function(players) {
        if(updateCounter == 0) {
            client2.emit('joinRoom', { name: name2, roomId: roomId1 });

        }
        
        if(updateCounter == 1) {
            client1.emit('createRoom', { roomId: roomId2, gameType: 'de_cities' });

        }   

        if(updateCounter == 2) {
            expect(players).to.deep.include({playername: name2});
            expect(players).to.not.deep.include({playername: name1});

        }
        
        if(updateCounter == 3) {
            expect(players).to.deep.include({playername: name1});
            expect(players).to.not.deep.include({playername: name2});

            client1.disconnect();
            client2.disconnect();

            done();
        }

        updateCounter++;
    });
});