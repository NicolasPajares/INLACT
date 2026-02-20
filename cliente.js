// cliente.js
import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  const nombreEl = document.getElementById("clienteNombre");
  const datosEl = document.getElementById("clienteDatos");

  if (!clienteId) {
    nombreEl.textContent = "Cliente no especificado";
    return;
  }

  try {
    // 🔥 DOCUMENTO DIRECTO (clave del arreglo)
    const ref = doc(db, "clientes", clienteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      nombreEl.textContent = "Cliente no encontrado";
      return;
    }

    const cliente = snap.data();

    nombreEl.textContent = cliente.nombre || "Sin nombre";

    datosEl.innerHTML = `
      <p><strong>Localidad:</strong> ${cliente.localidad || "-"}</p>
      <p><strong>Provincia:</strong> ${cliente.provincia || "-"}</p>
      <p><strong>ID:</strong> ${snap.id}</p>
    `;

  } catch (error) {
    console.error("❌ Error al cargar cliente:", error);
    nombreEl.textContent = "Error al cargar cliente";
  }
});
