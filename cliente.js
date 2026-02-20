console.log("🔥 Project ID:", db._databaseId.projectId);
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

  /* =========================
     CARGAR CLIENTE
     ========================= */
  try {
    const ref = doc(db, "clientes", clienteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      nombreEl.textContent = "Cliente no encontrado";
      visitasEl.innerHTML = "";
      return;
    }

    const cliente = snap.data();

    nombreEl.textContent = cliente.nombre || "Sin nombre";

    datosEl.innerHTML = `
      <p><strong>Email:</strong> ${cliente.email || "-"}</p>
      <p><strong>Localidad:</strong> ${cliente.localidad || "-"}</p>
      <p><strong>Provincia:</strong> ${cliente.provincia || "-"}</p>
      <p><strong>ID:</strong> ${snap.id}</p>
    `;
  } catch (e) {
    console.error("❌ Error al cargar cliente:", e);
    nombreEl.textContent = "Error al cargar cliente";
    visitasEl.innerHTML = "";
    return;
  }

  /* =========================
     CARGAR VISITAS DEL CLIENTE
     ========================= */
  try {
    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);

    visitasEl.innerHTML = "";

    if (snap.empty) {
      visitasEl.innerHTML = "<li>No hay visitas registradas</li>";
      return;
    }

    snap.forEach(doc => {
      const v = doc.data();
      const fecha = v.fecha?.toDate
        ? v.fecha.toDate().toLocaleString("es-AR")
        : "Sin fecha";

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${fecha}</strong><br>
        <small>${v.usuario || ""}</small>
      `;

      visitasEl.appendChild(li);
    });
  } catch (e) {
    console.error("❌ Error al cargar visitas:", e);
    visitasEl.innerHTML = "<li>Error al cargar visitas</li>";
  }
});

