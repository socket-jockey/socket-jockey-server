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

io.on('connection', (socket) => {
  console.log(`new connection id ${socket.id}`);

  socket.on('collab', () => {
    const room = 'room' + num;
    socket.join(room);
    rooms[room] = {};

    io.in(room).emit('set room', { room, id: socket.id });

    socket.on('set color', (color) => {
      rooms[room][socket.id] = color;
      io.in(room).emit('state from server', rooms[room]);
    });

    const numOfParticipants = Array.from(
      namespace.adapter.rooms.get(room)
    ).length;

    if (numOfParticipants >= 3) num++;

    io.in(room).emit('num participants', numOfParticipants);
    // io.in(room).emit('participants', participants);

    // io.in(room).emit('participant color', (color) => {});
    // console.log(io.of('/').in(room))
  });
  socket.on('begin', (room) => {
    io.in(room).emit('close modal');
  });

  socket.on('client chat', (input, socketRoom) => {
    console.log('room', socketRoom);
    console.log(input);
    io.in(socketRoom).emit('server chat', input);
  });

  socket.on('add object', (socketRoom, data) => {
    console.log(socketRoom, data);
    io.in(socketRoom).emit('emit add object', data);
  });
});

instrument(io, {
  auth: false,
});

http.listen(PORT, () => console.log(`server spinning on port ${PORT}`));
