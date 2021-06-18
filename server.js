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
let roomNumber = 10001;
const rooms = {};
let roomId = '';

io.on('connection', (socket) => {
  console.log(`new connection id ${socket.id}`);
  io.to(socket.id).emit('set userId', socket.id);

  // triggered by 'enter room' event on front end
  socket.on('set roomId & join', ({ userId, customRoomId }) => {
    // if custom room is provided && spots are available, assign to private room or add new private room; if none is provided assign to default room
    roomId = customRoomId ? customRoomId : 'room' + roomNumber;

    socket.join(roomId);

    const numOfParticipants = Array.from(
      namespace.adapter.rooms.get(roomId)
    ).length;

    if(!customRoomId && numOfParticipants >= 3) {
      roomNumber++;
    }

    // initialize a room in state object or add to existing room
    if(!rooms[roomId]) rooms[roomId] = { [userId]: '' };
    else
      rooms[roomId] = {
        ...rooms[roomId],
        [userId]: '',
      };

    console.log('from set roomId', rooms);

    // echo room ID back to users upon connection
    io.in(roomId).emit('set roomId', roomId);

    // echo user ID back to user upon connection
    const users = rooms[roomId];
    console.log('from join room', users);

    io.in(roomId).emit('state from server', users);
  });

  socket.on('set color', ({ roomId, user }) => {
    console.log('set color', roomId, user);
    rooms[roomId] = {
      ...rooms[roomId],
      ...user,
    };

    const users = rooms[roomId];
    io.in(roomId).emit('state from server', users);
  });

  socket.on('transmit mouse', (room, data) => {
    console.log('working?!!', room, data);
    io.in(room).emit('mouse response', data);
  });

  socket.on('begin', (room) => {
    roomNumber++;
    io.in(room).emit('close modal');
  });

  socket.on('clear all', room => {
    io.in(room).emit('clear all server');
  });

  //   const numOfParticipants = Array.from(
  //     namespace.adapter.rooms.get(room)
  //   ).length;

  //   if (numOfParticipants >= maxParticipants) num++;

  //   io.in(room).emit('num participants', numOfParticipants);
  // });

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
