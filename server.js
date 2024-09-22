const express = require('express')
const app = express()
const port = 3000
const server = app.listen(port)
const io = require('socket.io')(server)

// เสิร์ฟไฟล์ static
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('serverToClient', "Hello, client");
    socket.on('clientToServer', data => {
        console.log(data);
    })
    socket.on('clientToClient', data =>{
        socket.broadcast.emit('serverToClient', data);
    })
});