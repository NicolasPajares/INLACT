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

const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("Cliente no encontrado");
  throw new Error("Sin clienteId");
}

const clienteRef = doc(db, "clientes", clienteId);

// =====================
// CARGAR CLIENTE
// =====================
async function cargarCliente() {
  try {
    const snap = await getDoc(clienteRef);

    if (!snap.exists()) {
      alert("Cliente no existe");
      return;
    }

    const c = snap.data();

    document.getElementById("clienteNombre").textContent = c.nombre || "(Sin nombre)";
    document.getElementById("contacto").textContent = c.contacto || "";
    document.getElementById("posicion").textContent = c.posicion || "";
    document.getElementById("telefono").textContent = c.telefono || "";
    document.getElementById("email").textContent = c.email || "";
    document.getElementById("direccion").textContent = c.direccion || "";
    document.getElementById("zona").textContent = c.zona || "";
    document.getElementById("observaciones").value = c.observaciones || "";

  } catch (e) {
    console.error("❌ Error cargando cliente:", e);
  }
}

// =====================
// GUARDAR OBSERVACIONES
// =====================
document.getElementById("guardarObs").addEventListener("click", async () => {
  try {
    const obs = document.getElementById("observaciones").value;
    await updateDoc(clienteRef, { observaciones: obs });
    alert("Observaciones guardadas");
  } catch (e) {
    console.error("❌ Error guardando observaciones:", e);
    alert("Error al guardar");
  }
});

// =====================
// CARGAR VISITAS
// =====================
async function cargarVisitas() {
  const ul = document.getElementById("listaVisitasCliente");
  ul.innerHTML = "";

  try {
    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      ul.innerHTML = "<li>No hay visitas registradas</li>";
      return;
    }

    snap.forEach(docu => {
      const v = docu.data();
      const li = document.createElement("li");
      li.textContent = new Date(v.fecha).toLocaleString();
      ul.appendChild(li);
    });

  } catch (e) {
    console.error("❌ Error cargando visitas:", e);
    ul.innerHTML = "<li>Error al cargar visitas</li>";
  }
}

// =====================
cargarCliente();
cargarVisitas();
