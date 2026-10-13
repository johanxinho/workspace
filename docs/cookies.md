# Taller: Cookies en aplicaciones web (React + Supabase)

Este documento acompaña el proyecto React + Supabase ubicado en [`2026-08-18/login-supabase`](../2026-08-18/login-supabase/). Los datos de DevTools varían según navegador, dominio, sesión y configuración; por eso no se inventan capturas ni valores de sesión. En las secciones A y C se indica dónde guardar la evidencia real tomada en el navegador.

## Parte 1 — Investigación teórica

### 1. Qué es una cookie

Una cookie es un pequeño dato que un sitio guarda en el navegador bajo un nombre y un valor. El servidor puede pedir que se guarde y, cuando corresponda, el navegador la adjunta a peticiones posteriores. Así el sitio puede reconocer una sesión o recordar una preferencia aunque HTTP no mantenga memoria entre peticiones.

| | Cookie | localStorage | sessionStorage |
|---|---|---|---|
| ¿Se envía automáticamente al servidor? | Sí, en peticiones que coinciden con su dominio, ruta y reglas de seguridad. | No; el código tendría que incluir el valor en una petición. | No; el código tendría que incluir el valor en una petición. |
| ¿Sobrevive a cerrar el navegador? | Si tiene vencimiento explícito, normalmente sí; una cookie de sesión suele terminar al cerrar la sesión del navegador, aunque la restauración de sesión puede conservarla. | Sí, hasta que se borre o el sitio la elimine. | Normalmente no; está asociada a la pestaña o contexto de navegación y se elimina al cerrarlo. |
| ¿Tiene expiración configurable? | Sí, con `Max-Age` o `Expires`; sin ellos es de sesión. | No tiene vencimiento por atributo; se borra explícitamente. | No tiene vencimiento por atributo; su vida depende de la sesión de la pestaña. |
| ¿Tamaño máximo aproximado? | Alrededor de 4 KB por cookie (incluidos nombre y atributos relevantes); hay también límites por dominio. | Aproximadamente 5–10 MB por origen, según el navegador. | Aproximadamente 5–10 MB por origen, según el navegador. |
| ¿Accesible desde JavaScript? | Sí, salvo si está marcada `HttpOnly`. | Sí, desde scripts del mismo origen. | Sí, desde scripts del mismo origen. |

HTTP es *stateless*: cada petición se procesa sin que el protocolo recuerde por sí solo quién hizo la anterior. Una cookie permite adjuntar un identificador o una preferencia a peticiones sucesivas, para que una aplicación pueda mantener una sesión; los datos sensibles de la sesión deberían permanecer del lado servidor cuando se usa un ID de sesión.

### 2. Cómo se crea una cookie

- El servidor solicita guardarla con `Set-Cookie: nombre=valor; ...`. El navegador reenvía las cookies aplicables en `Cookie: nombre=valor; otra=valor`.
- En el navegador se puede escribir, por ejemplo, `document.cookie = "tema=oscuro; Path=/; Max-Age=3600; SameSite=Lax"`. Cada asignación añade o reemplaza una cookie concreta; leer `document.cookie` devuelve una cadena con las cookies visibles para JavaScript, no sus atributos.
- `document.cookie` es incómodo porque la lectura es una cadena que hay que analizar, cada escritura modifica una cookie a la vez y borrar requiere coincidir con su ámbito (como `Path` y `Domain`). JavaScript tampoco puede fijar `HttpOnly`.
- Una cookie creada por el servidor se controla mediante una respuesta HTTP y puede ser `HttpOnly`; el navegador obedece los atributos de `Set-Cookie`. Una creada por JavaScript usa `document.cookie`, no puede llevar `HttpOnly` y depende de las restricciones del navegador y del origen actual.

### 3. Atributos de una cookie

Ejemplo ilustrativo completo: `Set-Cookie: sid=abc123; Max-Age=1800; Path=/; Secure; HttpOnly; SameSite=Lax`. El valor `abc123` es ficticio.

