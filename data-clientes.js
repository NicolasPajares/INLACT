/********************************
 * DATOS INICIALES (SOLO PRIMER USO)
 ********************************/

const clientes = [
  {
    id: "clientes_001",
    nombre: "Depósito Villa María",
    localidad: "Villa María",
    provincia: "Córdoba",
    lat: -32.3833,
    lng: -63.2243,
    radio: 10000,
    tipo: "cliente"
  }
];

/********************************
 * FUNCIÓN ÚNICA PARA OBTENER CLIENTES
 ********************************/

function obtenerClientes() {
  let clientesLS = JSON.parse(localStorage.getItem("clientes"));

  if (!clientesLS || clientesLS.length === 0) {
    localStorage.setItem("clientes", JSON.stringify(clientes));
    clientesLS = clientes;
  }

  return clientesLS;
}
