/********************************
 * 1️⃣ OBTENER ID DEL CLIENTE
 ********************************/

const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("❌ No se recibió ID de cliente");
}


/********************************
 * 2️⃣ CLIENTES (MISMO MODELO QUE app.js)
 ********************************/

const clientes = [
  {
    id: "fabrica_001",
    nombre: "Depósito Villa María",
    localidad: "Villa María",
    provincia: "Córdoba"
  }
];


/********************************
 * 3️⃣ BUSCAR CLIENTE
 ********************************/

const cliente = clientes.find(c => c.id === clienteId);

if (!cliente) {
  document.getElementById("cliente-nombre").textContent = "Cliente no encontrado";
  console.error("❌ Cliente no encontrado:", clienteId);
} else {
  document.getElementById("cliente-nombre").textContent = cliente.nombre;
  document.getElementById("cliente-localidad").textContent = cliente.localidad;
  document.getElementById("cliente-provincia").textContent = cliente.provincia;
}


/********************************
 * 4️⃣ OBTENER VISITAS
 ********************************/

function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}


/********************************
 * 5️⃣ FILTRAR VISITAS DEL CLIENTE
 ********************************/

function mostrarVisitasCliente() {
  const lista = document.getElementById("lista-visitas");
  if (!lista) return;

  lista.innerHTML = "";

  const visitasCliente = obtenerVisitas().filter(
    v => v.clienteId === clienteId
  );

  if (visitasCliente.length === 0) {
    lista.innerHTML = "<li>No hay visitas registradas</li>";
    return;
  }

  visitasCliente
    .slice()
    .reverse()
    .forEach(v => {
      const li = document.createElement("li");
      li.textContent = `${v.fecha} ${v.hora} – ${v.usuarioNombre}`;
      lista.appendChild(li);
    });
}


/********************************
 * 6️⃣ INIT
 ********************************/

document.addEventListener("DOMContentLoaded", () => {
  mostrarVisitasCliente();
});
