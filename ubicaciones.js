/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    orderBy
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
const listaUbicaciones = document.getElementById("listaUbicaciones");
const buscador = document.getElementById("buscadorUbicaciones");

const btnNuevaUbicacion = document.getElementById("btnNuevaUbicacion");
const btnVolver = document.getElementById("btnVolver");

/**********************
 * VARIABLES
 **********************/
let ubicaciones = [];

/**********************
 * BOTONES
 **********************/
btnNuevaUbicacion.addEventListener("click", () => {

    window.location.href = "nueva-ubicacion.html";

});

btnVolver.addEventListener("click", () => {

    window.location.href = "stock.html";

});

/**********************
 * CARGAR UBICACIONES
 **********************/
async function cargarUbicaciones() {

    try {

        const q = query(
            collection(db, "ubicaciones"),
            where("activo", "==", true),
            orderBy("nombre")
        );

        const snapshot = await getDocs(q);

        ubicaciones = [];

        snapshot.forEach(doc => {

            ubicaciones.push({
                id: doc.id,
                ...doc.data()
            });

        });

    } catch (error) {

        console.error("Consulta con índice falló:", error);

        const snapshot = await getDocs(collection(db, "ubicaciones"));

        ubicaciones = [];

        snapshot.forEach(doc => {

            const datos = doc.data();

            if (datos.activo) {

                ubicaciones.push({
                    id: doc.id,
                    ...datos
                });

            }

        });

        ubicaciones.sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );

    }

    mostrarUbicaciones(ubicaciones);

}
/**********************
 * MOSTRAR UBICACIONES
 **********************/
function mostrarUbicaciones(lista) {

    listaUbicaciones.innerHTML = "";

    if (lista.length === 0) {

        listaUbicaciones.innerHTML = `
            <li class="ubicacion-item">
                <div class="ubicacion-info">
                    <strong>No se encontraron ubicaciones.</strong>
                </div>
            </li>
        `;

        return;

    }

    lista.forEach(ubicacion => {

        const li = document.createElement("li");
        li.className = "ubicacion-item";

        li.innerHTML = `

            <div class="ubicacion-info">

                <strong>${ubicacion.nombre}</strong>

            </div>

            <button
                class="btn-menu"
                title="Opciones">

                ⋮

            </button>

        `;

        const btnMenu = li.querySelector(".btn-menu");

        btnMenu.addEventListener("click", (e) => {

            e.stopPropagation();

            alert("Próximamente podrás editar, desactivar o eliminar esta ubicación.");

        });

        listaUbicaciones.appendChild(li);

    });

}

/**********************
 * BUSCADOR
 **********************/
buscador.addEventListener("input", () => {

    const texto = buscador.value
        .toLowerCase()
        .trim();

    const resultado = ubicaciones.filter(ubicacion =>

        ubicacion.nombre
            .toLowerCase()
            .includes(texto)

    );

    mostrarUbicaciones(resultado);

});

/**********************
 * INICIAR
 **********************/
cargarUbicaciones();
