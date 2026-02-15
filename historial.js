function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

const contenedor = document.getElementById("lista-visitas");
const visitas = obtenerVisitas();

if (visitas.length === 0) {
  contenedor.innerHTML = "<p>No hay visitas registradas.</p>";
} else {
  visitas
    .sort((a, b) => b.id - a.id) // más recientes primero
    .forEach(v => {
      const div = document.createElement("div");
      div.className = "visita";

      div.innerHTML = `
        <strong>${v.clienteNombre}</strong><br>
        ${v.usuarioNombre}<br>
        <span class="fecha">${v.fecha} ${v.hora}</span>
      `;

      contenedor.appendChild(div);
    });
}
