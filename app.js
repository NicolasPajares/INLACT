/************
 * LISTA DE CLIENTES / DEPÓSITOS
 ************/

const lugares = [
  {
    nombre: "Depósito Villa María",
    lat: -32.3830,
    lng: -63.2229,
    radio: 1000 // metros
  },
  {
    nombre: "Depósito Las Varillas",
    lat: -31.8743,
    lng: -62.7257,
    radio: 1000
  }
];

/************
 * FUNCIÓN DISTANCIA (HAVERSINE)
 ************/
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

/************
 * OBTENER UBICACIÓN Y BUSCAR
 ************/

const estado = document.getElementById("estado");
const acciones = document.getElementById("acciones");

estado.innerText = "Buscando fábricas cercanas...";

if (!navigator.geolocation) {
  estado.innerText = "Tu navegador no soporta geolocalización";
} else {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latUser = pos.coords.latitude;
      const lngUser = pos.coords.longitude;

      console.log("📍 Tu ubicación:", latUser, lngUser);

      let encontrados = [];

      lugares.forEach(lugar => {
        const distancia = distanciaMetros(
          latUser,
          lngUser,
          lugar.lat,
          lugar.lng
        );

        console.log(➡ ${lugar.nombre}: ${Math.round(distancia)} m);

        if (distancia <= lugar.radio) {
          encontrados.push(lugar);
        }
      });

      if (encontrados.length > 0) {
        estado.innerText = "Estás cerca de:";
        acciones.innerHTML = "";

        encontrados.forEach(lugar => {
          const btn = document.createElement("button");
          btn.innerText = Registrar visita: ${lugar.nombre};

          btn.onclick = () => {
            registrarVisita(lugar.nombre);
          };

          acciones.appendChild(btn);
        });
      } else {
        estado.innerText = "No hay fábricas en el radio configurado";
      }
    },
    (error) => {
      estado.innerText = "No se pudo obtener la ubicación";
      console.error(error);
    },
    {
      enableHighAccuracy: true
    }
  );
}

/************
 * REGISTRAR VISITA
 ************/
function registrarVisita(nombre) {
  const visitas = JSON.parse(localStorage.getItem("visitas")) || [];

  visitas.push({
    lugar: nombre,
    fecha: new Date().toLocaleString(),
  });

  localStorage.setItem("visitas", JSON.stringify(visitas));

  alert(✅ Visita registrada en ${nombre});
}