const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const { instrument } = require('@socket.io/admin-ui');
//testing
app.use(
  require('cors')({
    origin: true,
    credentials: true,
  })
);

const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origin: true,
  },
});

const namespace = io.of('/');
app.use(express.json());

// const rooms = io.sockets.adapter.rooms
let num = 10001;
let rooms = {};
let room = '';

io.on('connection', (socket) => {
  console.log(`new connection id ${socket.id}`);
  io.to(socket.id).emit('user id', socket.id);

  socket.on('collab', () => {
    room = 'room' + num;
    if (!rooms[room]) rooms[room] = {};

    socket.join(room);

    io.in(room).emit('set room', { room, users: rooms[room] });

    const numOfParticipants = Array.from(
      namespace.adapter.rooms.get(room)
    ).length;

    if (numOfParticipants >= 3) num++;

    io.in(room).emit('num participants', numOfParticipants);
  });

  socket.on('set color', ({ room, user }) => {
    rooms[room] = {
      ...rooms[room],
      ...user,
    };
    io.in(room).emit('state from server', rooms[room]);
  });

  socket.on('begin', (room) => {
    num++;
    io.in(room).emit('close modal');
  });

  socket.on('client chat', ({ input, color }, socketRoom) => {
    io.in(socketRoom).emit('server chat', { input, color });
  });

  socket.on('add object', (socketRoom, data) => {
    io.in(socketRoom).emit('emit add object', data);
  });

  socket.on('undo', (socketRoom) => {
    io.in(socketRoom).emit('undo last');
  });
});

instrument(io, {
  auth: false,
});

http.listen(PORT, () => console.log(`server spinning on port ${PORT}`));
