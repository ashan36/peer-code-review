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
  socket.emit("notification", "you are connected");

  // Subscribe this socket connection to a room keyed by their userId
  socket.on("login", userId => {
    socket.join(userId, () =>
      socket.emit("join-message", "joined room " + userId)
    );
  });
};

const SocketService = new SocketConfig();

module.exports = SocketService;
