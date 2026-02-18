document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const cliente = clientes.find(c => c.id === id);

  const nombreEl = document.getElementById("nombreCliente");
  const datosEl = document.getElementById("datosCliente");
  const historialEl = document.getElementById("historialVisitas");

  if (!cliente) {
    nombreEl.textContent = "Cliente no encontrado";
    return;
  }

  nombreEl.textContent = cliente.nombre;
  datosEl.textContent = `${cliente.localidad}, ${cliente.provincia}`;

  const visitas = obtenerVisitas()
    .filter(v => v.clienteId === cliente.id)
    .reverse();

  if (visitas.length === 0) {
    historialEl.innerHTML = "<li>Sin visitas registradas</li>";
    return;
  }

  visitas.forEach(v => {
    const li = document.createElement("li");
    li.textContent = `${v.fecha} ${v.hora} – ${v.usuarioNombre}`;
    historialEl.appendChild(li);
  });
});