| Atributo | Para qué sirve y qué ocurre si se omite |
|---|---|
| `Expires` | Fija una fecha y hora de vencimiento HTTP. Vencida, la cookie debe dejar de usarse. Si se omite y tampoco hay `Max-Age`, es una cookie de sesión. Ejemplo: `Expires=Wed, 21 Oct 2026 07:28:00 GMT`. |
| `Max-Age` | Fija cuántos segundos queda vigente desde que se recibe. Un valor cero o negativo la vence inmediatamente. Si aparecen `Max-Age` y `Expires`, los navegadores modernos dan prioridad a `Max-Age`. |
| Cookie de sesión | Cookie sin `Expires` ni `Max-Age`: en general se descarta al acabar la sesión del navegador, aunque las funciones de restauración pueden reabrir esa sesión. |
| `Domain` | Amplía el alcance al dominio indicado y sus subdominios permitidos. Si se omite, queda restringida al host que la creó (cookie *host-only*), que reduce su exposición. No se puede fijar un dominio ajeno al sitio. |
| `Path` | Limita en qué rutas del mismo host se envía. Si se omite, el navegador deriva una ruta predeterminada de la URL actual; `Path=/` la hace disponible en las rutas del sitio. No es una frontera de seguridad entre aplicaciones del mismo host. |
| `Secure` | Indica que debe enviarse solo por conexiones seguras HTTPS. Si se omite, una cookie normal podría enviarse por HTTP; si se intenta crear/enviar una cookie `Secure` por HTTP, el navegador suele rechazarla o no enviarla (hay excepciones especiales de desarrollo como localhost). |
| `HttpOnly` | Impide que JavaScript la lea con `document.cookie`; el navegador todavía la adjunta en solicitudes aplicables. Reduce el robo directo de cookies por XSS, aunque no impide que un script inyectado realice acciones como el usuario. Si se omite, JavaScript puede leerla si coincide el origen. |
| `SameSite=Strict` | Solo la envía en contexto del mismo sitio. Un enlace seguido desde otro sitio y un `<iframe>` ajeno no reciben la cookie en su petición. Es la política más restrictiva. |
| `SameSite=Lax` | Permite contexto propio y, normalmente, navegación superior iniciada desde otro sitio mediante métodos seguros como GET. Por tanto, la cookie puede acompañar al abrir un enlace externo hacia el sitio, pero no al cargarlo en un `<iframe>` ajeno ni a un POST entre sitios. Es el valor predeterminado habitual si se omite, aunque conviene declararlo. |
| `SameSite=None` | Permite el envío entre sitios, por ejemplo para contenido embebido que necesita sesión. Puede viajar en el iframe y en navegación externa si el navegador no bloquea cookies de terceros por otra regla. Exige `Secure` en navegadores modernos, por lo que se sirve por HTTPS. |
| `Partitioned` (CHIPS) | Pide guardar una cookie particionada por el sitio de nivel superior que la usa. Un servicio embebido puede recordar su estado dentro de cada sitio sin compartir automáticamente la misma cookie entre todos los sitios que lo incluyen. No anula `SameSite`, `Secure` ni otras políticas de bloqueo; las cookies particionadas requieren `Secure`. |

Ejemplo con varios atributos: `Set-Cookie: embed-session=xyz; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=None; Partitioned`.

### 4. Cookies de primera parte y de terceros

Una cookie de **primera parte** se usa en el contexto del sitio que la establece. Una de **terceros** se establece o se usa desde un dominio distinto al del sitio que la persona está visitando, por ejemplo, un proveedor dentro de un iframe o una petición de seguimiento.

Los navegadores limitan cookies de terceros para reducir el seguimiento de una persona entre sitios sin una relación directa y para limitar perfiles publicitarios. Safari (ITP) y Firefox (protección contra rastreo) bloquean o restringen muchos usos de seguimiento. En Chrome las políticas han cambiado: hay restricciones y controles del usuario, pero no es correcto asumir que todas las cookies de terceros están universalmente bloqueadas en todas las instalaciones; hay que comprobar navegador, modo y preferencias vigentes.

- Uso legítimo: un proveedor de videoconferencia o de pagos incrustado podría necesitar una cookie para mantener el estado de una sesión dentro del iframe. Hoy puede requerir diseño alternativo o una cookie particionada.
- Rastreo: una red publicitaria carga el mismo identificador en numerosos sitios y lo combina para inferir intereses y mostrar anuncios personalizados.

### 5. Sesiones y autenticación

