
/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    getDoc,
    updateDoc,
    doc,
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

const tituloFormulario = document.querySelector(".card-formulario h1");
const btnGuardar = form.querySelector(".btn-guardar");

const parametros = new URLSearchParams(window.location.search);
const ensayoId = parametros.get("id");
const modoEdicion = Boolean(ensayoId);

/**********************
 * IMÁGENES
 **********************/
const accionesForm = document.querySelector(".acciones-form");

accionesForm.insertAdjacentHTML("beforebegin", `
    <label for="inputFotos">Imágenes</label>

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
let fotosExistentes = [];

/**********************
 * MOSTRAR PREVISUALIZACIÓN
 **********************/
function mostrarPreviewFotos() {
    previewFotos.innerHTML = "";

    fotosExistentes.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Imagen guardada del ensayo";
        img.style.maxWidth = "250px";
        img.style.marginRight = "10px";
        img.style.marginBottom = "12px";
        img.style.borderRadius = "10px";

        previewFotos.appendChild(img);
    });

    fotosSeleccionadas.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.alt = "Nueva imagen seleccionada";
        img.style.maxWidth = "250px";
        img.style.marginRight = "10px";
        img.style.marginBottom = "12px";
        img.style.borderRadius = "10px";

        previewFotos.appendChild(img);
    });
}

fotosInput.addEventListener("change", () => {
    fotosSeleccionadas = Array.from(fotosInput.files);
    mostrarPreviewFotos();
});

/**********************
 * SUBIR IMAGEN A STORAGE
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
 * CARGAR ENSAYO PARA EDITAR
 **********************/
async function cargarEnsayoParaEditar() {
    if (!modoEdicion) return;

    tituloFormulario.textContent = "Editar ensayo";
    btnGuardar.textContent = "💾 Guardar cambios";
    document.title = "INLACT · Editar ensayo";

    const referencia = doc(db, "ensayos", ensayoId);
    const snap = await getDoc(referencia);

    if (!snap.exists()) {
        alert("No se encontró el ensayo que querés editar.");
        window.location.href = "ensayos.html";
        return;
    }

    const data = snap.data();

    selectCliente.value = data.clienteId || "";
    nombreEnsayoEl.value = data.nombreEnsayo || "";

    if (data.fecha?.toDate) {
        const fecha = data.fecha.toDate();
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        fechaEl.value = `${anio}-${mes}-${dia}`;
    } else if (data.fecha) {
        const fecha = new Date(data.fecha);

        if (!Number.isNaN(fecha.getTime())) {
            const anio = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
            const dia = String(fecha.getDate()).padStart(2, "0");

            fechaEl.value = `${anio}-${mes}-${dia}`;
        }
    }

    propuestaEl.value = data.propuesta || "";
    dosisEl.value = data.dosis || "";
    elaboracionEl.value = data.elaboracion || "";
    resultadosEl.value = data.resultados || "";
    conclusionEl.value = data.conclusion || "";
    propuestaComercialEl.value = data.propuestaComercial || "";

    fotosExistentes = Array.isArray(data.fotos) ? [...data.fotos] : [];

    mostrarPreviewFotos();
}

/**********************
 * GUARDAR O ACTUALIZAR
 **********************/
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    const clienteOption =
        selectCliente.options[selectCliente.selectedIndex];

    if (!selectCliente.value || !clienteOption) {
        alert("Seleccioná un cliente para el ensayo.");
        return;
    }

    btnGuardar.disabled = true;

    try {
        /* CONSERVAR FOTOS Y AGREGAR LAS NUEVAS */
        const fotos = [...fotosExistentes];

        for (const file of fotosSeleccionadas) {
            const url = await subirImagen(file);
            fotos.push(url);
        }

        const datosEnsayo = {
            clienteId: selectCliente.value,
            clienteNombre: clienteOption.dataset.nombre ||
                clienteOption.textContent,

            nombreEnsayo: nombreEnsayoEl.value.trim(),

            fecha: Timestamp.fromDate(
                new Date(`${fechaEl.value}T12:00:00`)
            ),

            propuesta: propuestaEl.value || "",
            dosis: dosisEl.value || "",
            elaboracion: elaboracionEl.value || "",
            resultados: resultadosEl.value || "",
            conclusion: conclusionEl.value || "",
            propuestaComercial: propuestaComercialEl.value || "",
            fotos
        };

        if (modoEdicion) {
            await updateDoc(
                doc(db, "ensayos", ensayoId),
                datosEnsayo
            );

            window.location.href = `ensayo.html?id=${encodeURIComponent(ensayoId)}`;
        } else {
            datosEnsayo.creadoEn = Timestamp.now();

            const docRef = await addDoc(
                collection(db, "ensayos"),
                datosEnsayo
            );

            window.location.href =
                `ensayo.html?id=${encodeURIComponent(docRef.id)}`;
        }

    } catch (error) {
        console.error("Error guardando el ensayo:", error);

        alert(
            "Error al guardar el ensayo.\n\n" +
            error.message
        );
    } finally {
        btnGuardar.disabled = false;
    }
});

/**********************
 * INIT
 **********************/
async function iniciar() {
    try {
        await cargarClientes();
        await cargarEnsayoParaEditar();
    } catch (error) {
        console.error("Error inicializando el formulario:", error);
        alert("No se pudieron cargar los datos. Intentá nuevamente.");
    }
}

iniciar();
