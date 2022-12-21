import express from 'express';
import http from 'http';
import fileUpload from 'express-fileupload';
import ejs from 'ejs';
import path from 'path';
import { Server } from 'socket.io';
import { GETPAGES } from './routes/user.router.js';
import { read, write } from './utils/model.js';
import userRouter from './routes/user.router.js';
import messageRouter from './routes/message.route.js'
import jwt from './utils/jwt.js';


const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(userRouter)
app.use(messageRouter)



app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.resolve('src', 'views'));
app.use(express.static(path.resolve('src', 'public')))
app.use(express.static(path.resolve('uploads')));

const server = http.createServer(app)
const io = new Server(server, {/* Options */ })
GETPAGES(app)


io.on("connection", (socket) => {
    let { token } = socket.handshake.auth

    try {
        if (!jwt.verify(token)) {
            socket.emit("exit")
        }

        let { userId } = jwt.verify(token);

        if (userId) {
            let users = read('users');
            let user = users.find((user) => user.userId == userId);
            user.socketId = socket.id;

            write('users', users);

            socket.broadcast.emit('user-online', userId);
            socket.userId = userId;
        }

        socket.on("new-message", ({ to, message, created_at }) => {
            let users = read("users")
            let messages = read("messages")

            users.map(user=> delete user.password)

            let newMessage = {
                "message": message,
                "messageId": messages.at(-1)?.messageId + 1,
                "from": userId,
                "to": to,
                "created_at": created_at
            }
            
            messages.push(newMessage)
            write("messages", messages)

            newMessage.from = users.find(user=> user.userId == userId)
            newMessage.to = users.find(user=> user.userId == to)

            socket.to(users.find(user=> user.userId == to)?.socketId).emit("send-message" , newMessage)
        })

        socket.on("typing", ({to})=>{
            let users = read("users")

            let finded = users.find(user=>user.userId == to)

            socket.to(finded?.socketId).emit("typing")
        })

        socket.on("stop", ({to})=>{
            let users = read("users")

            let finded = users.find(user=>user.userId == to)

            socket.to(finded?.socketId).emit("stop")
        })


        socket.on('disconnect', () => {
            let users = read('users');
            let user = users.find((user) => user.userId == userId);
            user.socketId = null;
            write('users', users);
            socket.broadcast.emit('user-disconnect', userId);
        });
    } catch (error) {
        socket.emit("exit")
    }
});

server.listen(4321, () => console.log("server started at 4321"));