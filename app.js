/********************************
 * 1️⃣ MODELO DE DATOS
 ********************************/

const USUARIO_ACTUAL = {
  id: "user_001",
  nombre: "Nicolás"
};


function obtenerClientes() {
  const guardados = JSON.parse(localStorage.getItem("clientes"));

  // Si no hay nada guardado, inicializamos desde data-clientes.js
  if (!guardados || guardados.length === 0) {
    localStorage.setItem("clientes", JSON.stringify(clientes));
    return clientes;
  }

  return guardados;
}

/********************************
 * 2️⃣ STORAGE (localStorage)
 ********************************/

function obtenerVisitas() {
  return JSON.parse(localStorage.getItem("visitas_global")) || [];
}

function guardarVisita(visita) {
  const visitas = obtenerVisitas();
  visitas.push(visita);
  localStorage.setItem("visitas_global", JSON.stringify(visitas));
}


/********************************
 * 3️⃣ MAPA (Leaflet)
 ********************************/

let map;
let markerUsuario = null;

document.addEventListener("DOMContentLoaded", () => {
  map = L.map("map").setView([-32.4075, -63.2403], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  cargarClientesEnMapa();
  iniciarGeolocalizacion();
  mostrarVisitas();

  console.log("✅ App cargada correctamente");
});


/********************************
 * 4️⃣ CLIENTES EN MAPA
 ********************************/

function cargarClientesEnMapa() {
  clientes.forEach(c => {
    L.marker([c.lat, c.lng])
      .addTo(map)
      .bindPopup(`🏭 ${c.nombre}`);
  });

  // Alta manual desde el mapa (opcional)
  map.on("click", (e) => {
    const nombre = prompt("Nombre del cliente:");
    if (!nombre) return;

    const nuevo = {
      id: "fabrica_" + Date.now(),
      nombre,
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      radio: 1000,
      tipo: "cliente"
    };

    clientes.push(nuevo);

    L.marker([nuevo.lat, nuevo.lng])
      .addTo(map)
      .bindPopup(`🏭 ${nuevo.nombre}`);
  });
}


/********************************
 * 5️⃣ GEOLOCALIZACIÓN USUARIO
 ********************************/

function iniciarGeolocalizacion() {
  if (!navigator.geolocation) {
    alert("Geolocalización no soportada");
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      actualizarMarkerUsuario(lat, lng);
      verificarProximidad(lat, lng);
    },
    (err) => console.error("❌ Error geolocalización", err),
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    }
  );
}

function actualizarMarkerUsuario(lat, lng) {
  if (!markerUsuario) {
    markerUsuario = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }).addTo(map).bindPopup("📍 Vos");
  } else {
    markerUsuario.setLatLng([lat, lng]);
  }
}


/********************************
 * 6️⃣ PROXIMIDAD A CLIENTES
 ********************************/

function verificarProximidad(lat, lng) {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  if (!estado || !acciones) return;

  acciones.innerHTML = "";
  let encontrado = false;

  clientes.forEach(c => {
    const d = distanciaMetros(lat, lng, c.lat, c.lng);

    if (d <= c.radio) {
      encontrado = true;
      estado.textContent = `Estás cerca de ${c.nombre}`;

      const btn = document.createElement("button");
      btn.textContent = "Registrar visita";
      btn.onclick = () => registrarVisita(c, lat, lng);

      acciones.appendChild(btn);
    }
  });

  if (!encontrado) {
    estado.textContent = "No hay clientes cercanos";
  }
}


/********************************
 * 7️⃣ REGISTRAR VISITA
 ********************************/

function registrarVisita(cliente, lat, lng) {
  const visita = {
    id: Date.now(),
    clienteId: cliente.id,
    clienteNombre: cliente.nombre,
    usuarioId: USUARIO_ACTUAL.id,
    usuarioNombre: USUARIO_ACTUAL.nombre,
    fecha: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    lat,
    lng
  };

  guardarVisita(visita);
  mostrarVisitas();

  alert(`✅ Visita registrada en ${cliente.nombre}`);
}


/********************************
 * 8️⃣ HISTORIAL VISITAS (INDEX)
 ********************************/

function mostrarVisitas() {
  const lista = document.getElementById("listaVisitas");
  if (!lista) return;

  lista.innerHTML = "";

  obtenerVisitas()
    .slice()
    .reverse()
    .forEach(v => {
      const li = document.createElement("li");
      li.textContent = `${v.fecha} ${v.hora} – ${v.clienteNombre}`;
      lista.appendChild(li);
    });
}


/********************************
 * 9️⃣ UTILIDAD DISTANCIA
 ********************************/

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


