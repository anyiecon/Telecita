const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const path = require('path');

const cors = require("cors");
const multer = require("multer");

app.use(cors());

//AQUÍ SE SUBIARN AS DOCUMENTOS ADJUNTADOS
app.use(express.static("./public/docs"));

// Peer

const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/salida", (req, res) => {
  res.render("salida.ejs");
});

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});
app.get("/:cita", (req, res) => {
  res.render("telemedicina.ejs", { citaId: req.params.cita });
});

//LLAMADA DE TELECITA
io.on("connection", (socket) => {
  let userNames = [];//GUARDA LOS NOMBRES DEL INICIO PARA EL CHAT

  socket.on("join-cita", (citaId, userId) => {
    socket.join(citaId);
    socket.to(citaId).emit("user-connected", userId);
    //console.log('Se ha connectado otro usuario ' + userId + " sokect id " + userId);

    socket.on("disconnect", function () {
      io.to(citaId).emit("user-disconnected", userId);
      //console.log('User Disconnect ' + userId);
    })
    
    //USUARIOS NUEVOS PARA EL CHAT
    socket.on('new user', (data, cb) => {
      if (userNames.indexOf(data) != -1) {
        cb(false)
      }
      else {
        cb(true)
        socket.nickname = data;
        userNames.push(socket.nickname);
      }
    });

    socket.on("message", (message) => {
      io.to(citaId).emit("createMessage", {
        message: message,
        user: socket.nickname
      });
    });
  });
});


//ADJUNTAR ARCHIVO
//REQUERIMIENTOS Y FORMATO DE GUARDADO DE LOS ARCHIVOS
const storage = multer.diskStorage({
  filename: function (res, file, cb) {
    const ext = file.originalname.split(".").pop();
    const fileNamess = file.originalname.indexOf(".");
    const fileName = file.originalname.substring(0, fileNamess)
    var today = new Date();
    var ss = today.getSeconds()
    //VALIDACIONES DE LAS EXTENCIONES ADMITIDAS
    const fileTypes = /jpeg|jpg|png|pdf|docx|oform|docxf/;
    const mimetype = fileTypes.test(file.mimetype);
    console.log(mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    console.log(extname);
    if (mimetype && extname) {
      return cb(null, `${fileName}${ss}.${ext}`);
    }
    cb(`error solo se pueden abjuntar ${fileTypes}`)
  },
  destination: function (res, file, cb) {
    cb(null, `./public/docs`);
  },
});

//SUBIR ARCHIVOS
const upload = multer({
  storage
});
app.post("/uploaddocstelemedicina", upload.single("myFile"), (req, res) => {
  const file = req.file.filename;
  console.log(file)
  res.send({ data: "OK", url: `http://localhost:3000/${file}`, nameFile: `${file}` });
});

server.listen(process.env.PORT || 3000);
