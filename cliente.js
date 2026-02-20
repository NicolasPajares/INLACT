import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Obtener ID desde la URL
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  document.getElementById("titulo").textContent = "Cliente no encontrado";
  throw new Error("Falta ID de cliente");
}

// Referencias HTML
const titulo = document.getElementById("titulo");
const listaVisitas = document.getElementById("visitas");

async function cargarCliente() {
  // 1. Obtener cliente
  const refCliente = doc(db, "clientes", clienteId);
  const snapCliente = await getDoc(refCliente);

  if (!snapCliente.exists()) {
    titulo.textContent = "Cliente no existe";
    return;
  }

  const cliente = snapCliente.data();
  titulo.textContent = cliente.nombre || "Cliente";

  // 2. Obtener visitas del cliente
  const q = query(
    collection(db, "visitas"),
    where("clienteId", "==", clienteId)
  );

  const snapVisitas = await getDocs(q);

  if (snapVisitas.empty) {
    listaVisitas.innerHTML = "<li>Sin visitas registradas</li>";
    return;
  }

  snapVisitas.forEach(docu => {
    const v = docu.data();
    const li = document.createElement("li");
    li.textContent = `${v.fecha || ""} – ${v.observacion || ""}`;
    listaVisitas.appendChild(li);
  });
}

cargarCliente().catch(err => {
  console.error(err);
  titulo.textContent = "Error cargando cliente";
});
