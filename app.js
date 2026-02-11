const fabricas = [
{
    nombre: "Depósito Villa María",
    lat: -32.3830,
    lng: -63.229,
    radio: 300
},
{
    nombre: "Depósito Las Varillas",
    lat: -31.8743,
    lng: -62.7258,
    radio: 300 
}
];

const estado = document.getElementById("estado");
const acciones = document.getElementById("acciones");

function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function verificarUbicacion() {
  if (!navigator.geolocation) {
    estado.textContent = "Geolocalización no disponible";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      console.log("MI UBICACIÓN REAL:", lat, lng);

      acciones.innerHTML = "";
      let encontrada = false;

      fabricas.forEach((f) => {
        const d = distanciaMetros(lat, lng, f.lat, f.lng);
        console.log("Distancia a", f.nombre, ":", d);

        if (d <= f.radio) {
          encontrada = true;
          estado.textContent = "Estás cerca de una fábrica";

          const btn = document.createElement("button");
          btn.textContent = `Registrar visita: ${f.nombre}`;
          btn.onclick = () =>
            alert(`Visita registrada en ${f.nombre}`);

          acciones.appendChild(btn);
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

verificarUbicacion();
