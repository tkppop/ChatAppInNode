const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {genMessageWithTimesstamp, genLocationMsgWithTimesstamp} = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users')

const app = express()
//Refactored to pass the server to the socketio function,
//usually express does this server creation in its implementation
const server = http.createServer(app)
const io = socketio(server)

//define port Heroku and local
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

let count = 0
// Methods used using socker
// socket.emit, io.emit, socket.broadcast.emit
// these below methods are used to communicate within the room
// io.to.emit, socket.broadcast.to.emit


io.on('connection', (socket) => {
    console.log("New WebSocket Connection")
    
    // refactor for spread operator
    //socket.on('join', ({username, room}, callback) => {
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id , ...options })
        if (error) {
            return callback(error)
        }

        //this method can be only called on the server and sends the user to that room
        socket.join(user.room)

        //send users in room
        io.to(user.room).emit('roomData' , {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        socket.emit('joinMessage', genMessageWithTimesstamp('System', 'Welcome!'))
        // Broardcast to all except the current socket aka the new user
        socket.broadcast.to(user.room).emit('sendAll', genMessageWithTimesstamp( 'System' , `${user.username} has joined!`))
        callback()

    })

    // socket.emit('countUpdated', count)
    // socket.on('increment', () => {
    //     count++
    //     //socket.emit('countUpdated', count)
    //     // emits this message to all connections
    //     io.emit('countUpdated', count)
    // })

    //Listen for sendMessage and send to all connected clients
    socket.on('sendMessage', (msg, callback ) => {
        const filter = new Filter
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('sendAll', genMessageWithTimesstamp(user.username, msg))
        callback()
    })

    //Listen for sendLocation message and send to all connected clients
    socket.on('sendLocation', (msg, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('sendLocationAll', genLocationMsgWithTimesstamp( user.username, `https://google.com/maps?q=${msg.lat},${msg.long}`))
        callback()
    })

    // Broadcast when a user disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('sendAll', genMessageWithTimesstamp('System', `${user.username} has left the chat room!`))
            io.to(user.room).emit('roomData' , {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})