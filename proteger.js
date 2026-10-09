
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebase.js";

export function protegerPagina() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (usuario) => {
      if (!usuario) {
        window.location.replace("login.html");
        return;
      }

      document.body.style.visibility = "visible";
      resolve(usuario);
    });
  });
}
