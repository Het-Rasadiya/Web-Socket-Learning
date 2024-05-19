import express from "express";
const port = 3000;
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// app.use(cookieParser());

app.get(`/`, (req, res) => {
  res.send("Web Socket");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "id1" }, "secret");
  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json("Login Success");
});

const user = true;

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);
    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication error"));
    const decode = jwt.verify(token, "secret");
    next();
  });
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("message", ({ room, message }) => {
    console.log(message);
    socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User join ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
