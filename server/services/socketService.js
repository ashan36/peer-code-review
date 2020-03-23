const socketIo = require("socket.io");

class SocketConfig {
  constructor() {
    this.io;
  }

  bindServer(server) {
    this.io = new socketIo(server);
  }

  start() {
    this.io.on("connection", socket => {
      socketListeners(socket);
    });
  }

  emit(event, data) {
    this.io.emit(event, data);
  }

  sendNotification(roomName, data) {
    this.io.to(roomName).emit("notification", data);
  }
}

const socketListeners = socket => {
  console.log("Client connected via sockets");

  // Subscribe this socket connection to a room keyed by their userId
  socket.on("login", userId => {
    console.log("User joined room " + userId);
    socket.join(userId);
  });
};

const SocketService = new SocketConfig();

module.exports = SocketService;
