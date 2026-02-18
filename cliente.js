document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.body.innerHTML = "❌ ID de cliente no recibido";
    return;
  }

  if (typeof clientes === "undefined") {
    document.body.innerHTML = "❌ Clientes no cargados";
    return;
  }

  const cliente = clientes.find(c => c.id === id);

  if (!cliente) {
    document.body.innerHTML = "❌ Cliente no encontrado";
    return;
  }

  document.getElementById("nombreCliente").textContent = cliente.nombre;
  document.getElementById("ubicacion").textContent =
    `${cliente.localidad}, ${cliente.provincia}`;

  cargarVisitas(cliente.id);
});

function cargarVisitas(clienteId) {
  const lista = document.getElementById("listaVisitas");
  const visitas = JSON.parse(localStorage.getItem("visitas_global")) || [];

  const filtradas = visitas.filter(v => v.clienteId === clienteId);

  if (filtradas.length === 0) {
    lista.innerHTML = "<li>No hay visitas registradas</li>";
    return;
  }

  filtradas.reverse().forEach(v => {
    const li = document.createElement("li");
    li.textContent = `${v.fecha} ${v.hora} – ${v.usuarioNombre}`;
    lista.appendChild(li);
  });
}
