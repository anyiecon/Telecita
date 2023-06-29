const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const chatInputBoxname = document.getElementById("chat_messages");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoUser = document.getElementById("video-user");
const videoUsers = document.getElementById("video-users");
const myVideo = document.createElement("video");
const rightVideo = document.getElementById('rightVideo');
const leave_meeting = document.getElementById('leave-meeting');
//INICIO DE SESIÓN
const nickname = document.getElementById('nickname');
const nickFrom = document.getElementById('nickFrom');
const userName = document.getElementById('userName');
//const nickWrap = document.getElementById('nickWrap');

'use strict';

const share = document.getElementById('share');
myVideo.muted = true;

//SE HACE LA CONFIGURACIÓN CON WEB RTC
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3000",

  // config: {
  //   iceServers: [
  //     {
  //       url: "turn:numb.viagenie.ca",
  //       credential: "muazkh",
  //       username: "webrtc@live.com"
  //     },
  //     {
  //       url: "turn:turn.bistri.com:80",
  //       credential: "homeo",
  //       username: "homeo"
  //     }, {
  //       url: "turn:turn.anyfirewall.com:443?transport=tcp",
  //       credential: "webrct",
  //       username: "webrtc"
  //     }, {
  //       url: "turn:turn.anyfirewall.com:443?transport=tcp",
  //       credential: "webrct",
  //       username: "webrtc"
  //     }
  //   ]
  // }
});

let myVideoStream;
let currentUserId;
let pendingMsg = 0;
let peers = {};
var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

nickFrom.addEventListener("click", () => {
  
  if (nickname.value != "") {
    socket.emit('new user', nickname.value, data => {
      console.log(data);
      if (data) {
          console.log(data);
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then((stream) => {
            myVideoStream = stream;
            //addVideoStream(myVideo, stream, "me");
            addVideoStream(myVideo, stream, currentUserId);

            peer.on("call", (call) => {
              call.answer(stream);
              const video = document.createElement("video");
              call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
                console.log(peers);
              });
            });
            socket.on("user-connected", (userId) => {
              connectToNewUser(userId, stream);
            });

            socket.on("user-disconnected", (userId) => {
              if (peers[userId]) {
                peers[userId].close();
                //console.log("user disconnet " + peers[userId]);
              }
            });
            socket.on("disconnect", function () {
              socket.emit("leave-cita", ROOM_ID, currentUserId);
            });

            document.addEventListener("keydown", (e) => {
              if (e.which === 13 && chatInputBox.value != "") {
                socket.emit("message", chatInputBox.value);
                chatInputBox.value = "";
              }
            });
            chatInputBox.addEventListener("focus", () => {
              document.getElementById("chat_Btn").classList.add("has_new");
              pendingMsg = 0;
              document.getElementById("chat_Btn").children[1].innerHTML = `Chat`
            });
            //chat
            socket.on("createMessage", (message) => {
              if (message.user != message.currentUserId) {
                let li = document.createElement("li");
                const img = document.createElement("img");
                const p = document.createElement("p");
                const div = document.createElement("div");
                const div2 = document.createElement("div");
                const div3 = document.createElement("div");
                const div4 = document.createElement("div");
                const p2 = document.createElement("p");
                const a = document.createElement("a");
                var today = new Date();
                var now = today.toLocaleTimeString('en-US');
                const messg = message.message;
                const url = document.getElementById("all_messages").value = messg;
                const text = url.split("/")[3];
                //console.log(messg);
                p2.append(now)
                p2.classList.add("otherUser-p2");
                if (messg.match(/(http(s)?:\/\/[^\s]+)/g)) {
                  if (messg.endsWith(".pdf") || messg.endsWith(".png") || messg.endsWith(".jpeg") || messg.endsWith(".jpg") || messg.endsWith(".docx") || messg.endsWith(".oform") || messg.endsWith(".docxf")) {
                    if (messg.endsWith(".pdf")) {
                      img.src = "./image/PDF.png";
                    }
                    else if (messg.endsWith(".docx") || messg.endsWith(".oform") || messg.endsWith(".docxf")) {
                      img.src = "./image/docx.png";
                    }
                    else {
                      img.src = messg
                    }
                    img.classList.add("otherUser");
                    div.classList.add("otherUsers");
                    p.classList.add("otherUser");
                    p.innerHTML = `<div><b><small>${message.user}</samll>:</b></div>`
                    img.innerHTML = `<div><b><small>${p}</samll>:<b>${message.message}</b></div>`
                    div2.classList.add("otherUser-urlname");
                    div.append(p, div2);
                    a.href = url
                   //a.img = img;
                    a.download = text;
                    a.textContent = `⬇️ Descargar ${text}`
                    a.classList.add("a-download")
                    div3.classList.add("divdata")
                    div3.append(a)
                    div4.classList.add("divdata-img")
                    div4.append(img)
                    div2.append(div4, div3)
                    all_messages.append(div, p2)
                  }
                }
                else {
                  li.classList.add("otherUser");
                  li.innerHTML = `<div><b><small>${message.user}</samll>: </b>${message.message}</div>`
                  all_messages.append(li);
                }
              } else { console.log("hola"); }
              main__chat__window.scrollTop = main__chat__window.scrollHeight;
              if (message.user != message.currentUserId) {
                pendingMsg++;
                playChatSound()
                document.getElementById("chat_Btn").classList.add("has_new");
                document.getElementById("chat_Btn").children[1].innerHTML = `Chat (${pendingMsg})`
              }

            });
          });
        document.getElementsByClassName('body2')[0].style.display = 'none';
        document.getElementsByClassName('main')[0].style.display = 'block';
      }
    });
  }
  else {
    Swal.fire({
      icon: 'error',
      title: 'Debes digitar los campos',
      timer: 1500
    })
  }
});
//Audio
peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream, currentUserId);
        // addVideoStream(video, remoteStream,currentUserId);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  currentUserId = id;
  socket.emit("join-cita", ROOM_ID, id);
});

