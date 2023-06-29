//chat
const contenido = document.getElementById("add_docs");

const showChat = (e) => {
  e.classList.toggle("active");
  document.body.classList.toggle("showChat");
  console.log(document.body.classList.toggle("showChat"));
  document.getElementsByClassName('ChatCita')[0].style.display = 'inline-flex';
  document.getElementsByClassName('modal')[0].style.display = 'none';
};
const CloseChat = () => {
  document.getElementsByClassName('ChatCita')[0].style.display = 'none';
}
const playChatSound = () => {
  const chatAudio = document.getElementById("chatAudio");
  //chatAudio.play()
}
const speakText = (msgTxt) => {
  var message = new SpeechSynthesisUtterance();
  message.text = msgTxt;
  window.speechSynthesis.speak(message)
}

contenido.addEventListener("change", function () {
  const selectedFile = contenido.files[0];
  //console.log(selectedFile);
  const url = 'http://localhost:3000/uploaddocstelemedicina';
  const formData = new FormData();
  formData.append('myFile', selectedFile);
  //console.log(formData);
  fetch(url, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      return response.json()
    })
    .then(response => {
      const nameFile = response.nameFile;
      const data = response.url

      if (data.match(/(http(s)?:\/\/[^\s]+)/g)) {
        document.getElementById("chat_message-url").value = nameFile;
        document.getElementById("chat_message").value = data;
      } else {
        console.log("El texto no contiene un URL");
      }
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: "Lo sentimos, este tipo de documento no es compatible",
    });
  });
});


