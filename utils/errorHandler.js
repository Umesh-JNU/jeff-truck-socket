const throwSocketError = require("./socketError");

exports.socketErrorHandler = (fun, socket) => (data, cb) => {
  // console.log({ fun, socket, data, cb });
  try {
    fun(data, cb);
  } catch (error) {
    throwSocketError(error);
    socket.emit('error', error.message);
  }
};

exports.redisErrorHandler = (fun) => async (data, socket) => {
  // console.log({ data, socket })
  try {
    return await fun(data);
  } catch (error) {
    throwSocketError(error);
    socket.emit('error', error.message);
  }
};
