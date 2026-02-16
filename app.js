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
    tipo: "cliente"
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
 * 2️⃣ INICIALIZAR MAPA
 *************************/

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -32.3833, lng: -63.2243 },
    zoom: 8
  });

  cargarFabricasEnMapa();
}

/*************************
 * CARGAR FABRICA Y AGREGAR PIN
 *************************/

function cargarFabricasEnMapa() {
  fabricas.forEach(f => {
    new google.maps.Marker({
      position: { lat: f.lat, lng: f.lng },
      map,
      title: f.nombre
    });
  });

  // TOCAR MAPA PARA AGREGAR NUEVO CLIENTE
  map.addListener("click", (e) => {
    const nombre = prompt("Nombre del cliente/fábrica:");
    if (!nombre) return;

    const nueva = {
      id: "fabrica_" + Date.now(),
      nombre,
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      radio: 1000
    };

    fabricas.push(nueva);

    new google.maps.Marker({
      position: { lat: nueva.lat, lng: nueva.lng },
      map,
      title: nueva.nombre
    });
  });
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
         // mostrarUltimasVisitas(f.id);
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


/*************************
 * GEOLOCALIZACIÓN EN TIEMPO REAL DEL USUARIO
 *************************/

let posicionActual = null;

function iniciarGeolocalizacion() {
  if (!navigator.geolocation) {
    alert("Geolocalización no soportada");
    return;
  }

  navigator.geolocation.watchPosition(
  (pos) => {
    posicionActual = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    actualizarMarkerUsuario(
      pos.coords.latitude,
      pos.coords.longitude
    );

    verificarProximidad();
  },
  (err) => {
    console.error("Error geolocalización", err);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 5000
  }
);


/*************************
 * MOSTRAR UBICACION DEL USUARIO EN MAPA
 *************************/

let markerUsuario = null;

function actualizarMarkerUsuario(lat, lng) {
  if (!markerUsuario) {
    markerUsuario = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }).addTo(map)
      .bindPopup("📍 Vos");

  } else {
    markerUsuario.setLatLng([lat, lng]);
  }
}

