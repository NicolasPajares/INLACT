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
  const clienteId = new URLSearchParams(window.location.search).get("id");

  const nombreEl = document.getElementById("clienteNombre");

  const contactoTxt = document.getElementById("contactoTxt");
  const posicionTxt = document.getElementById("posicionTxt");
  const telefonoTxt = document.getElementById("telefonoTxt");
  const emailTxt = document.getElementById("emailTxt");
  const observacionesTxt = document.getElementById("observacionesTxt");

  const contactoInput = document.getElementById("contactoInput");
  const posicionInput = document.getElementById("posicionInput");
  const telefonoInput = document.getElementById("telefonoInput");
  const emailInput = document.getElementById("emailInput");
  const observacionesInput = document.getElementById("observacionesInput");

  const editarBtn = document.getElementById("editarBtn");
  const guardarBtn = document.getElementById("guardarBtn");

  const wspLink = document.getElementById("wspLink");
  const mailLink = document.getElementById("mailLink");

  const visitasEl = document.getElementById("listaVisitasCliente");

  let clienteRef;

  await cargarCliente();
  await cargarVisitas();

  /**********************
   * DATOS CLIENTE
   **********************/
  async function cargarCliente() {
    clienteRef = doc(db, "clientes", clienteId);
    const snap = await getDoc(clienteRef);
    const c = snap.data();

    nombreEl.textContent = c.nombre || "";

    contactoTxt.textContent = c.contacto || "-";
    posicionTxt.textContent = c.posicion || "-";
    telefonoTxt.textContent = c.telefono || "-";
    emailTxt.textContent = c.email || "-";
    observacionesTxt.textContent = c.observaciones || "-";

    contactoInput.value = c.contacto || "";
    posicionInput.value = c.posicion || "";
    telefonoInput.value = c.telefono || "";
    emailInput.value = c.email || "";
    observacionesInput.value = c.observaciones || "";

    actualizarLinks();
    modoLectura();
  }

  function modoLectura() {
    toggleInputs(false);
    editarBtn.hidden = false;
    guardarBtn.hidden = true;
  }

  function modoEdicion() {
    toggleInputs(true);
    editarBtn.hidden = true;
    guardarBtn.hidden = false;
  }

  function toggleInputs(editable) {
    [contactoInput, posicionInput, telefonoInput, emailInput, observacionesInput]
      .forEach(i => i.hidden = !editable);

    [contactoTxt, posicionTxt, telefonoTxt, emailTxt, observacionesTxt]
      .forEach(t => t.hidden = editable);
  }

  editarBtn.onclick = modoEdicion;

  guardarBtn.onclick = async () => {
    await updateDoc(clienteRef, {
      contacto: contactoInput.value,
      posicion: posicionInput.value,
      telefono: telefonoInput.value,
      email: emailInput.value,
      observaciones: observacionesInput.value
    });

    await cargarCliente();
    alert("Cambios guardados ✔");
  };

  function actualizarLinks() {
    const tel = telefonoInput.value.replace(/\D/g, "");
    wspLink.textContent = tel ? "WhatsApp" : "";
    wspLink.href = tel ? `https://wa.me/54${tel}` : "";

    mailLink.textContent = emailInput.value ? "Email" : "";
    mailLink.href = emailInput.value ? `mailto:${emailInput.value}` : "";
  }

  /**********************
   * HISTORIAL CLIENTE
   **********************/
  async function cargarVisitas() {
    visitasEl.innerHTML = "Cargando visitas...";

    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);
    visitasEl.innerHTML = "";

    if (snap.empty) {
      visitasEl.innerHTML = "<p>No hay visitas registradas.</p>";
      return;
    }

    snap.forEach(doc => {
      const v = doc.data();

      const fecha = v.fecha?.toDate
        ? v.fecha.toDate().toLocaleString("es-AR")
        : "Sin fecha";

      const tipo = v.tipoVisita || "Sin tipo";

      let clase = "";
      if (tipo === "Visita comercial") clase = "comercial";
      if (tipo === "Ensayo") clase = "ensayo";
      if (tipo === "Entrega de productos") clase = "entrega";

      let productosHTML = "";
      if (tipo === "Entrega de productos" && Array.isArray(v.productos)) {
        productosHTML = v.productos.map(p =>
          `<div class="producto">📦 ${p.nombre} ${p.cantidad ? `(${p.cantidad})` : ""}</div>`
        ).join("");
      }

      const div = document.createElement("div");
      div.className = "visita";

      div.innerHTML = `
        <div class="fecha">${fecha}</div>
        <span class="badge ${clase}">${tipo}</span>
        ${productosHTML}
      `;

      visitasEl.appendChild(div);
    });
  }
});