Una sesión del lado del servidor es un registro con información de autenticación y estado asociado a un identificador aleatorio. El navegador suele guardar solo ese identificador en una cookie; en cada petición lo reenvía y el servidor busca los datos correspondientes. El ID debe ser difícil de adivinar y la cookie debe tener atributos adecuados.

Una sesión con cookie describe un mecanismo de transporte y estado; un JWT es un formato de token firmado que contiene declaraciones verificables. No son alternativas completamente excluyentes: un JWT también puede viajar dentro de una cookie.

- Un JWT puede almacenarse en cookie, `localStorage` o memoria del proceso/página. En una SPA, el SDK puede encargarse del almacenamiento y renovación.
- Un JWT en `localStorage` es legible por JavaScript del mismo origen. Si ocurre XSS, el atacante podría extraerlo y reutilizarlo desde otro lugar mientras siga válido.
- Una cookie `HttpOnly` no se puede extraer mediante `document.cookie`, aunque un XSS aún podría enviar peticiones autenticadas desde la página comprometida.
- Las cookies se adjuntan automáticamente y eso crea riesgo de CSRF si un sitio externo logra inducir una petición. Un token en `localStorage` no se adjunta solo: el código legítimo debe leerlo y ponerlo en el encabezado/cuerpo de la petición, por lo que un formulario externo no puede adjuntarlo automáticamente. XSS, en cambio, sí puede leerlo.
- Un **refresh token** permite obtener nuevos tokens de acceso cuando expiran. Suele tener vida y capacidad mayores, por lo que debe guardarse con especial protección, rotarse y revocarse si corresponde; su robo puede prolongar el acceso.

### 6. Seguridad: XSS y CSRF

**XSS (Cross-Site Scripting).** Si una entrada se inserta en la página como HTML ejecutable sin validación/sanitización apropiada, un atacante podría hacer que el navegador ejecute un script bajo el origen legítimo. El script podría leer cookies no `HttpOnly` y exfiltrarlas. `HttpOnly` bloquea esa lectura directa de la cookie, pero no corrige la inyección ni evita que el script actúe dentro de la sesión de la víctima.

**CSRF (Cross-Site Request Forgery).** Ejemplo paso a paso:

1. La víctima inicia sesión en `banco.example`; el navegador conserva una cookie de sesión.
2. La víctima visita `malicioso.example` en otra pestaña.
3. Esa página intenta enviar una petición a una acción del banco.
4. Si el navegador adjunta automáticamente la cookie y el servidor confía solo en ella, la aplicación podría tratar la solicitud como autenticada aunque no la haya iniciado la interfaz del banco.

`SameSite=Lax` suele detener cookies en formularios POST entre sitios; `Strict` también las restringe en navegaciones iniciadas desde otro sitio. No son defensas completas: puede haber endpoints inseguros que cambian estado con GET, configuraciones excepcionales, clientes antiguos o flujos legítimos entre sitios. Se recomienda validar un **CSRF token** impredecible, verificar origen cuando aplique y no usar GET para acciones que cambian datos.

### 7. Cookies, privacidad y normativa

En la Unión Europea, las reglas de privacidad electrónica junto con el RGPD exigen, en general, información clara y consentimiento previo para cookies no esenciales (por ejemplo, analítica no necesaria o publicidad), salvo una excepción aplicable. El consentimiento debe ser libre, específico, informado, inequívoco y revocable. El RGPD también exige una base jurídica y transparencia cuando se tratan datos personales.

En Colombia, la Ley 1581 de 2012 y su reglamentación exigen autorización previa e informada para el tratamiento de datos personales, con excepciones legales. Un identificador de cookie puede ser dato personal si permite identificar o perfilar a una persona. La obligación concreta depende del dato, propósito y contexto; no todas las cookies se clasifican automáticamente igual.

- **Estrictamente necesarias:** permiten una función solicitada o indispensable, como conservar una sesión autenticada o recordar el contenido del carrito. Por lo general no requieren consentimiento de cookies, pero sí deben explicarse.
- **Analítica/marketing:** no son indispensables para prestar la función pedida y siguen actividad o miden usuarios. En los marcos que exigen consentimiento, no deben activarse antes de obtenerlo.
- Un **gestor de consentimiento** presenta las categorías y finalidades y debería permitir aceptar, rechazar las no necesarias con la misma facilidad, configurar por categoría, retirar o cambiar la decisión más tarde, y enlazar a información de privacidad. La elección debe respetarse técnicamente.

