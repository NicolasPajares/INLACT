console.log("cliente.js cargado");

/********************************
 * 1️⃣ OBTENER CLIENTE POR URL
 ********************************/

const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("Cliente inválido");
  window.location.href = "clientes.html";
}


/********************************
 * 2️⃣ DATOS DE CLIENTES
 * (debe coincidir con app.js)
 ********************************/

const clientes = [
  {
    id: "fabrica_001",
    nombre: "Depósito Villa María",
    zona: "",
    localidad: "Villa María",
    provincia: "Córdoba",
    contactos: []
  }
];


/********************************
 * 3️⃣ BUSCAR CLIENTE
 ********************************/

const cliente = clientes.find(c => c.id === clienteId);

if (!cliente) {
  alert("Cliente no encontrado");
  window.location.href = "clientes.html";
}


/********************************
 * 4️⃣ FICHA DEL CLIENTE
 ********************************/

const ficha = document.getElementById("fichaCliente");

if (ficha) {
  ficha.innerHTML = `
    <h3>${cliente.nombre}</h3>
    <p><strong>Localidad:</strong> ${cliente.localidad}</p>
    <p><strong>Provincia:</strong> ${cliente.provincia}</p>
  `;
}


/********************************
 * 5️⃣ VISITAS (DESDE localStorage)
 ********************************/

function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

const visitasCliente = obtenerVisitas().filter(
  v => v.clienteId === cliente.id
);


/********************************
 * 6️⃣ MOSTRAR HISTORIAL DEL CLIENTE
 ********************************/

const visitasEl = document.getElementById("listaVisitas");

if (!visitasEl) {
  console.warn("No existe #listaVisitas en el HTML");
} else if (visitasCliente.length === 0) {
  visitasEl.innerHTML = "<li>No hay visitas registradas para este cliente.</li>";
} else {
  visitasCliente
    .slice()
    .reverse()
    .forEach(v => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${v.fecha} ${v.hora}</strong><br>
        Visitado por ${v.usuarioNombre}
      `;
      visitasEl.appendChild(li);
    });
}
