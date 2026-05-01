import { Server } from "socket.io"
import http from "http"
import express from 'express'
import { CLIENT_RENEG_LIMIT } from "tls"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",

    }
})

const userSocketMap = {} // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}

io.on("connection", (socket) => {
    console.log("User connected", socket.id)

    const userId = socket.handshake.query.userId
    console.log("userId", userId)
    if (userId) userSocketMap[userId] = socket.id
    console.log("userSocketMap", userSocketMap)

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id)
        delete userSocketMap[userId]
    })
})

export { io, server, app }

