const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
// Peer

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, rsp) => {
  rsp.redirect(`/${uuidv4()}`);
});

app.get("/:cita", (req, res) => {
  res.render("cita", { citaId: req.params.cita });
});

io.on("connection", (socket) => {
  socket.on("join-cita", (citaId, userId) => {
    socket.join(citaId);
    socket.to(citaId).emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(citaId).emit("createMessage", message);
    });
  });
});

server.listen(process.env.PORT || 3000);
