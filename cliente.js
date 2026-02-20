import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  const nombreEl = document.getElementById("clienteNombre");
  const datosEl = document.getElementById("clienteDatos");
  const visitasEl = document.getElementById("listaVisitasCliente");

  if (!clienteId) {
    nombreEl.textContent = "Cliente no especificado";
    return;
  }

  // ===============================
  // CLIENTE
  // ===============================
  try {
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);

    if (!clienteSnap.exists()) {
      nombreEl.textContent = "Cliente no encontrado";
      return;
    }

    const cliente = clienteSnap.data();

    nombreEl.textContent = cliente.nombre;

    datosEl.innerHTML = `
      <p><strong>Localidad:</strong> ${cliente.localidad || "-"}</p>
      <p><strong>Provincia:</strong> ${cliente.provincia || "-"}</p>
      <p><strong>ID:</strong> ${clienteId}</p>
    `;
  } catch (error) {
    console.error("❌ Error cargando cliente:", error);
    nombreEl.textContent = "Error cargando cliente";
    return;
  }

  // ===============================
  // VISITAS DEL CLIENTE
  // ===============================
  visitasEl.innerHTML = "<li>Cargando visitas...</li>";

  try {
    const visitasRef = collection(db, "visitas");
    const q = query(
      visitasRef,
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );

    const querySnap = await getDocs(q);
    visitasEl.innerHTML = "";

    if (querySnap.empty) {
      visitasEl.innerHTML = "<li>No hay visitas registradas</li>";
      return;
    }

    querySnap.forEach(docSnap => {
      const v = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${v.fecha} ${v.hora || ""}</strong><br>
        <small>${v.usuarioNombre || ""}</small>
      `;
      visitasEl.appendChild(li);
    });

  } catch (error) {
    console.error("❌ Error cargando visitas:", error);
    visitasEl.innerHTML = "<li>Error cargando visitas</li>";
  }
});
