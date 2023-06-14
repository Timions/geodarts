// Server
const express = require('express');
const app = express();
const server = require('http').createServer(app);

// Config
const { REDIS_HOST, PORT } = require('./config/config');

// Logging
const log = require('./logging/log')(__filename); 

// Imports
const bodyParser = require('body-parser');

// Socket.io
const io = require("socket.io")(server);
const redisAdapter = require('socket.io-redis');

io.adapter(redisAdapter({ host: REDIS_HOST, port: 6379 }));
require('./lib/sockets/socket')(io);

app.use(express.static(__dirname + '/public'));

//add default route to always return index.html if no matching api target (SPA)
app.get('*', (req, res)=>{
    res.sendFile(__dirname+'/public/index.html');
})


server.listen(PORT, function() {
    log.info(`Server running on Port ${PORT}...`);
});
