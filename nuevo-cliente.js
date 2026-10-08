
import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**********************
 * ELEMENTOS DEL FORMULARIO
 **********************/
const form = document.getElementById("formNuevoCliente");

const nombreEl = document.getElementById("nombre");
const localidadEl = document.getElementById("localidad");
const provinciaEl = document.getElementById("provincia");
const latEl = document.getElementById("lat");
const lngEl = document.getElementById("lng");
const radioEl = document.getElementById("radio");

const titulo = document.querySelector(".card-formulario h1");
const btnGuardar = form.querySelector(".btn-guardar");

/**********************
 * MODO CREACIÓN O EDICIÓN
 **********************/
const parametros = new URLSearchParams(window.location.search);
const clienteId = parametros.get("id");

let modoEdicion = Boolean(clienteId);

/**********************
 * CARGAR DATOS PARA EDITAR
 **********************/
async function cargarClienteParaEditar() {
  if (!modoEdicion) return;

  titulo.textContent = "Editar cliente";
  btnGuardar.textContent = "💾 Guardar cambios";
  document.title = "INLACT · Editar cliente";

  try {
    const referencia = doc(db, "clientes", clienteId);
    const resultado = await getDoc(referencia);

    if (!resultado.exists()) {
      alert("No se encontró el cliente que querés editar.");
      window.location.href = "clientes.html";
      return;
    }

    const cliente = resultado.data();

    nombreEl.value = cliente.nombre || "";
    localidadEl.value = cliente.localidad || "";
    provinciaEl.value = cliente.provincia || "";
    latEl.value = cliente.lat ?? "";
    lngEl.value = cliente.lng ?? "";
    radioEl.value = cliente.radio ?? 1000;

  } catch (error) {
    console.error("Error cargando el cliente:", error);
    alert("No se pudieron cargar los datos del cliente.");
    window.location.href = "clientes.html";
  }
}

/**********************
 * GUARDAR CLIENTE
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreEl.value.trim();
  const localidad = localidadEl.value.trim();
  const provincia = provinciaEl.value.trim();
  const lat = parseFloat(latEl.value);
  const lng = parseFloat(lngEl.value);
  const radio = parseInt(radioEl.value, 10) || 1000;

  if (!nombre || Number.isNaN(lat) || Number.isNaN(lng)) {
    alert("Completá nombre, latitud y longitud con valores válidos.");
    return;
  }

  const cliente = {
    nombre,
    localidad,
    provincia,
    lat,
    lng,
    radio
  };

  btnGuardar.disabled = true;

  try {
    if (modoEdicion) {
      await updateDoc(doc(db, "clientes", clienteId), cliente);
      alert("✅ Cliente actualizado correctamente");
    } else {
      cliente.contacto = "";
      cliente.puesto = "";
      cliente.telefono = "";
      cliente.email = "";
      cliente.observaciones = "";
      cliente.tipo = "cliente";

      await addDoc(collection(db, "clientes"), cliente);
      alert("✅ Cliente creado correctamente");
    }

    window.location.href = "clientes.html";

  } catch (error) {
    console.error("Error guardando el cliente:", error);
    alert(
      modoEdicion
        ? "❌ No se pudieron guardar los cambios."
        : "❌ Error al crear el cliente."
    );
  } finally {
    btnGuardar.disabled = false;
  }
});

/**********************
 * INICIO
 **********************/
cargarClienteParaEditar();
