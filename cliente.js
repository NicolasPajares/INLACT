import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   CONFIGURACIÓN FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   OBTENER ID DE LA URL
========================= */

const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("Cliente no especificado");
}

/* =========================
   CARGAR CLIENTE
========================= */

async function cargarCliente(id) {
  try {
    const ref = doc(db, "clientes", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Cliente no encontrado");
      return;
    }

    const c = snap.data();

    document.getElementById("nombre").textContent = c.nombre || "";
    document.getElementById("direccion").textContent = c.direccion || "";
    document.getElementById("telefono").textContent = c.telefono || "";
    document.getElementById("observaciones").textContent = c.observaciones || "";

  } catch (error) {
    console.error("Error cargando cliente:", error);
  }
}

/* =========================
   CARGAR VISITAS (NUEVO)
========================= */

async function cargarVisitas(id) {
  const lista = document.getElementById("listaVisitas");

  try {
    const visitasRef = collection(db, "clientes", id, "visitas");
    const q = query(visitasRef, orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);

    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML = "<li>Sin visitas registradas</li>";
      return;
    }

    snapshot.forEach(doc => {
      const v = doc.data();

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${v.tipo || "Visita"}</strong><br>
        Fecha: ${v.fecha || ""}<br>
        ${v.observaciones || ""}
      `;

      lista.appendChild(li);
    });

  } catch (error) {
    console.error("Error cargando visitas:", error);
    lista.innerHTML = "<li>Error al cargar visitas</li>";
  }
}

/* =========================
   INICIO
========================= */

cargarCliente(clienteId);
cargarVisitas(clienteId);
