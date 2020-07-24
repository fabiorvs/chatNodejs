const express = require('express');
const path = require('path');
const { Socket } = require('dgram');
const fs = require('fs');
const dateFormat = require('dateformat');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views',path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (reg,res)=>{
    res.render('index.html');
});

let messages = [];

io.on('connection', socket =>{
    console.log(socket.id);

    socket.emit('previousMessages', messages);

    socket.on('sendMessage', data =>{
        messages.push(data);
        socket.broadcast.emit('receivedMessage',data);
        chatLog(data);
    });
})

function limparChat(){
    if (messages.length > 50) {
        messages.splice(0,50);
    }
}

function chatLog(text) {
    text = text.author + '|' + text.message + '|' + RetornaDataHoraAtual() + '\n';
    arquivo = 'chat-'+ RetornaDataAtual() + '.txt';
    fs.appendFile(path.join(__dirname, 'log/' + arquivo), text, function (err) {
        if (err) {
            console.log('Falha ao gravar log')
        }
    });
}

function RetornaDataHoraAtual() {   
    localdate = dateFormat(new Date(), "yyyy-mm-dd H:MM:ss");
    return localdate;
}

function RetornaDataAtual() {   
    localdate = dateFormat(new Date(), "yyyy-mm-dd");
    return localdate;
}

var timeChat = setInterval(limparChat, 120000);

server.listen(3000);