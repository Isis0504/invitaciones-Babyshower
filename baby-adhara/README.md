# Invitación Baby Shower de Adhara Lucía

Invitación interactiva de seis escenas, construida con React, Vite y Framer Motion. Las rutas `/invitacion/ana`, `/invitacion/carlos` y `/invitacion/maria` muestran el mismo cuento con el nombre y la lista de regalos de cada invitado.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Para comprobar la versión de despliegue, ejecuta `npm run build`. En Vercel, selecciona `baby-adhara` como directorio raíz del proyecto; `vercel.json` conserva las rutas personalizadas al abrirlas directamente.

## Personalización

Edita [`src/configuracion.js`](./src/configuracion.js):

- `configuracion.fecha`, `hora` y `lugar`: datos que se muestran en la cuarta escena.
- `configuracion.fechaEvento`: fecha y hora ISO 8601 con zona horaria de Colombia, usadas por la cuenta regresiva.
- `configuracion.telefonoWhatsApp`: número con código de país, solo dígitos y sin `+`. Mientras quede vacío, el enlace permite elegir una conversación en WhatsApp.
- `invitados`: añade o modifica claves, nombres y listas de regalos. Por ejemplo, la clave `ana` corresponde a `/invitacion/ana`.

Si la ruta no coincide con un invitado registrado, se muestra una invitación genérica con una lista de regalos de ejemplo.

## Recursos visuales

Las escenas usan los recursos de `public/illustrations/`. Las imágenes de referencia no se incluyen en `public`, así no se copian al sitio publicado.
