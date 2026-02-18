/********************************
 * 1️⃣ OBTENER ID DESDE LA URL
 ********************************/
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("Cliente no especificado");
  throw new Error("Falta clienteId en la URL");
}


/********************************
 * 2️⃣ DATOS (desde data-clientes.js)
 ********************************/
// Se asume que existe el array `clientes`
const cliente = clientes.find(c => c.id === clienteId);

if (!cliente) {
  document.getElementById("fichaCliente").innerHTML =
    "<p>Cliente no encontrado</p>";
  throw new Error("Cliente no encontrado");
}


/********************************
 * 3️⃣ MOSTRAR FICHA CLIENTE
 ********************************/
const ficha = document.getElementById("fichaCliente");

ficha.innerHTML = `
  <h2>${cliente.nombre}</h2>
  <p><strong>Localidad:</strong> ${cliente.localidad}</p>
  <p><strong>Provincia:</strong> ${cliente.provincia}</p>
`;


/********************************
 * 4️⃣ HISTORIAL DE VISITAS (FILTRADO)
 ********************************/
function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

const lista = document.getElementById("listaVisitas");
const visitas = obtenerVisitas().filter(v => v.clienteId === clienteId);

lista.innerHTML = "";

if (visitas.length === 0) {
  lista.innerHTML = "<li>No hay visitas registradas</li>";
} else {
  visitas
    .sort((a, b) => b.id - a.id)
    .forEach(v => {
      const li = document.createElement("li");
      li.textContent = `${v.fecha} ${v.hora} – ${v.usuarioNombre}`;
      lista.appendChild(li);
    });
}
