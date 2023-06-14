// Config
const { PORT } = require('../src/config/config');

// Testing
const chai = require("chai");

// Socket.io
const io = require('socket.io-client');

const url = 'http://localhost:' + PORT;
const ioOptions = { 
    transports: ['websocket']
};

exports.chai = chai;
exports.assert = chai.assert;
exports.expect = chai.expect;
exports.io = io;
exports.url = url;
exports.ioOptions = ioOptions;