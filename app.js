console.log("✅ app.js cargado");

// ============================
// LISTA DE CLIENTES / DEPÓSITOS
// ============================
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

// ============================
// FUNCIÓN DISTANCIA (Haversine)
// ============================
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

// ============================
// INICIO
// ============================
window.onload = () => {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  if (!navigator.geolocation) {
    estado.textContent = "❌ Geolocalización no soportada";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latUser = pos.coords.latitude;
      const lngUser = pos.coords.longitude;

      console.log("📍 Tu ubicación:", latUser, lngUser);

      let encontrado = false;

      lugares.forEach(lugar => {
        const distancia = distanciaMetros(
          latUser,
          lngUser,
          lugar.lat,
          lugar.lng
        );

        console.log(📏 Distancia a ${lugar.nombre}:, Math.round(distancia), "m");

        if (distancia <= lugar.radio) {
          encontrado = true;

          estado.textContent = 📍 Estás cerca de ${lugar.nombre};

          const btn = document.createElement("button");
          btn.textContent = Registrar visita – ${lugar.nombre};

          btn.onclick = () => {
            alert(✅ Visita registrada en ${lugar.nombre});
          };

          acciones.appendChild(btn);
        }
      });

      if (!encontrado) {
        estado.textContent = "❌ No hay fábricas dentro del radio";
      }
    },
    (error) => {
      console.error("❌ Error ubicación:", error);
      estado.textContent = "❌ No se pudo obtener la ubicación";
    },
    {
      enableHighAccuracy: true
    }
  );
};