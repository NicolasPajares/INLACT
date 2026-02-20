import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  const nombreEl = document.getElementById("clienteNombre");

  const contactoInput = document.getElementById("contactoInput");
  const posicionInput = document.getElementById("posicionInput");
  const telefonoInput = document.getElementById("telefonoInput");
  const emailInput = document.getElementById("emailInput");
  const observacionesInput = document.getElementById("observacionesInput");

  const wspLink = document.getElementById("wspLink");
  const mailLink = document.getElementById("mailLink");

  const guardarBtn = document.getElementById("guardarBtn");
  const visitasEl = document.getElementById("listaVisitasCliente");

  if (!clienteId) {
    nombreEl.textContent = "Cliente no especificado";
    return;
  }

  await cargarCliente();
  await cargarVisitas();

  // ===============================
  // CARGAR CLIENTE
  // ===============================
  async function cargarCliente() {
    const ref = doc(db, "clientes", clienteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      nombreEl.textContent = "Cliente no encontrado";
      return;
    }

    const c = snap.data();

    nombreEl.textContent = c.nombre || "Sin nombre";

    contactoInput.value = c.contacto || "";
    posicionInput.value = c.posicion || "";
    telefonoInput.value = c.telefono || "";
    emailInput.value = c.email || "";
    observacionesInput.value = c.observaciones || "";

    actualizarLinks();
  }

  // ===============================
  // GUARDAR CAMBIOS
  // ===============================
  guardarBtn.addEventListener("click", async () => {
    try {
      await updateDoc(doc(db, "clientes", clienteId), {
        contacto: contactoInput.value,
        posicion: posicionInput.value,
        telefono: telefonoInput.value,
        email: emailInput.value,
        observaciones: observacionesInput.value
      });

      actualizarLinks();
      alert("Cliente actualizado ✔");
    } catch (e) {
      console.error(e);
      alert("Error al guardar");
    }
  });

  // ===============================
  // LINKS DINÁMICOS
  // ===============================
  function actualizarLinks() {
    const tel = telefonoInput.value.replace(/\D/g, "");
    const mail = emailInput.value;

    if (tel) {
      wspLink.href = `https://wa.me/54${tel}`;
      wspLink.textContent = "Enviar WhatsApp";
    } else {
      wspLink.textContent = "";
    }

    if (mail) {
      mailLink.href = `mailto:${mail}`;
      mailLink.textContent = "Enviar Email";
    } else {
      mailLink.textContent = "";
    }
  }

  telefonoInput.addEventListener("input", actualizarLinks);
  emailInput.addEventListener("input", actualizarLinks);

  // ===============================
  // HISTORIAL (NO TOCADO)
  // ===============================
  async function cargarVisitas() {
    visitasEl.innerHTML = "";

    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      visitasEl.innerHTML = "<li>No hay visitas registradas</li>";
      return;
    }

    snap.forEach(d => {
      const v = d.data();
      let fecha = "Fecha no válida";

      if (v.fecha?.toDate) {
        fecha = v.fecha.toDate().toLocaleString();
      }

      const li = document.createElement("li");
      li.textContent = fecha;
      visitasEl.appendChild(li);
    });
  }
});
