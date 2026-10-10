
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./firebase.js";

// Perfil del usuario que inició sesión.
export let perfilUsuario = null;

export function obtenerPerfilUsuario() {
  return perfilUsuario;
}

export function protegerPagina() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        perfilUsuario = null;
        window.location.replace("login.html");
        return;
      }

      try {
        // Buscar el perfil usando el UID de Firebase Authentication.
        const referenciaUsuario = doc(db, "usuarios", usuario.uid);
        const documentoUsuario = await getDoc(referenciaUsuario);

        if (!documentoUsuario.exists()) {
          perfilUsuario = null;
          document.body.style.visibility = "hidden";

          alert(
            "Tu cuenta no tiene un perfil habilitado en INLACT. " +
            "Contactá al administrador."
          );

          reject(new Error("No existe el perfil del usuario en Firestore."));
          return;
        }

        const datos = documentoUsuario.data();

        perfilUsuario = {
          uid: usuario.uid,
          email: usuario.email || "",
          nombre: datos.nombre || datos.nombreCompleto || "",
          rol: datos.rol || "sin_rol"
        };

        document.body.style.visibility = "visible";

        // Se mantiene el usuario autenticado como valor de retorno.
        resolve(usuario);

      } catch (error) {
        perfilUsuario = null;
        document.body.style.visibility = "hidden";

        console.error("Error al verificar el perfil del usuario:", error);

        alert(
          "No se pudo verificar tu perfil de INLACT. " +
          "Revisá tu conexión e intentá nuevamente."
        );

        reject(error);
      }
    });
  });
}
