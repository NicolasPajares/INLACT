import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function cargarVisitas() {
  const contenedor = document.getElementById("listaHistorial");
  contenedor.innerHTML = "";

  try {
    const visitasRef = collection(db, "visitas");

    const q = query(
      visitasRef,
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      contenedor.textContent = "Sin visitas registradas";
      return;
    }

    snap.forEach(d => {
      const v = d.data();
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div><strong>${v.actividad || v.accion || "Visita"}</strong></div>
        <div>${v.observacion || ""}</div>
        <div class="fecha">
          ${v.fecha?.toDate?.().toLocaleString() || ""}
        </div>
      `;
      contenedor.appendChild(div);
    });

  } catch (e) {
    console.error("Error cargando visitas:", e);
    contenedor.textContent = "Error cargando visitas";
  }
}
