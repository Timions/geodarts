const common = require("./common");

/*
 *  Für Tests muss ein Redis Server am laufen sein und die Node Anwendung
 */

// Env Variable
process.env.TESTING = 'true';

function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

describe("Room Tests", function () {
    importTest("Create Rooms", './room/createRooms.js');
    importTest("Join Rooms", './room/joinRooms.js');
});

describe("Game Tests", function () {
    importTest("Chat", './game/chat.js');
    importTest("Join Rooms", './room/joinRooms.js');
});