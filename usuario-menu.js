import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./firebase.js";

const btnMenu = document.getElementById("btnMenuUsuario");
const opciones = document.getElementById("opcionesUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const nombreUsuario = document.getElementById("nombreUsuario");

// Acceso directo a la agenda desde el menú del usuario.
if (opciones && btnCerrarSesion && !document.getElementById("btnMiAgenda")) {
    const enlaceAgenda = document.createElement("a");
    enlaceAgenda.id = "btnMiAgenda";
    enlaceAgenda.className = "enlace-agenda-usuario";
    enlaceAgenda.href = "agenda.html";
    enlaceAgenda.textContent = "▦ Mi agenda";
    opciones.insertBefore(enlaceAgenda, btnCerrarSesion);
}


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
        if (opciones) opciones.hidden = true;
        btnMenu?.setAttribute("aria-expanded", "false");
    }
});

// Mostrar el nombre guardado en el perfil de Firestore.
onAuthStateChanged(auth, async (usuario) => {
    if (!nombreUsuario || !usuario) return;

    try {
        const referenciaUsuario = doc(db, "usuarios", usuario.uid);
        const documentoUsuario = await getDoc(referenciaUsuario);

        if (documentoUsuario.exists()) {
            const datos = documentoUsuario.data();
            const nombre = (datos.nombre || datos.nombreCompleto || "").trim();

            if (nombre) {
                nombreUsuario.textContent = nombre.toLocaleUpperCase("es-AR");
                return;
            }
        }

        // Alternativas por si el perfil todavía no tiene nombre cargado.
        nombreUsuario.textContent = (
            usuario.displayName ||
            usuario.email?.split("@")[0] ||
            "USUARIO"
        ).toLocaleUpperCase("es-AR");
    } catch (error) {
        console.error("No se pudo cargar el nombre del usuario:", error);
        nombreUsuario.textContent = (
            usuario.displayName ||
            usuario.email?.split("@")[0] ||
            "USUARIO"
        ).toLocaleUpperCase("es-AR");
    }
});

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
