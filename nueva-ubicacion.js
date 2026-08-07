/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**********************
 * CONFIG FIREBASE
 **********************/
const firebaseConfig = {
    apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
    authDomain: "inlact.firebaseapp.com",
    projectId: "inlact",
    storageBucket: "inlact.appspot.com",
    messagingSenderId: "143868382036",
    appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**********************
 * ELEMENTOS
 **********************/
const form = document.getElementById("formUbicacion");

const nombre = document.getElementById("nombre");

const btnCancelar = document.getElementById("btnCancelar");

/**********************
 * CANCELAR
 **********************/
btnCancelar.addEventListener("click", () => {

    window.location.href = "ubicaciones.html";

});

/**********************
 * VERIFICAR SI EXISTE
 **********************/
async function ubicacionExiste(nombreUbicacion) {

    const q = query(
        collection(db, "ubicaciones"),
        where("nombre", "==", nombreUbicacion)
    );

    const snap = await getDocs(q);

    return !snap.empty;

}
/**********************
 * GUARDAR UBICACIÓN
 **********************/
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nuevaUbicacion = {

        nombre: nombre.value.trim(),

        activo: true,

        fechaCreacion: Timestamp.now()

    };

    /*==============================
      VALIDACIÓN
    ==============================*/

    if (nuevaUbicacion.nombre === "") {

        alert("Debe ingresar el nombre de la ubicación.");

        nombre.focus();

        return;

    }

    /*==============================
      UBICACIÓN DUPLICADA
    ==============================*/

    if (await ubicacionExiste(nuevaUbicacion.nombre)) {

        alert("Ya existe una ubicación con ese nombre.");

        nombre.focus();

        return;

    }

    /*==============================
      GUARDAR
    ==============================*/

    try {

        await addDoc(

            collection(db, "ubicaciones"),

            nuevaUbicacion

        );

        alert("Ubicación creada correctamente.");

        window.location.href = "ubicaciones.html";

    }

    catch (error) {

        console.error(error);

        alert("Ocurrió un error al guardar la ubicación.");

    }

});
