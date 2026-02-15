/*************************
 * 1️⃣ DATOS (MODELO)
 *************************/

// Usuario simulado (más adelante será login real)
const USUARIO_ACTUAL = {
  id: "user_001",
  nombre: "Nicolás"
};

// Fábricas / clientes
const fabricas = [
  {
    id: "fabrica_001",
    nombre: "Depósito Casa",
    lat: -32.3833,
    lng: -63.2243,
    radio: 10000
  }
];


/*************************
 * 2️⃣ STORAGE (localStorage)
 *************************/

function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

function guardarVisita(visita) {
  const visitas = obtenerVisitas();
  visitas.push(visita);
  localStorage.setItem("visitas_global", JSON.stringify(visitas));
}


/*************************
 * 3️⃣ UTILIDADES
 *************************/

function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ================================
// HISTORIAL DE VISITAS (MOSTRAR)
// ================================
function mostrarVisitas() {
  const lista = document.getElementById("listaVisitas");
  if (!lista) return;

  lista.innerHTML = "";

  const visitas = JSON.parse(localStorage.getItem("visitas_global")) || [];

  visitas.slice().reverse().forEach(v => {
    const li = document.createElement("li");
    li.textContent = `${v.fecha} ${v.hora} – ${v.cliente}`;
    lista.appendChild(li);
  });
}

/*************************
 * 4️⃣ VISUALIZACIÓN
 *************************/

function mostrarUltimasVisitas(clienteId) {
  const lista = document.getElementById("listaVisitas");
  if (!lista) return;

  lista.innerHTML = "";

  const visitas = obtenerVisitas()
    .filter(v => v.clienteId === clienteId)
    .slice(-5)
    .reverse();

  visitas.forEach(v => {
    const li = document.createElement("li");
    li.textContent = `${v.fecha} ${v.hora} – ${v.usuarioNombre}`;
    lista.appendChild(li);
  });
}


/*************************
 * 5️⃣ GEOLOCALIZACIÓN
 *************************/

function verificarUbicacion() {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");
  acciones.innerHTML = "";

  if (!navigator.geolocation) {
    estado.textContent = "Geolocalización no disponible";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      console.log("MI UBICACIÓN:", lat, lng);

      let encontrada = false;

      fabricas.forEach((f) => {
        const d = distanciaMetros(lat, lng, f.lat, f.lng);

        if (d <= f.radio) {
          encontrada = true;
          estado.textContent = `Estás cerca de ${f.nombre}`;

          const btn = document.createElement("button");
          btn.textContent = `Registrar visita`;

          btn.onclick = () => {
            const visita = {
              id: Date.now(),
              clienteId: f.id,
              clienteNombre: f.nombre,

              usuarioId: USUARIO_ACTUAL.id,
              usuarioNombre: USUARIO_ACTUAL.nombre,

              fecha: new Date().toLocaleDateString(),
              hora: new Date().toLocaleTimeString(),
              lat,
              lng
            };

            guardarVisita(visita);
            mostrarUltimasVisitas(f.id);

            alert(`Visita registrada en ${f.nombre}`);
          };

          acciones.appendChild(btn);
          mostrarUltimasVisitas(f.id);
        }
      });

      if (!encontrada) {
        estado.textContent = "No hay fábricas cercanas";
      }
    },
    () => {
      estado.textContent = "No se pudo obtener ubicación";
    }
  );
}


/*************************
 * 6️⃣ INICIO
 *************************/

verificarUbicacion();


