/* ============================================================
   COTIZACIÓN INLACT
============================================================ */


/* ============================================================
   FIREBASE
============================================================ */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* ============================================================
   CONFIGURACIÓN FIREBASE
============================================================ */

const firebaseConfig = {

  apiKey:
    "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",

  authDomain:
    "inlact.firebaseapp.com",

  projectId:
    "inlact",

  storageBucket:
    "inlact.firebasestorage.app",

  messagingSenderId:
    "143868382036",

  appId:
    "1:143868382036:web:b5af0e4faced7e880216c1"

};


const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

const auth =
  getAuth(app);


/* ============================================================
   ELEMENTOS
============================================================ */

const empresaEl =
  document.getElementById("empresa");

const fechaEl =
  document.getElementById("fecha");

const nombreCotizacionEl =
  document.getElementById("nombre-cotizacion");

const clienteEl =
  document.getElementById("cliente");

const propuestaEl =
  document.getElementById("contenido-propuesta");

const dosisEl =
  document.getElementById("contenido-dosis");

const listaProductosEl =
  document.getElementById("lista-productos-cotizacion");

const observacionesEl =
  document.getElementById("contenido-observaciones");

const linkPublicoEl =
  document.getElementById("link-publico-cotizacion");


/* ============================================================
   URL
============================================================ */

const parametros =
  new URLSearchParams(
    window.location.search
  );

const cotizacionId =
  parametros.get("id");

const esPublico =
  parametros.get("publico") === "1";


/* ============================================================
   FORMATEAR FECHA
============================================================ */

