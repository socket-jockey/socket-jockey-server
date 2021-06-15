const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const { instrument } = require('@socket.io/admin-ui');
//testing 
app.use(require('cors')({
  origin: true,
  credentials: true,
}));

const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origin: true
  }
});

const namespace = io.of('/');
app.use(express.json());

// const rooms = io.sockets.adapter.rooms
let num = 10001;

io.on('connection', socket => {
  console.log(`new connection id ${socket.id}`);


  socket.on('collab', () => {
    const room = 'room' + num;
    socket.join(room);
    const numOfParticipants = Array.from(namespace.adapter.rooms.get(room)).length;
    if(numOfParticipants >= 3)num++;

    socket.emit('set room', room);
    // console.log(io.of('/').in(room))
    console.log(namespace.adapter.rooms);
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
  auth: false
});

http.listen(PORT, () => console.log(`server spinning on port ${PORT}`));
