console.log("app.js cargado");

// ============================
// LUGARES
// ============================
const lugares = [
  {
    nombre: "Deposito Villa Maria",
    lat: -32.3830,
    lng: -63.2229,
    radio: 500
  },
  {
    nombre: "Deposito Las Varillas",
    lat: -31.8743,
    lng: -62.7257,
    radio: 500
  }
];

// ============================
// DISTANCIA (Haversine)
// ============================
function distanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================
// INICIO
// ============================
window.onload = function () {
  const estado = document.getElementById("estado");
  const acciones = document.getElementById("acciones");

  if (!navigator.geolocation) {
    estado.textContent = "Geolocalizacion no soportada";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      const latUser = pos.coords.latitude;
      const lngUser = pos.coords.longitude;

      console.log("Ubicacion:", latUser, lngUser);

      let encontrado = false;

      lugares.forEach(function (lugar) {
        const distancia = distanciaMetros(
          latUser,
          lngUser,
          lugar.lat,
          lugar.lng
        );

        console.log("Distancia a", lugar.nombre, Math.round(distancia), "m");

        if (distancia <= lugar.radio) {
          encontrado = true;
          estado.textContent = "Estas cerca de " + lugar.nombre;

          const btn = document.createElement("button");
          btn.textContent = "Registrar visita - " + lugar.nombre;

          btn.onclick = function () {
            alert("Visita registrada en " + lugar.nombre);
          };

          acciones.appendChild(btn);
        }
      });

      if (!encontrado) {
        estado.textContent = "No hay fabricas dentro del radio";
      }
    },
    function () {
      estado.textContent = "No se pudo obtener la ubicacion";
    },
    { enableHighAccuracy: true }
  );
};