// socket.on("disconnect", function () {
//   socket.emit("leave-cita", ROOM_ID, currentUserId);
// });


//SE CREAN FUNCIONES PARA LA VIZUALIZACIÓN O NO DE LA CAMARÀ DE VIDEO///
function connectToNewUser(userId, streams) {
  var call = peer.call(userId, streams);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    //console.log(userVideoStream);
    addVideoStream(video, userVideoStream, userId);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
  
};

function addVideoStream(videoEl, stream, uId = "") {
  videoEl.srcObject = stream;
  videoEl.id = uId;
  videoEl.classList.add("videouser");
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  videoUser.append(videoEl);
  //myVideo.append(videoEl)
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};

function playStop() {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
function setPlayVideo() {
  const html = `<i class="unmute fa fa-pause-circle"></i>
    <span  class="unmute">Video Pausado</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};
function setStopVideo() {
  const html = `<i class=" fa fa-video-camera"></i>
    <span class="">Video Activo</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

//SE CREAN LAS FUNCIONES DEL MICROFONO //
function muteUnmute() {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
function setUnmuteButton() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
  const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Audio muteado</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
function setMuteButton() {
  const html = `<i class="fa fa-microphone"></i>
  <span>Audio Activo</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
/*
//COMPARTIR PANTALLA//
// function handleSuccess(stream) {
//   share.disabled = true;
//   const rightVideo = document.getElementById('rightVideo');
//   document.getElementById("rightVideo").style.display= 'block';
//   rightVideo.srcObject = stream;
//   stream.getVideoTracks()[0].addEventListener('ended', () => {
//     errorMsg('The user has ended sharing the screen');
//     share.disabled = false;
//   });
// }

// share.addEventListener('click', () => {
//   const options = {audio: true, video: true};
//   navigator.mediaDevices.getDisplayMedia(options)
//       .then(handleSuccess);
// });

// if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
//   share.disabled = false;
// } else {
//   errorMsg('getDisplayMedia is not supported');
// }

// share.addEventListener('click', () => {
//   const options = {audio: true, video: true};
//   navigator.mediaDevices.getDisplayMedia(options)
//       .then(handleSuccess);
// });

// if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
//   share.disabled = false;
// } else {
//   errorMsg('getDisplayMedia is not supported');
// }
*/

function closeCita() {
  //window.close();
  location.href = "https://toc.com.co/"
}
