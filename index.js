const http = require('http');
const dotenv = require('dotenv');
const express = require('express');
const { Server } = require('socket.io');
const { connectDatabase } = require("./config/database");

dotenv.config({ path: "./config/config.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: '*'
  }
});

connectDatabase();

const errorHandler = (fun) => (data, cb) => {
  console.log({ fun, data, cb })

  try {
    fun(data, cb);
  } catch (error) {
    console.log({ err_msg: error.message });
  }
};

io.on('connection', (socket) => {
  console.log("a user is connected");

  function joinRoom(roomId, cb) {
    socket.join(roomId);
    cb({ status: 'OK' });
  }

  function changeLocation({ roomId, loc }, cb) {
    socket.to(roomId).emit('new-location', loc);
    cb({ status: 'ok' });
  }

  socket.on('join-room', errorHandler(joinRoom));
  socket.on("change-location", errorHandler(changeLocation));

  socket.on('disconnect', () => {
    console.log("a user is disconnected");
  })
});

app.get('/', (req, res) => {
  res.status(200).json({ message: "Server is running..." });
});


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`socket listening on ${PORT}`);
})