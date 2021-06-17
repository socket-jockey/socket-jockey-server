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
<<<<<<< HEAD
let roomNumber = 10001;
=======
let num = 10001;
>>>>>>> 3c866e75a601b28c7356b58415460201e4b97f8f
let rooms = {};
let room = '';

io.on('connection', (socket) => {
  console.log(`new connection id ${socket.id}`);
<<<<<<< HEAD
  io.to(socket.id).emit('set userId', socket.id);
=======
  io.to(socket.id).emit('user id', socket.id);
>>>>>>> 3c866e75a601b28c7356b58415460201e4b97f8f

  // triggered by 'enter room' event on front end
  socket.on('set roomId & join', ({ userId, customRoomId }) => {
    // max participants supported per room
    const maxParticipants = 3;
    // if custom room is provided && spots are available, assign to private room or add new private room; if none is provided assign to default room
    roomId = customRoomId ? customRoomId : 'room' + roomNumber;
    console.log('custom room id', roomId);

<<<<<<< HEAD
    socket.join(roomId);
=======
  socket.on('collab', (customRoom) => {
    room = customRoom ? customRoom : 'room' + num;

    if (!rooms[room]) rooms[room] = {};
>>>>>>> 3c866e75a601b28c7356b58415460201e4b97f8f

    const numOfParticipants = Array.from(
      namespace.adapter.rooms.get(roomId)
    ).length;

<<<<<<< HEAD
    if (!customRoomId && numOfParticipants >= 3) {
      roomNumber++;
    }

    // initialize a room in state object or add to existing room
    if (!rooms[roomId]) rooms[roomId] = { [userId]: '' };
    else
      rooms[roomId] = {
        ...rooms[roomId],
        [userId]: '',
      };
=======
    io.in(room).emit('set room', { room, users: rooms[room] });

    const numOfParticipants = Array.from(
      namespace.adapter.rooms.get(room)
    ).length;

    if (numOfParticipants >= 3) num++;
>>>>>>> 3c866e75a601b28c7356b58415460201e4b97f8f

    console.log('from set roomId', rooms);

    // echo room ID back to users upon connection
    io.in(roomId).emit('set roomId', roomId);

    // echo user ID back to user upon connection
    const users = rooms[roomId];
    console.log('from join room', users);

    io.in(roomId).emit('state from server', users);
  });

<<<<<<< HEAD
  socket.on('set color', ({ roomId, user }) => {
    console.log('set color', roomId, user);
    rooms[roomId] = {
      ...rooms[roomId],
      ...user,
    };
=======
  socket.on('set color', ({ room, user }) => {
    rooms[room] = {
      ...rooms[room],
      ...user,
    };
    io.in(room).emit('state from server', rooms[room]);
  });
>>>>>>> 3c866e75a601b28c7356b58415460201e4b97f8f

    const users = rooms[roomId];
    io.in(roomId).emit('state from server', users);
  });

<<<<<<< HEAD
  socket.on('begin', (roomId) => {
    io.in(roomId).emit('close modal');
    roomNumber++;
  });

  //   const numOfParticipants = Array.from(
  //     namespace.adapter.rooms.get(room)
  //   ).length;

  //   if (numOfParticipants >= maxParticipants) num++;

  //   io.in(room).emit('num participants', numOfParticipants);
  // });

=======
>>>>>>> 3c866e75a601b28c7356b58415460201e4b97f8f
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
