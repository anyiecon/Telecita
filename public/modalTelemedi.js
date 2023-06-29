function Closemodal(){
  document.getElementsByClassName('modal')[0].style.display = 'none';
}
//SE  REAN FUNCIONES PARA AGREGAR PARTICIPANTES//
function showInvite(){
  document.body.classList.add("showInvite");
  document.getElementById("citaLink").value = window.location.href;
  document.getElementsByClassName('modal')[0].style.display = 'block';
  document.getElementsByClassName('ChatCita')[0].style.display = 'none';
  console.log(document.getElementById("citaLink").value = window.location.href);
  //copyInvite()
};
const hideIvitePopup=()=>{
  document.body.classList.remove("showInvite");
};
function copyInvite(){
  const copyInviteC = document.getElementById("citaLink");
  copyInviteC.select();
  copyInviteC.setSelectionRange(0,99999);
  document.execCommand("copy");
  const aleta = ("Invitación por Link copiado: "+ copyInviteC.value);       
  Swal.fire({
    icon: 'success',
    title: aleta,
    showConfirmButton: false,
    timer: 1200
  })
  hideIvitePopup();
  
};
function Inv_Link(){
  let contenido = document.getElementById("correo_paci").value;
  console.log(contenido);
  if(contenido == ""){
    //alert("debes llenar")
    Swal.fire({
        icon: 'error',
        title: 'Debes digitar el correo',
        timer: 1200
    })
  } 
};

exports = {showInvite,Closemodal,Inv_Link,copyInvite}