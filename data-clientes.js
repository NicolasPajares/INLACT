/********************************
 * MODELO DE DATOS GLOBAL
 ********************************/

const USUARIO_ACTUAL = {
  id: "user_001",
  nombre: "Nicolás"
};

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
 * STORAGE
 ********************************/

function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

function guardarVisita(visita) {
  const visitas = obtenerVisitas();
  visitas.push(visita);
  localStorage.setItem("visitas_global", JSON.stringify(visitas));
}

// Inicializar clientes en localStorage solo si no existen
if (!localStorage.getItem("clientes")) {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}