function formatearFecha(fecha) {

  if (!fecha) {
    return "";
  }

  let fechaReal = null;


  /* Firebase Timestamp */

  if (
    typeof fecha.toDate === "function"
  ) {

    fechaReal =
      fecha.toDate();

  }


  /* Date */

  else if (
    fecha instanceof Date
  ) {

    fechaReal =
      fecha;

  }


  /* String */

  else if (
    typeof fecha === "string"
  ) {

    fechaReal =
      new Date(fecha);

  }


  if (
    !fechaReal ||
    Number.isNaN(
      fechaReal.getTime()
    )
  ) {

    return "";

  }


  return fechaReal.toLocaleDateString(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


/* ============================================================
   FORMATEAR PRECIO
============================================================ */

function formatearPrecio(
  precio,
  moneda
) {

  const valor =
    Number(precio || 0);


  let simbolo =
    "$ ";


  if (moneda === "USD") {
    simbolo = "USD ";
  }

  else if (moneda === "EUR") {
    simbolo = "EUR ";
  }


  return (
    simbolo +
    valor.toLocaleString(
      "es-AR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );

}


/* ============================================================
   ESCAPAR HTML
============================================================ */

function escaparHTML(texto) {

  return String(
    texto || ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ============================================================
   MOSTRAR TEXTO
============================================================ */

function mostrarTexto(
  elemento,
  texto
) {

  if (!elemento) {
    return;
  }

  elemento.textContent =
    texto || "";

}


/* ============================================================
   CARGAR COTIZACIÓN
============================================================ */

async function cargarCotizacion() {

  try {

    if (!cotizacionId) {

      mostrarError(
        "No se encontró el identificador de la cotización."
      );

      return;

    }


    /* --------------------------------------------------------
       BUSCAR DOCUMENTO
    -------------------------------------------------------- */

    const referencia =
      doc(
        db,
        "cotizaciones",
        cotizacionId
      );


    const snap =
      await getDoc(
        referencia
      );


    /* --------------------------------------------------------
       VERIFICAR EXISTENCIA
    -------------------------------------------------------- */

    if (!snap.exists()) {

      mostrarError(
        "La cotización no existe o fue eliminada."
      );

      return;

    }


    /* --------------------------------------------------------
       DATOS
    -------------------------------------------------------- */

    const cotizacion =
      snap.data();


    console.log(
      "Cotización cargada:",
      cotizacion
    );


    /* --------------------------------------------------------
       PORTADA
    -------------------------------------------------------- */

    cargarPortada(
      cotizacion
    );


    /* --------------------------------------------------------
       PROPUESTA
    -------------------------------------------------------- */

    cargarPropuesta(
      cotizacion
    );


    /* --------------------------------------------------------
       DOSIS
    -------------------------------------------------------- */

    cargarDosis(
      cotizacion
    );


    /* --------------------------------------------------------
       PRODUCTOS
    -------------------------------------------------------- */

    cargarProductos(
      cotizacion
    );


    /* --------------------------------------------------------
       OBSERVACIONES
    -------------------------------------------------------- */

    cargarObservaciones(
      cotizacion
    );


    /* --------------------------------------------------------
       LINK PÚBLICO
    -------------------------------------------------------- */

    cargarLinkPublico(
      cotizacionId
    );

  }

  catch (error) {

    console.error(
      "Error cargando cotización:",
      error
    );


    mostrarError(
      "No se pudo cargar la cotización."
    );

  }

}


/* ============================================================
   CARGAR PORTADA
============================================================ */

function cargarPortada(
  cotizacion
) {

  /* ----------------------------------------------------------
     EMPRESA
  ---------------------------------------------------------- */

  if (empresaEl) {

    empresaEl.textContent =
      cotizacion.clienteNombre ||
      "Cliente sin nombre";

  }


  /* ----------------------------------------------------------
     CLIENTE
     Se mantiene por compatibilidad si existe en el HTML.
  ---------------------------------------------------------- */

  if (clienteEl) {

    clienteEl.textContent =
      cotizacion.clienteNombre ||
      "Cliente sin nombre";

  }


  /* ----------------------------------------------------------
     FECHA
  ---------------------------------------------------------- */

  if (fechaEl) {

    fechaEl.textContent =
      formatearFecha(
        cotizacion.fecha
      );

  }


  /* ----------------------------------------------------------
     NOMBRE DE LA COTIZACIÓN
  ---------------------------------------------------------- */

  if (nombreCotizacionEl) {

    nombreCotizacionEl.textContent =
      cotizacion.nombreCotizacion ||
      "Cotización";

  }

}


/* ============================================================
   PROPUESTA
============================================================ */

function cargarPropuesta(
  cotizacion
) {

  mostrarTexto(
    propuestaEl,
    cotizacion.propuesta
  );

}


/* ============================================================
   DOSIS
============================================================ */

function cargarDosis(
  cotizacion
) {

  mostrarTexto(
    dosisEl,
    cotizacion.dosis
  );

}


/* ============================================================
   OBSERVACIONES
============================================================ */

function cargarObservaciones(
  cotizacion
) {

  mostrarTexto(
    observacionesEl,
    cotizacion.observaciones
  );

}


/* ============================================================
   PRODUCTOS
============================================================ */

function cargarProductos(
  cotizacion
) {

  if (!listaProductosEl) {
    return;
  }


  listaProductosEl.innerHTML =
    "";


  const productos =
    Array.isArray(
      cotizacion.productos
    )
      ? cotizacion.productos
      : [];


  /* ----------------------------------------------------------
     SIN PRODUCTOS
  ---------------------------------------------------------- */

  if (
    productos.length === 0
  ) {

    return;

  }


  /* ----------------------------------------------------------
     CABECERA
  ---------------------------------------------------------- */

  const cabecera =
    document.createElement(
      "div"
    );


  cabecera.className =
    "cabecera-productos-cotizacion";


  cabecera.innerHTML = `

    <span>
      Producto
    </span>

    <span>
      Unidad
    </span>

    <span>
      Moneda
    </span>

    <span>
      Precio
    </span>

  `;


  listaProductosEl.appendChild(
    cabecera
  );


  /* ----------------------------------------------------------
     PRODUCTOS
  ---------------------------------------------------------- */

  productos.forEach(
    producto => {

      const tarjeta =
        document.createElement(
          "div"
        );


      tarjeta.className =
        "producto-cotizacion";


      const nombre =
        producto.nombre ||
        producto.descripcion ||
        "Producto sin nombre";


      const unidad =
        producto.unidad ||
        "-";


      const moneda =
        producto.moneda ||
        "ARS";


      const precio =
        Number(
          producto.precioUnitario ||
          0
        );


      tarjeta.innerHTML = `

        <div class="producto-nombre">
          ${escaparHTML(nombre)}
        </div>

        <div class="producto-unidad">
          ${escaparHTML(unidad)}
        </div>

        <div class="producto-moneda">
          ${escaparHTML(moneda)}
        </div>

        <div class="producto-precio">
          ${formatearPrecio(
            precio,
            moneda
          )}
        </div>

      `;


      listaProductosEl.appendChild(
        tarjeta
      );

    }
  );

}


/* ============================================================
   LINK PÚBLICO PARA EL CLIENTE
============================================================ */

function cargarLinkPublico(
  idCotizacion
) {

  const contenedor =
    document.querySelector(
      ".link-publico-cotizacion"
    );


  const input =
    document.getElementById(
      "link-publico-cotizacion"
    );


  /*
   * Si el cliente está viendo la versión pública,
   * no mostramos el bloque para compartir.
   */

  if (esPublico) {

    if (contenedor) {

      contenedor.style.display =
        "none";

    }

    return;

  }


  /*
   * Verificar que exista el campo.
   */

  if (!input) {

    console.warn(
      "No se encontró el elemento #link-publico-cotizacion"
    );

    return;

  }


  /*
   * Crear URL pública.
   */

  const urlPublica =
    new URL(
      window.location.href
    );


  /*
   * Aseguramos que apunte a cotizacion.html.
   */

  urlPublica.pathname =
    "/INLACT/cotizacion.html";


  /*
   * Eliminamos parámetros anteriores.
   */

  urlPublica.search =
    "";


  /*
   * Agregamos ID de la cotización.
   */

  urlPublica.searchParams.set(
    "id",
    idCotizacion
  );


  /*
   * Indicamos que es versión pública.
   */

  urlPublica.searchParams.set(
    "publico",
    "1"
  );


  /*
   * Mostrar link.
   */

  input.value =
    urlPublica.toString();


  /*
   * Asegurar que sea visible.
   */

  if (contenedor) {

    contenedor.style.display =
      "block";

  }


  console.log(
    "Link público:",
    input.value
  );

}


/* ============================================================
   MOSTRAR ERROR
============================================================ */

function mostrarError(
  mensaje
) {

  const contenido =
    document.querySelector(
      ".contenido-blanco-cotizacion"
    );


  if (!contenido) {
    return;
  }


  contenido.innerHTML = `

    <div
      style="
        padding:40px;
        text-align:center;
        color:#b91c1c;
      "
    >

      <h2>
        No se pudo cargar la cotización
      </h2>

      <p>
        ${escaparHTML(mensaje)}
      </p>

    </div>

  `;

}


/* ============================================================
   MENÚ LATERAL
============================================================ */

function configurarMenu() {

  const botones =
    document.querySelectorAll(
      ".menu-cotizacion button"
    );


  botones.forEach(
    boton => {

      boton.addEventListener(
        "click",
        () => {

          const id =
            boton.dataset.seccion;


          const seccion =
            document.getElementById(
              id
            );


          if (!seccion) {
            return;
          }


          seccion.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });


          /*
           * Marcar botón activo.
           */

          botones.forEach(
            b => {

              b.classList.remove(
                "activo"
              );

            }
          );


          boton.classList.add(
            "activo"
          );

        }
      );

    }
  );

}


/* ============================================================
   INICIO
============================================================ */

async function iniciar() {

  configurarMenu();

  await cargarCotizacion();

}


/* ============================================================
   AUTENTICACIÓN
============================================================ */

signInAnonymously(auth)

  .then(
    () => {

      iniciar();

    }
  )

  .catch(
    error => {

      console.warn(
        "No se pudo iniciar sesión anónima:",
        error
      );


      /*
       * Intentamos cargar igualmente.
       */

      iniciar();

    }
  );
