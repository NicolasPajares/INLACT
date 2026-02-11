/*************
 * 1️⃣ LISTA DE CLIENTES / DEPÓSITOS
 *************/
const lugares = [
  {
    nombre: "Depósito Villa María",
    lat: -32.3830,
    lng: -63.2229,
    radio: 500
  },
  {
    nombre: "Depósito Las Varillas",
    lat: -31.8743,
    lng: -62.7257,
    radio: 500
  }
];

// ----------------------------
// FUNCIÓN DISTANCIA (Haversine)
// ----------------------------
function distanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ----------------------------
// BUSCAR FÁBRICAS CERCANAS
// ----------------------------
function buscarFabricas() {
  const contenedor = document.getElementById("visitas");
  contenedor.innerHTML = "Buscando fábricas cercanas...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      console.log("Tu ubicación:", userLat, userLng);

      let encontradas = false;
      contenedor.innerHTML = "";

      lugares.forEach(lugar => {
        const distancia = distanciaMetros(
          userLat,
          userLng,
          lugar.lat,
          lugar.lng
        );

        console.log(lugar.nombre, "→", Math.round(distancia), "m");

        if (distancia <= lugar.radio) {
          encontradas = true;

          const btn = document.createElement("button");
          btn.innerText = Registrar visita: ${lugar.nombre};
          btn.onclick = () => registrarVisita(lugar.nombre);

          contenedor.appendChild(btn);
        }
      });

      if (!encontradas) {
        contenedor.innerHTML = "No hay fábricas dentro del radio.";
      }
    },
    () => {
      contenedor.innerHTML = "No se pudo obtener la ubicación.";
    }
  );
}

// ----------------------------
// REGISTRAR VISITA
// ----------------------------
function registrarVisita(nombre) {
  const fecha = new Date().toLocaleString();
  alert(Visita registrada:\n${nombre}\n${fecha});
}

// Ejecutar al cargar
buscarFabricas();