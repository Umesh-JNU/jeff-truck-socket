const http = require('http');
const dotenv = require('dotenv');
const express = require('express');
const { Server } = require('socket.io');
const { connectDatabase } = require("./config/database");

const { socketErrorHandler } = require("./utils/errorHandler");
const { redis, redisGet, redisSet, redisDel } = require("./utils/redis");

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

// --------------------------- REDIS ------------------------------
(async () => {
  await redis.connect();
  // await redis.flushAll();
})();
// ---------------------------------------------------------------

io.on('connection', async (socket) => {
  const id = socket.id;
  console.log(`a user is connected - ${id}`);

  function joinRoom(roomId, cb) {
    socket.join(roomId);
    cb({ status: 'OK' });
  }

  async function changeLocation({ userId, body, roomId }, cb) {
    if (roomId) {
      socket.to(roomId).emit('new-location', body);
    }
    console.log({ userId, body, roomId })

    await redisSet({ key: id, val: body }, socket);
    cb({ status: 'OK' });
  }

  function login(driverId, cb) {
    socket.join(driverId);
    cb({ status: 'OK' });
  }

  function shiftChange({ tripId, prevDriverId }, cb) {
    console.log(tripId, prevDriverId)
    // emit event to previous driver to let him know that driver is changed
    socket.to(prevDriverId).emit('driver-change', { tripId });
    cb({ status: 'OK' });
  }

  setInterval(async () => {
    const drivers = await redisGet({}, socket);
    socket.emit('driver-loc-change', drivers);
    console.log({ drivers });
  }, 30 * 1000)
  // }, 5 * 1000)
  // }, 60 * 1000)

  socket.on('login', socketErrorHandler(login, socket));
  socket.on('join-room', socketErrorHandler(joinRoom, socket));
  socket.on("change-location", socketErrorHandler(changeLocation, socket));
  socket.on('shift-change', socketErrorHandler(shiftChange, socket));
  socket.on('disconnect', async () => {
    console.log(`a user disconnected - ${id}.`);
    await redis.del(id);
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: "Server is running..." });
});


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`SOCKET - Listening on ${PORT}`);
})