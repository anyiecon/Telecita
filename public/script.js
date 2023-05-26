const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

//SE HACE LA CONFIGURACIÓN CON WEB RTC
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3000",

  config:{
    iceServers:[
      {
        url:"turn:numb.viagenie.ca",
        credential:"muazkh",
        username:"webrtc@live.com"
      }
    ]
  }
});

let myVideoStream;
let currentUserId;

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", {
          msg: chatInputBox.value,
          user: currentUserId,
          });
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (msg) => {
      console.log(msg);
      let li = document.createElement("li");
      li.innerHTML = msg;
      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });

  });

peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  socket.emit("join-cita", ROOM_ID, id);
});


//SE CREAN FUNCIONES PARA LA VIZUALIZACIÓN O NO DE LA CAMARÀ DE VIDEO///
const connectToNewUser = (userId, streams) => {
  var call = peer.call(userId, streams);
  console.log(call);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);
  });
};
const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  videoGrid.append(videoEl);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
const setPlayVideo = () => {
    const html = `<i class="unmute fa fa-pause-circle"></i>
    <span class="unmute">Video Pausado</span>`;
    document.getElementById("playPauseVideo").innerHTML = html;
};
const setStopVideo = () => {
    const html = `<i class=" fa fa-video-camera"></i>
    <span class="">Video Activo</span>`;
    document.getElementById("playPauseVideo").innerHTML = html;
};

//SE CREAN LAS FUNCIONES DEL MICROFONO //
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Audio muteado</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>
  <span>Audio Activo</span>`;
  document.getElementById("muteButton").innerHTML = html;
};

//SE  REAN FUNCIONES PARA AGREGAR PARTICIPANTES//
const showInvite = ()=>{
    document.body.classList.add("showInvite");
    document.getElementById("citaLink").value = window.location.href;
    console.log(document.getElementById("citaLink").value = window.location.href);
    //copyInvite()
};
const hideIvitePopup=()=>{
    document.body.classList.remove("showInvite");
};
const copyInvite =()=>{
    const copyInviteC = document.getElementById("citaLink");

    copyInviteC.select();
    copyInviteC.setSelectionRange(0,99999);

    document.execCommand("copy");

    alert("Copiado: "+ copyInviteC.value);

    hideIvitePopup();
}

//chat
const showChat=(e)=>{
    e.classList.toggle("active");
    document.body.classList.toggle("showChat");
    console.log( document.body.classList.toggle("showChat"));
}