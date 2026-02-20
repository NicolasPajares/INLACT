import { db } from "./firebase.js";
import {
  doc,
  getDoc,
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
  const datosEl = document.getElementById("clienteDatos");
  const visitasEl = document.getElementById("listaVisitasCliente");

  if (!clienteId) {
    nombreEl.textContent = "Cliente no especificado";
    return;
  }

  await cargarCliente(clienteId);
  await cargarVisitas(clienteId);

  // ===============================
  // CLIENTE
  // ===============================
  async function cargarCliente(id) {
    try {
      const ref = doc(db, "clientes", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        nombreEl.textContent = "Cliente no encontrado";
        return;
      }

      const c = snap.data();

      nombreEl.textContent = c.nombre || "Sin nombre";

      datosEl.innerHTML = `
        <p><strong>Contacto:</strong> ${c.contacto || "-"}</p>
        <p><strong>Posición:</strong> ${c.posicion || "-"}</p>
        <p><strong>Teléfono:</strong> ${c.telefono || "-"}</p>
        <p><strong>Email:</strong> ${c.email || "-"}</p>
        <p><strong>Observaciones:</strong></p>
        <p>${c.observaciones || "-"}</p>
      `;
    } catch (error) {
      console.error("❌ Error cargando cliente:", error);
      nombreEl.textContent = "Error al cargar cliente";
    }
  }

  // ===============================
  // VISITAS / HISTORIAL
  // ===============================
  async function cargarVisitas(clienteId) {
    try {
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

      snap.forEach(docu => {
        const v = docu.data();

        let fechaFormateada = "Fecha no válida";

        if (v.fecha) {
          if (typeof v.fecha.toDate === "function") {
            fechaFormateada = v.fecha.toDate().toLocaleString();
          } else if (typeof v.fecha === "number") {
            fechaFormateada = new Date(v.fecha).toLocaleString();
          } else if (typeof v.fecha === "string") {
            fechaFormateada = new Date(v.fecha).toLocaleString();
          }
        }

        const li = document.createElement("li");
        li.textContent = fechaFormateada;
        visitasEl.appendChild(li);
      });
    } catch (error) {
      console.error("❌ Error cargando visitas:", error);
      visitasEl.innerHTML = "<li>Error al cargar historial</li>";
    }
  }
});
