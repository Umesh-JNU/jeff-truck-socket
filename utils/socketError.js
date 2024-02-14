class SocketError extends Error {
  constructor(msg) {
    super(msg);

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = (err) => {
  console.log(new SocketError(err.message));
  // throw new SocketError(msg);
}