const common = require("../common");
const io = common.io;
const url = common.url;
const ioOptions = common.ioOptions;
const assert = common.assert;

// Man sollte Raume joinen können, nachdem man einen erstellt hat
it('Clients should be able to send and receive a message', (done) => {
    let client1 = io.connect(url, ioOptions);
    let client2 = io.connect(url, ioOptions);
    let client3 = io.connect(url, ioOptions);

    // Raum erstellen
    client1.on('connect', function() {
        client1.emit('createRoom', 'de_cities');

    });

    // Spielernamen
    let name1 = 'Patricia';
    let name2 = 'Manuel';
    let name3 = 'Johannes';

    // Raum Id
    let roomId;

    // Message
    let message = 'Hello World!';

    // Nachdem Raum erstellt -> Raum beitreten (Socket1)
    client1.on('roomCreated', function(data) {
        roomId = data.roomId;

        client1.emit('joinRoom', { name: name1, roomId: roomId });
    });

    let counter = 0;

    // Immer nach Playerupdate den nächsten socket joinen lassen und die namen überprüfen
    client1.on('playerUpdate', function(result) {
        if(counter == 0) {
            client2.emit('joinRoom', {name: name2, roomId: roomId});
        }
        
        if(counter == 1) {
            client3.emit('joinRoom', {name: name3, roomId: roomId});
        } 
        
        if(counter == 2) {
            client1.emit('startGame');
        }

        counter++;
    });

    client1.on('gameStarted', function() {
        client1.emit('sendMsg', message);
    });

    client2.on('receiveMsg', function(data) {
        assert.equal(name1, data.playername);
        assert.equal(message, data.msg);

        client1.disconnect();
        client2.disconnect();
        client3.disconnect();

        done();
    });
});