### 8. Cookies en el mundo real: Supabase

En este proyecto el cliente se crea con `createClient()` sin un adaptador de almacenamiento propio. En `@supabase/supabase-js`, Auth usa `localStorage` por defecto cuando está disponible (y un almacenamiento alternativo adecuado en otros entornos); no crea por defecto una cookie `HttpOnly`. La clave suele tener forma `sb-<project-ref>-auth-token`, pero el nombre exacto depende de la configuración y del proyecto. Compruébalo en DevTools sin compartir su valor.

Para aplicaciones con renderizado del lado servidor, como Next.js, existe `@supabase/ssr`; sus clientes de navegador y servidor sincronizan la sesión con cookies mediante adaptadores de cookies. En una SPA React estática sin servidor propio no hay una respuesta del servidor de la aplicación que pueda emitir y proteger una cookie `HttpOnly`; el JavaScript del cliente sí puede guardar en `localStorage`, pero no puede marcar una cookie `HttpOnly`. Para usar cookies seguras se necesita una arquitectura que gestione autenticación desde un servidor confiable.

Para peticiones web, CORS se expresa mediante encabezados de respuesta HTTP. El servidor/API debe permitir el origen exacto del sitio publicado, por ejemplo `Access-Control-Allow-Origin: https://<usuario>.github.io` (incluyendo la ruta del proyecto no forma parte del origen). El navegador envía un encabezado `Origin` y comprueba la respuesta; añadir manualmente `Access-Control-Allow-Origin` al `fetch` del cliente no habilita CORS. La lista de URLs de redirección de Auth en Supabase es una configuración distinta de CORS. En Supabase, verifica las opciones/orígenes admitidos por el servicio usado y no habilites credenciales para un origen comodín.

### 9. Herramientas del navegador

- **Chrome:** DevTools → **Application** → **Storage** → **Cookies** → el origen.
- **Firefox:** DevTools → **Storage** → **Cookies** → el origen.
- La tabla puede incluir `Name`, `Value`, `Domain`, `Path`, `Expires / Max-Age`, `Size`, `HttpOnly`, `Secure`, `SameSite` y, en navegadores recientes, datos como `Partition Key`. El nombre y valor identifican el par; dominio/ruta muestran el alcance; expiración su vigencia; tamaño la cantidad de bytes aproximada; y las columnas booleanas/política reflejan atributos. Las columnas exactas dependen de la versión.
- Para quitar una cookie concreta, selecciónala en esa tabla y usa la tecla Delete o el menú contextual/botón de borrado que ofrezca el navegador. Confirma que eliminaste solo esa fila; limpiar todo el almacenamiento del sitio borra más datos.

## Parte 2 — Ejercicio práctico

### Ejercicio A — Inspeccionar cookies reales

**Evidencia personal pendiente de tomar en el navegador:** abre el proyecto desplegado o un sitio de prueba con cookies, abre la pestaña de cookies indicada arriba y captura la tabla. Guarda la imagen como `docs/cookies-devtools.png` e insértala aquí. Antes de compartirla, oculta valores de cookies de sesión, tokens y cualquier dato personal: el valor completo de una cookie de autenticación equivale a una credencial.

> Captura de DevTools: pendiente de añadir por el estudiante. No se incluyó una imagen ficticia ni una cookie ajena.

Al observar tu captura, completa con los valores de tu sesión:

- Cookie que parece de sesión (`Session` o equivalente en `Expires`): **pendiente de inspección**.
- Cookie con fecha de vencimiento fija: **pendiente de inspección**.
- ¿Alguna muestra `HttpOnly`?: **pendiente de inspección**.
- ¿Aparece al evaluar `document.cookie`?: comprueba el resultado en Console; una cookie `HttpOnly` no aparece. **Pega aquí el resultado real, eliminando cualquier token/valor sensible:** pendiente.

### Ejercicio B — Crear y leer cookies con JavaScript

En la consola del sitio de prueba se ejecuta una asignación por vez:

```js
document.cookie = "tema=oscuro; path=/; max-age=3600";
console.log(document.cookie);
document.cookie = "tema=; path=/; max-age=0";
console.log(document.cookie);
```

En un origen de prueba limpio, la primera lectura incluye `tema=oscuro`; la segunda ya no incluye esa cookie. Puede mostrar otros pares que ya fueran visibles a JavaScript en ese origen. No copies ni publiques tokens de la salida.

