/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/**********************
 * CONFIG
 **********************/
const firebaseConfig = {
    apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
    authDomain: "inlact.firebaseapp.com",
    projectId: "inlact",
    storageBucket: "inlact.firebasestorage.app",
    messagingSenderId: "143868382036",
    appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/**********************
 * DOM
 **********************/
const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");

const fechaEl = document.getElementById("fecha");
const nombreEnsayoEl = document.getElementById("nombreEnsayo");
const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const elaboracionEl = document.getElementById("elaboracion");
const resultadosEl = document.getElementById("resultados");
const conclusionEl = document.getElementById("conclusion");
const propuestaComercialEl = document.getElementById("propuestaComercial");

/**********************
 * CARGAR CLIENTES
 **********************/
async function cargarClientes() {

    const snap = await getDocs(collection(db, "clientes"));

    snap.forEach(docu => {

        const cliente = docu.data();

        const option = document.createElement("option");

        option.value = docu.id;
        option.textContent = cliente.nombre || "Cliente sin nombre";
        option.dataset.nombre = cliente.nombre || "";

        selectCliente.appendChild(option);

    });

}

/**********************
 * BLOQUE DE IMÁGENES
 **********************/
const accionesForm = document.querySelector(".acciones-form");

accionesForm.insertAdjacentHTML("beforebegin", `
<label>Imágenes</label>

<input
    type="file"
    id="inputFotos"
    accept="image/*"
    multiple
/>

<div id="previewFotos" style="margin-top:12px;"></div>
`);

const fotosInput = document.getElementById("inputFotos");
const previewFotos = document.getElementById("previewFotos");

let fotosSeleccionadas = [];

/**********************
 * PREVIEW
 **********************/
fotosInput.addEventListener("change", () => {

    previewFotos.innerHTML = "";

    fotosSeleccionadas = [];

    const archivos = Array.from(fotosInput.files);

    archivos.forEach(file => {

        fotosSeleccionadas.push(file);

        const img = document.createElement("img");

        img.src = URL.createObjectURL(file);

        img.style.maxWidth = "250px";
        img.style.marginBottom = "12px";
        img.style.borderRadius = "10px";

        previewFotos.appendChild(img);

    });

});

/**********************
 * SUBIR FOTO A STORAGE
 **********************/
async function subirImagen(file) {

    const nombre =
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2) +
        "_" +
        file.name;

    const referencia = ref(storage, "ensayos/" + nombre);

    await uploadBytes(referencia, file);

    return await getDownloadURL(referencia);

}
/**********************
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const clienteOption =
            selectCliente.options[selectCliente.selectedIndex];

        // Subir todas las imágenes a Firebase Storage
        const fotos = [];

        for (const file of fotosSeleccionadas) {

            const url = await subirImagen(file);

            fotos.push(url);

        }

        const nuevoEnsayo = {

            clienteId: selectCliente.value,
            clienteNombre: clienteOption.dataset.nombre,

            nombreEnsayo: nombreEnsayoEl.value,

            fecha: Timestamp.fromDate(
                new Date(fechaEl.value)
            ),

            propuesta: propuestaEl.value || "",

            dosis: dosisEl.value || "",

            elaboracion: elaboracionEl.value || "",

            resultados: resultadosEl.value || "",

            conclusion: conclusionEl.value || "",

            propuestaComercial:
                propuestaComercialEl.value || "",

            fotos: fotos,

            creadoEn: Timestamp.now()

        };

        const docRef = await addDoc(
            collection(db, "ensayos"),
            nuevoEnsayo
        );

        window.location.href =
            `ensayo.html?id=${docRef.id}`;

    }
    catch (error) {

        console.error(error);

        alert(
            "Error al guardar el ensayo.\n\n" +
            error.message
        );

    }

});

/**********************
 * INIT
 **********************/
cargarClientes();
