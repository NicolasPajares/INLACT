
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebase.js";

const btnMenu = document.getElementById("btnMenuUsuario");
const opciones = document.getElementById("opcionesUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const nombreUsuario = document.getElementById("nombreUsuario");

// Mostrar el menú del usuario
btnMenu?.addEventListener("click", (e) => {
    e.stopPropagation();

    const abierto = !opciones.hidden;
    opciones.hidden = abierto;
    btnMenu.setAttribute("aria-expanded", String(!abierto));
});

// Cerrar el menú al hacer clic afuera
document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-usuario")) {
        opciones.hidden = true;
        btnMenu.setAttribute("aria-expanded", "false");
    }
});

// Mostrar el nombre de la cuenta si está configurado en Firebase
const usuario = auth.currentUser;

if (usuario?.displayName) {
    nombreUsuario.textContent = usuario.displayName.toUpperCase();
} else if (usuario?.email) {
    // Mientras no haya nombre configurado, conservar el nombre actual.
    nombreUsuario.textContent = "NICOLÁS PAJARES";
}

// Cerrar sesión
btnCerrarSesion?.addEventListener("click", async () => {
    btnCerrarSesion.disabled = true;
    btnCerrarSesion.textContent = "Cerrando sesión...";

    try {
        await signOut(auth);
        window.location.replace("login.html");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("No se pudo cerrar la sesión. Intentá nuevamente.");
        btnCerrarSesion.disabled = false;
        btnCerrarSesion.textContent = "↪ Cerrar sesión";
    }
});