No existe un `document.cookie = ""` para borrar todo porque cada escritura afecta una sola cookie identificada por nombre y ámbito. El navegador tampoco permite a una página borrar indiscriminadamente cookies de otros nombres/ámbitos. Se repite `path=/` porque el borrado debe apuntar a la misma combinación de nombre, dominio y ruta con la que se creó; si se creó con otro `Path`, usa ese mismo valor.

### Ejercicio C — Mini helper de cookies en React

El helper propio está en [`cookies.js`](../2026-08-18/login-supabase/src/utils/cookies.js). El selector visible en la pantalla de acceso, configuración y panel de productos guarda `tema=claro` o `tema=oscuro` durante 365 días; al recargar, recupera la preferencia y aplica el tema. En HTTPS solicita `Secure`; usa `SameSite=Lax` y `Path=/`. Esta cookie de preferencia no es `HttpOnly` porque la crea el navegador con JavaScript.

Código final:

```js
/**
 * Guarda una cookie accesible desde JavaScript.
 * @param {string} nombre Nombre de la cookie.
 * @param {string} valor Valor que se guardará.
 * @param {number} diasExpiracion Días hasta que expire; debe ser finito.
 * @param {{ secure?: boolean, sameSite?: 'Strict' | 'Lax' | 'None', path?: string }} [opciones]
 *   Atributos opcionales: Secure requiere HTTPS; SameSite controla el envío entre sitios;
 *   Path limita las rutas donde la cookie estará disponible.
 */
export function setCookie(nombre, valor, diasExpiracion, opciones = {}) {
  if (!nombre || !Number.isFinite(diasExpiracion)) {
    throw new TypeError('Se requiere un nombre y un número finito de días de expiración.')
  }

  const { secure = false, sameSite = 'Lax', path = '/' } = opciones
  if (sameSite === 'None' && !secure) {
    throw new TypeError('SameSite=None requiere la opción secure: true.')
  }

  const maxAge = Math.trunc(diasExpiracion * 24 * 60 * 60)
  const secureAttribute = secure ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(nombre)}=${encodeURIComponent(valor)}; Max-Age=${maxAge}; Path=${path}; SameSite=${sameSite}${secureAttribute}`
}

/**
 * Devuelve el valor de una cookie visible para JavaScript, o null si no existe.
 * Las cookies HttpOnly no son visibles mediante esta función ni document.cookie.
 * @param {string} nombre Nombre de la cookie.
 * @returns {string | null}
 */
export function getCookie(nombre) {
  const encodedName = `${encodeURIComponent(nombre)}=`
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(encodedName))

  return cookie ? decodeURIComponent(cookie.slice(encodedName.length)) : null
}

/**
 * Elimina una cookie al escribirla vacía con expiración pasada.
 * @param {string} nombre Nombre de la cookie.
 * @param {{ secure?: boolean, sameSite?: 'Strict' | 'Lax' | 'None', path?: string }} [opciones]
 *   Debe coincidir con el Path usado al crear la cookie.
 */
export function deleteCookie(nombre, opciones = {}) {
  setCookie(nombre, '', -1, opciones)
}
```

**Captura personal pendiente:** selecciona el tema oscuro en la aplicación, recarga, comprueba que el tema sigue oscuro y muestra la cookie `tema` en DevTools. Guarda la imagen como `docs/tema-cookie.png` e insértala aquí. La captura debe mostrar el selector y la cookie después de recargar; oculta el valor de cualquier cookie distinta a `tema`.

> Captura del selector funcionando y cookie tras recargar: pendiente de añadir por el estudiante.

### Ejercicio D — Simular el problema de CSRF (conceptual)

Este formulario es solo un ejemplo de análisis y **no debe ejecutarse contra un sitio real**. En una página maliciosa hipotética, si un banco aceptara el formulario, confiara solo en una cookie automáticamente adjuntada y no validara CSRF ni el origen:

```html
<form action="https://banco.example/api/transferir-dinero" method="POST">
  <input type="hidden" name="destino" value="cuenta-controlada-por-atacante">
  <input type="hidden" name="cantidad" value="1000">
  <button type="submit">Continuar</button>
