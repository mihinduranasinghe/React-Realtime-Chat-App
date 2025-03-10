const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

//socketio connection templete
io.on("connection", (socket) => {
  console.log("We have a new connection!!");

  socket.on("join", ({ name, room }, callback) => {
    console.log(name, room);

    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error); //Username already taken

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined !` });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      user: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      room: user.room,
      user: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
    }
    //console.log("User had left!!!");
  });
});

server.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`)
);
