/*************
 * 1️⃣ LISTA DE CLIENTES / DEPÓSITOS
 *************/

const lugares = [
  {
    nombre: "Depósito Villa María",
    lat: -32.3830,      // <-- poné tu lat real
    lng: -63.2229,      // <-- poné tu lng real
    radio: 500         // metros (para prueba)
  },
  {
    nombre: "Deposito Las Varillas",
    lat: -31.8743,
    lng: -62.7257,
    radio: 500
  }
];


/*************
 * 2️⃣ FUNCIÓN PARA CALCULAR DISTANCIA
 *************/

function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000; // radio de la Tierra en metros
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


/*************
 * 3️⃣ FUNCIÓN PRINCIPAL
 *    Busca si estás cerca de un lugar
 *************/

function buscarLugaresCercanos() {
  const contenedor = document.getElementById("zona-visitas");

  contenedor.innerHTML = "<p>📍 Buscando lugares cercanos...</p>";

  if (!navigator.geolocation) {
    contenedor.innerHTML = "<p>❌ El GPS no está disponible.</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latActual = pos.coords.latitude;
      const lngActual = pos.coords.longitude;

      contenedor.innerHTML = "";
      let hayCercanos = false;

      lugares.forEach(lugar => {
        const distancia = distanciaMetros(
          latActual,
          lngActual,
          lugar.lat,
          lugar.lng
        );

        if (distancia <= lugar.radio) {
          hayCercanos = true;

          const info = document.createElement("p");
          info.textContent =
            Estás a ${Math.round(distancia)} m de ${lugar.nombre};

          const boton = document.createElement("button");
          boton.textContent = "Registrar visita – " + lugar.nombre;

          boton.onclick = () => registrarVisita(lugar.nombre, distancia);

          contenedor.appendChild(info);
          contenedor.appendChild(boton);
          contenedor.appendChild(document.createElement("hr"));
        }
      });

      if (!hayCercanos) {
        contenedor.innerHTML =
          "<p>ℹ️ No hay clientes dentro del radio.</p>";
      }
    },
    () => {
      contenedor.innerHTML =
        "<p>❌ No se pudo obtener tu ubicación.</p>";
    }
  );
}


/*************
 * 4️⃣ REGISTRAR VISITA (por ahora simple)
 *************/

function registrarVisita(nombre, distancia) {
  const fecha = new Date().toLocaleString();

  alert(
    "✅ Visita registrada\n\n" +
    "Cliente: " + nombre + "\n" +
    "Distancia: " + Math.round(distancia) + " m\n" +
    "Fecha: " + fecha
  );
}


/*************
 * 5️⃣ EJECUTAR AL ABRIR LA PÁGINA
 *************/

buscarLugaresCercanos();