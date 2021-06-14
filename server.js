const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

app.use(require('cors')({
  origin: true,
  credentials: true,
}));

const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origin: true,
  }
});

app.use(express.json());

io.on('connection', socket => {

  console.log(`new connection id ${socket.id}`);


});

http.listen(PORT, () => console.log(`server spinning on port ${PORT}`));