</form>
```

Si la víctima está autenticada y la cookie se envía en ese POST, el servidor vulnerable podría interpretar la solicitud como suya. CORS no impide necesariamente que el formulario envíe la petición; suele impedir que un script externo lea la respuesta.

Con `SameSite=Strict`, la cookie no acompañaría una petición iniciada desde otro sitio, así que ese flujo no autenticaría la transferencia. Con `SameSite=Lax`, una navegación superior con GET puede llevar cookie, pero el POST de formulario entre sitios normalmente no; el ataque descrito no debería funcionar si el navegador aplica Lax y el endpoint solo acepta POST. Aun así, se requiere un token CSRF y validaciones del lado servidor como defensa complementaria.

### Ejercicio E — Auditoría de este proyecto

1. **Dónde se almacena la sesión:** el código de [`supabaseClient.js`](../2026-08-18/login-supabase/src/supabaseClient.js) llama a `createClient()` sin almacenamiento personalizado. Por ello, `@supabase/supabase-js` usa `localStorage` en un navegador compatible. Confírmalo en DevTools → Application → Local Storage y busca una clave con forma `sb-<project-ref>-auth-token`. En Cookies no esperes encontrar por defecto una cookie `HttpOnly` de sesión Supabase. La verificación directa en el navegador queda pendiente si no hay sesión configurada. No incluyas el token en esta entrega.
2. **Riesgo XSS y mitigación:** si un script malicioso lograra ejecutarse en el origen de esta SPA, podría leer el token de `localStorage` y tratar de reutilizar la sesión. El hecho de usar React no elimina XSS: hay que evitar insertar HTML no confiable con `dangerouslySetInnerHTML`, codificar/sanitizar contenido según el contexto, revisar dependencias y validar entradas. Una CSP estricta reduce las formas de inyectar/ejecutar scripts (mejor configurada como encabezado HTTP por el servidor), pero no sustituye la prevención de XSS. Para mayor protección del token puede adoptarse un backend confiable que gestione sesión con cookies `HttpOnly; Secure; SameSite` y defensas CSRF; una SPA estática no puede crear `HttpOnly` por su cuenta.

| Atributo/concepto | ¿Lo usa tu proyecto? | ¿Dónde lo verificaste? |
|---|---|---|
| `Secure` | La cookie de preferencia `tema` lo activa en HTTPS; las cookies de Auth por defecto no son cookies del cliente configuradas aquí. | Código de [`App.jsx`](../2026-08-18/login-supabase/src/App.jsx) y fila `tema` en DevTools. |
| `HttpOnly` | No en la cookie `tema`; JavaScript no puede crear ese atributo. Supabase usa almacenamiento de navegador en esta SPA, no una cookie `HttpOnly` predeterminada. | Código de [`cookies.js`](../2026-08-18/login-supabase/src/utils/cookies.js), DevTools → Application → Cookies. |
| `SameSite` | `Lax` para `tema`. | La fila `tema` en DevTools → Cookies y el código del helper. |
| Cookies de terceros | El código propio no configura cookies de terceros. Los proveedores externos podrían tener sus propias políticas. | DevTools → Cookies del sitio, inspeccionando dominio y contexto; no inferirlo sin evidencia. |
| Banner de consentimiento | No se encontró un gestor/banner de consentimiento en este proyecto. | Revisión de las pantallas/componentes del proyecto. |
| Token de Supabase: ¿cookie o localStorage? | `localStorage` por la configuración predeterminada de `@supabase/supabase-js`. | DevTools → Application → Local Storage; contrastado con [`supabaseClient.js`](../2026-08-18/login-supabase/src/supabaseClient.js). |

## Fuentes consultadas

- [MDN: HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [MDN: `Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [MDN: `document.cookie`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)
- [MDN: SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value)
- [Chrome DevTools: View, add, edit, and delete cookies](https://developer.chrome.com/docs/devtools/application/cookies)
- [Firefox DevTools: Storage Inspector](https://firefox-source-docs.mozilla.org/devtools-user/storage_inspector/)
- [Supabase: Auth sessions](https://supabase.com/docs/guides/auth/sessions)
- [Supabase: `@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side)
- [Supabase: CORS](https://supabase.com/docs/guides/api/cors)
- [Unión Europea: Cookies](https://commission.europa.eu/cookies_en)
- [Colombia: Ley 1581 de 2012](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981)
