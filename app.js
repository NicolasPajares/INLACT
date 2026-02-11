const fabricas = [
  {
    nombre: "Depósito Casa",
    lat: -31.4201,
    lng: -64.1888,
    radio: 5000000
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

        console.log(`Distancia a ${f.nombre}:`, d);

        if (d <= f
