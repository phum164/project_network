const socket = io('http://localhost:3000')

const HelloBtn = document.getElementById('helloButton');

socket.on('serverToClient', (data) => {
    alert(data);
})

socket.emit('clientToServer', "Hello, server!");

HelloBtn.addEventListener('click', ()=>{
    socket.emit('clientToClient', "Hello to the follow clients!");
})