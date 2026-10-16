# Seguridad de imágenes de ensayos INLACT

Esta rama prepara una primera versión de seguridad para imágenes de ensayos.

## Archivos incluidos

- `ensayo.js`: las imágenes originales se leen con la sesión autenticada y se muestran como URL temporales Blob, en vez de insertar una URL de descarga permanente en el HTML. Las publicaciones siguen usando copias separadas en `ensayos_publicos/<token>/...`.
- `storage.rules`: limita el acceso a las rutas de imágenes originales y copias a usuarios autenticados que tengan un perfil en `usuarios`; el resto de rutas queda denegado.
- `cors.json`: permite al sitio de GitHub Pages realizar las solicitudes GET necesarias para leer imágenes desde Firebase Storage. CORS no sustituye las reglas de seguridad.

## Antes de publicar

1. Verificar en Firebase Console que la colección `usuarios` tenga un documento con el UID de cada usuario autorizado.
2. Revisar en Storage si existen otras rutas legítimas usadas por la app. Estas reglas deniegan cualquier ruta distinta de `ensayos/` y `ensayos_publicos/`; no desplegarlas si la app usa otros directorios sin agregarlos explícitamente.
3. Publicar primero las reglas de Storage y comprobar que usuarios autorizados pueden abrir/editar ensayos y cargar imágenes.
4. Aplicar la configuración CORS del bucket `gs://inlact.firebasestorage.app` usando `cors.json`. La actualización CORS reemplaza la configuración CORS existente del bucket, por lo que hay que revisar la configuración actual antes de aplicarla.
5. Probar la publicación y la desactivación de un ensayo de prueba antes de usarlo con clientes.

## Límites importantes

- Las URL de descarga de Firebase funcionan como enlaces portadores. Las URL antiguas de imágenes originales que ya se hayan compartido pueden seguir funcionando hasta que se revoque su token o se elimine/reemplace el objeto.
- La desactivación de un ensayo bloquea la ficha pública en Firestore y elimina las copias publicadas cuando los permisos lo permiten. No puede retirar copias que alguien ya haya descargado.
- No desplegar reglas a ciegas: primero confirmar los demás usos de Storage y la configuración real del proyecto.
