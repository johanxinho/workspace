# Taller: Publicación de proyectos React + Supabase

## Parte 1 — Investigación teórica

Documento preparado para el taller escolar de publicación de proyectos (Johan / johanxinho).  
Fecha de referencia de datos y comandos DNS: **15 de septiembre de 2026** (UTC).

---

### 1. Cómo llega un usuario a tu sitio

Cuando alguien escribe la URL de la app en el navegador (o hace clic en un enlace), no “viaja” el nombre tal cual: el equipo convierte ese nombre en una IP, abre una conexión segura y pide el HTML. El camino típico, como lo entiendo para un frontend React estático + Supabase, es:

1. **URL → hostname.** El navegador separa esquema, host, puerto, ruta, query y fragmento (ver tabla abajo).
2. **Consulta DNS.** Pregunta a un resolutor (ISP, 1.1.1.1, 8.8.8.8…): “¿qué IP tiene este nombre?”. Si no está en caché, el resolutor sube por la jerarquía hasta obtener un **A** (IPv4) o **AAAA** (IPv6).
3. **TCP.** Con la IP, abre conexión al puerto **443** (HTTPS) o 80 (HTTP). TCP ordena y confirma paquetes.
4. **TLS.** Antes de la petición web, cliente y servidor negocian TLS: el servidor muestra un certificado, se verifica la cadena hasta una CA confiable y se acuerdan claves de cifrado (sección 4).
5. **Petición HTTP(S).** Ya cifrado el canal, envía algo como `GET /taller-react/ HTTP/1.1` con cabecera `Host`. El servidor responde con status (`200`, `301`, `404`…) y el cuerpo (HTML, JS, CSS…).
6. **Render en el cliente.** El navegador interpreta el HTML, descarga el bundle de React y ejecuta la SPA. Las llamadas a Supabase repiten el ciclo HTTPS hacia otra URL.

**Ejemplo propio:** si publico `https://johanxinho.github.io/taller-react/`, el DNS de `github.io` apunta a IPs de GitHub Pages (rango `185.199.x.x`). El servidor entrega `index.html`; React Router se encarga de rutas como `/taller-react/login` en el cliente, no con un archivo físico por cada path.

#### Partes de una URL (ejemplo propio)

Ejemplo completo:

`https://app.johan-taller.com:443/dashboard/tareas?filtro=hoy#detalle`

| Parte | En el ejemplo | Qué es |
|-------|---------------|--------|
| **Esquema** | `https` | Protocolo (`https` = cifrado) |
| **Subdominio** | `app` | Etiqueta a la izquierda del dominio |
| **Dominio** | `johan-taller` | Nombre de segundo nivel que registraste |
| **TLD** | `com` | Dominio de nivel superior |
| **Puerto** | `443` | Solo se escribe si no es el default (443 en HTTPS, 80 en HTTP) |
| **Ruta** | `/dashboard/tareas` | Recurso / path dentro del sitio |
| **Query string** | `?filtro=hoy` | Parámetros opcionales enviados al servidor |
| **Fragmento** | `#detalle` | Ancla local del navegador; **no** viaja en la petición HTTP |

Otro ejemplo realista del taller: `https://johanxinho.github.io/taller-react/?ref=clase#inicio` — aquí el “dominio” efectivo es `github.io`, el subdominio es `johanxinho`, y la ruta es `/taller-react/`.

#### Dominio vs subdominio vs hosting (por qué se contratan por separado)

- **Dominio:** el nombre que registras (`johan-taller.com`). Es una etiqueta en el DNS, **no** es el servidor ni el disco donde viven los archivos.
- **Subdominio:** una etiqueta más a la izquierda (`www`, `app`, `api`). Cada una puede apuntar a un sitio distinto sin comprar otro dominio.
- **Hosting / plataforma:** dónde se sirven los archivos o corre la app (GitHub Pages, Netlify, un VPS…).

Se contratan por separado porque cumplen roles distintos: el dominio es la “marca” / dirección; el hosting es la “casa” donde está el contenido. Puedes cambiar de Pages a Cloudflare Pages **sin** cambiar de dominio: solo actualizas registros DNS. También puedes tener el dominio en un registrador, el DNS en Cloudflare y el sitio en GitHub Pages.

**Fuentes:** [MDN — How the web works](https://developer.mozilla.org/es/docs/Learn/Getting_started_with_the_web/How_the_Web_works), [MDN — What is a URL?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL), [Cloudflare Learning — What is DNS?](https://www.cloudflare.com/learning/dns/what-is-dns/), [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986).

---

### 2. DNS (+ ejercicio práctico)

**DNS (Domain Name System)** es la **agenda de contactos** de Internet: tú guardas “Mamá” y el celular sabe el número; aquí guardas `github.com` y el DNS te da la IP del servidor. Sin DNS tendríamos que memorizar números.

#### Tipos de registros que usamos en despliegue

| Registro | Para qué sirve | Ejemplo típico |
|----------|----------------|----------------|
| **A** | Nombre → IPv4 | `github.com` → `140.82.113.3` |
| **AAAA** | Nombre → IPv6 | mismo host con IPv6 |
| **CNAME** | Alias de un nombre a otro nombre | `www.midominio.com` → `johanxinho.github.io` |
| **ALIAS / ANAME** | Parecido a CNAME pero usable en el **apex/root** (`midominio.com`) | Apuntar la raíz a un host de Pages/CDN cuando CNAME en apex no está permitido |
| **MX** | Servidores de correo | `github.com` → Outlook Protection |
| **TXT** | Texto libre (SPF, DKIM, verificación de propiedad) | `v=spf1 ...` |
| **NS** | Quién es autoridad del dominio | nameservers del registrador / Cloudflare |
| **SOA** | Metadatos de la zona (serial, refresh, responsable, tiempos) | “cabecera” administrativa de la zona DNS |

**¿Por qué existen ALIAS/ANAME si ya hay CNAME?** En muchos DNS **no puedes poner un CNAME en el apex** (`midominio.com`) porque el apex ya necesita otros registros (NS, SOA, a veces MX). ALIAS/ANAME (nombres comerciales de algunos proveedores) simulan un alias en la raíz resolviendo por detrás a A/AAAA, para poder apuntar `midominio.com` a GitHub Pages o a una CDN sin romper la zona.

El **SOA** (*Start of Authority*) no lo editamos a diario, pero es el registro que describe la zona: serial (versión), cada cuánto los secundarios refrescan, contactos, etc. Si alguien te pide “¿quién manda esta zona?”, el SOA + los NS responden eso.

#### Jerarquía y resolución

La resolución va de lo general a lo particular:

1. **Raíz (`.`)** → servidores raíz.
2. **TLD** (`.com`, `.io`, `.mx`) → servidores del TLD.
3. **Dominio autoritativo** (`github.com`) → nameservers del dueño.
4. **Respuesta final** con A/AAAA/MX/etc., más un **TTL** (tiempo de caché).

El **resolutor recursivo** (ISP o Cloudflare) hace ese trabajo por nosotros y cachea según el TTL. Tu PC casi nunca habla con la raíz: habla con el resolutor.

#### TTL y propagación DNS

El **TTL** (*Time To Live*) dice cuántos segundos puede cachear un resolutor esa respuesta. TTL de 300 s (5 min) → cambios se ven antes, más consultas. TTL de 86400 (1 día) → menos consultas, pero un error tarda más en corregirse. En un taller conviene TTL bajo mientras configuramos el dominio custom.

**Propagación** no es magia ni un “broadcast mundial”: es la suma de cachés (resolutores de ISP, navegador, SO, CDNs) que siguen sirviendo la respuesta vieja hasta que expire el TTL anterior. En la práctica un cambio puede verse en **minutos** si el TTL era bajo, o tardar **hasta ~24–48 h** si había TTLs altos o cachés agresivas. Por eso a veces “en mi casa ya carga y en el celular de un amigo no”.

#### Ejercicio práctico — salidas reales

Los comandos se ejecutaron en el entorno del taller. **No son capturas inventadas:** se pegó la salida de texto tal cual quedó en `dns-comandos.txt`.

> **Nota de ejecución:** Fecha UTC de los comandos: **2026-09-15 18:17:14 UTC** (equivalente a **13:17 COT / América/Bogotá**, UTC−5).

##### `nslookup github.io`

```text
=== nslookup github.io ===
Server:		10.0.0.2
Address:	10.0.0.2#53

Non-authoritative answer:
Name:	github.io
Address: 185.199.111.153
Name:	github.io
Address: 185.199.109.153
Name:	github.io
Address: 185.199.110.153
Name:	github.io
Address: 185.199.108.153
```

**Interpretación:** `github.io` resuelve a cuatro IPs del rango `185.199.x.153` (CDN / anycast de GitHub Pages). “Non-authoritative” significa que respondió el resolutor local (caché), no el servidor autoritativo de GitHub.

##### `dig github.com A`

```text
=== dig github.com A ===

; <<>> DiG 9.20.26-1~deb13u1-Debian <<>> github.com A +time=5 +tries=2
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 32137
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;github.com.			IN	A

;; ANSWER SECTION:
github.com.		29	IN	A	140.82.113.3

;; Query time: 0 msec
;; SERVER: 10.0.0.2#53(10.0.0.2) (UDP)
;; WHEN: Tue Sep 15 18:17:14 UTC 2026
;; MSG SIZE  rcvd: 55
```

**Interpretación:** registro **A** → `140.82.113.3`, con TTL restante **29** segundos en esa consulta. Status `NOERROR` = consulta válida.

##### `dig github.com MX`

```text
=== dig github.com MX ===

; <<>> DiG 9.20.26-1~deb13u1-Debian <<>> github.com MX +time=5 +tries=2
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 53237
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;github.com.			IN	MX

;; ANSWER SECTION:
github.com.		229	IN	MX	0 github-com.mail.protection.outlook.com.

;; Query time: 0 msec
;; SERVER: 10.0.0.2#53(10.0.0.2) (UDP)
;; WHEN: Tue Sep 15 18:17:14 UTC 2026
;; MSG SIZE  rcvd: 90
```

**Interpretación:** el correo de `@github.com` lo recibe Microsoft 365 / Outlook Protection (`github-com.mail.protection.outlook.com`), prioridad **0**. DNS no solo sirve para webs: también enruta email.

##### `dig +trace anthropic.com`

```text
=== dig +trace anthropic.com ===

; <<>> DiG 9.20.26-1~deb13u1-Debian <<>> +trace +time=3 anthropic.com
;; global options: +cmd
.			10	IN	NS	k.root-servers.net.
.			10	IN	NS	l.root-servers.net.
.			10	IN	NS	m.root-servers.net.
.			10	IN	NS	a.root-servers.net.
.			10	IN	NS	b.root-servers.net.
.			10	IN	NS	c.root-servers.net.
.			10	IN	NS	d.root-servers.net.
.			10	IN	NS	e.root-servers.net.
.			10	IN	NS	f.root-servers.net.
.			10	IN	NS	g.root-servers.net.
.			10	IN	NS	h.root-servers.net.
.			10	IN	NS	i.root-servers.net.
.			10	IN	NS	j.root-servers.net.
;; Received 239 bytes from 10.0.0.2#53(10.0.0.2) in 0 ms

;; communications error to 199.7.83.42#53: timed out
;; communications error to 199.7.83.42#53: timed out
;; communications error to 199.7.83.42#53: timed out
;; communications error to 202.12.27.33#53: timed out
;; communications error to 192.36.148.17#53: timed out
;; UDP setup with 2001:500:a8::e#53(2001:500:a8::e) for anthropic.com failed: network unreachable.
;; communications error to 170.247.170.2#53: timed out
;; communications error to 192.203.230.10#53: timed out
;; communications error to 192.5.5.241#53: timed out
;; UDP setup with 2001:503:c27::2:30#53(2001:503:c27::2:30) for anthropic.com failed: network unreachable.
;; UDP setup with 2001:dc3::35#53(2001:dc3::35) for anthropic.com failed: network unreachable.
;; communications error to 199.7.91.13#53: timed out
;; UDP setup with 2001:500:2f::f#53(2001:500:2f::f) for anthropic.com failed: network unreachable.
;; UDP setup with 2001:500:2d::d#53(2001:500:2d::d) for anthropic.com failed: network unreachable.
;; communications error to 192.112.36.4#53: timed out
;; UDP setup with 2001:500:1::53#53(2001:500:1::53) for anthropic.com failed: network unreachable.
;; UDP setup with 2001:503:ba3e::2:30#53(2001:503:ba3e::2:30) for anthropic.com failed: network unreachable.
;; communications error to 192.58.128.30#53: timed out
;; communications error to 192.33.4.12#53: timed out
;; UDP setup with 2001:7fd::1#53(2001:7fd::1) for anthropic.com failed: network unreachable.
;; UDP setup with 2001:500:9f::42#53(2001:500:9f::42) for anthropic.com failed: network unreachable.
;; UDP setup with 2001:500:12::d0d#53(2001:500:12::d0d) for anthropic.com failed: network unreachable.
;; communications error to 193.0.14.129#53: timed out
;; communications error to 198.97.190.53#53: timed out
;; UDP setup with 2001:7fe::53#53(2001:7fe::53) for anthropic.com failed: network unreachable.
;; UDP setup with 2001:500:2::c#53(2001:500:2::c) for anthropic.com failed: network unreachable.
(trace truncado o timeout)
```

**Interpretación:** `+trace` intenta caminar desde la raíz. Aquí se listaron los **root servers**, pero el entorno no pudo hablar con ellos (timeouts IPv4 e IPv6 “network unreachable”). Eso no invalida DNS normal: `nslookup` / `dig` sin `+trace` sí funcionaron vía el resolutor `10.0.0.2`. En redes restringidas (containers, labs) el trace suele fallar aunque la resolución cotidiana funcione.

**Alternativa práctica cuando `dig +trace` hace timeout:** usar [dnschecker.org](https://dnschecker.org). Muestra cómo se ve el mismo registro A/CNAME/NS desde resolutores de muchos países a la vez. Sirve para comprobar propagación real sin depender de que tu red pueda hablar con los root servers.

**Fuentes:** [Cloudflare — DNS records](https://www.cloudflare.com/learning/dns/dns-records/), [ICANN — DNS](https://www.icann.org/resources/pages/dns-2014-05-19-en), [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034) / [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035), man pages de `dig`/`nslookup`, [dnschecker.org](https://dnschecker.org).

---

### 3. Dominios

Un **dominio** es un nombre registrado bajo un TLD (`.com`, `.io`, `.co`, `.mx`). Lo compras en un **registrador**. Ojo: registrador, proveedor DNS y hosting **no son lo mismo**, aunque a veces la misma empresa venda los tres y por eso se confunden.

#### Registrador vs proveedor DNS vs hosting

| Rol | Qué hace | Ejemplo |
|-----|----------|---------|
| **Registrador** | Te vende el derecho a usar `tudominio.tld` por 1–10 años; habla con el registro del TLD (e ICANN en gTLD) | Namecheap, Cloudflare Registrar, GoDaddy |
| **Proveedor DNS** | Dónde editas A/CNAME/MX/TXT; puede ser el del registrador u otro | Cloudflare DNS, Route 53, DNS del registrador |
| **Hosting / plataforma** | Dónde viven los archivos o corre la app | GitHub Pages, Vercel, Netlify, un VPS |

Puedes tener el dominio en Namecheap, el DNS en Cloudflare y el sitio en GitHub Pages: solo cambias nameservers y registros.

#### Partes del nombre

- **TLD:** `.com`
- **Dominio de segundo nivel:** `mitienda` en `mitienda.com`
- **Subdominio:** `app.mitienda.com` o `johanxinho.github.io`

#### TLD genéricos vs ccTLD; `.dev` y `.app`

- **gTLD (genéricos):** `.com`, `.net`, `.org`, y muchos nuevos (`.xyz`, **`.dev`**, **`.app`**…).  
  **`.dev` y `.app`** están en la lista de **HSTS preload** de Chromium: los navegadores **fuerzan HTTPS** desde la primera visita (ni siquiera intentan HTTP en claro).
- **ccTLD (código de país):** `.co` (Colombia), `.mx`, `.us`… Reglas y precios los fija el registro nacional o su operador. `.co` también se usa mucho como marca global (“company”), no solo como “sitio colombiano”.

#### WHOIS y privacidad

**WHOIS** / RDAP publica datos de contacto del dominio (antes salía el correo personal a la vista de todo el mundo). La **privacidad WHOIS** (redacción o proxy del registrador) oculta tu email/teléfono del listado público. Muchos registradores la incluyen gratis; ICANN igual exige que el registrador tenga datos de contacto válidos aunque no salgan públicos. Conviene activarla para no recibir spam ni doxxing básico.

#### Nameservers: qué son y qué significa “apuntar el dominio a otro proveedor”

Los **nameservers (NS)** son los servidores **autoritativos** de tu zona: los que tienen la “verdad” de tus A/CNAME/MX. En el panel del registrador puedes dejar los NS del propio registrador o cambiarlos a, por ejemplo, `ada.ns.cloudflare.com` / `bob.ns.cloudflare.com`.

**“Apuntar el dominio a otro proveedor”** suele significar una de dos cosas:

1. Cambiar los **NS** para que Cloudflare (u otro) sea quien autorice la zona y ahí editas los registros; o  
2. Dejar los NS del registrador y solo crear un **A/CNAME** hacia GitHub Pages / Netlify.

Hasta que los NS nuevos no estén activos en el TLD, los cambios de A/CNAME en el panel nuevo no mandan para el mundo (otra vez: propagación + TTL).

#### Precios aproximados (≈ sep 2026)

| Registrador / TLD | Primer año (aprox.) | Renovación (aprox.) | Nota |
|-------------------|---------------------|---------------------|------|
| Namecheap `.com` | promo ~US$6–11 | ~US$14–18 | El “barato” del anuncio suele ser solo el primer año |
| Cloudflare Registrar `.com` | ~US$10.44–10.46 | ~mismo (at-cost) | Precio al costo: registro ≈ renovación |
| GoDaddy `.co` | a menudo promo | a veces ~US$50+ / caro | Revisar siempre el precio de **renovación** |
| Namecheap `.co` | variable / promo | variable (puede subir mucho) | Depende de campañas |

**Lección clave:** renovación ≠ primer año. Las promos del año 1 desaparecen; hay que mirar el precio de renovación antes de comprar.

**Ejemplo propio:** si compro `johan-taller.com` en Namecheap a ~US$8–9 el primer año y la renovación es ~US$14–18, en 3 años no pagué “precio promo × 3”. Cloudflare Registrar evita esa sorpresa en `.com`.

**Fuentes:** [ICANN — Domain names / Beginner's guides](https://www.icann.org/resources/pages/domain-name-2014-05-19-en), [Cloudflare Registrar](https://developers.cloudflare.com/registrar/), [HSTS preload](https://hstspreload.org/), sitios públicos de precios de Namecheap / GoDaddy (consultar al día de comprar).

---

### 4. HTTPS y certificados

**HTTP** viaja en texto plano. **HTTPS** = HTTP sobre **TLS**: cifra la conexión, protege integridad y ayuda a verificar que el servidor es quien dice ser (el certificado ata un nombre a una clave pública).

#### Certificados y CA

Un **certificado** lo firma una **Autoridad Certificadora (CA)** (Let’s Encrypt, DigiCert, etc.). El navegador confía en un conjunto de CAs raíz. Si el certificado no encaja con el dominio, está vencido o la cadena no cierra → advertencia de seguridad.

#### DV vs OV vs EV

| Tipo | Qué valida | Quién lo usa hoy |
|------|------------|------------------|
| **DV** (*Domain Validation*) | Solo que controlas el dominio (HTTP-01, DNS-01…) | La gran mayoría de sitios, incluido Let’s Encrypt |
| **OV** (*Organization Validation*) | Dominio + datos de la organización (revisión manual) | Empresas que quieren el nombre legal en el cert |
| **EV** (*Extended Validation*) | Validación extendida más estricta | Cada vez menos visible en la UI del navegador (ya no hay “barra verde” clásica) |

Let’s Encrypt emite **DV** gratis y automatizados con **ACME** (validez típica ~90 días). No hace OV/EV. Plataformas como GitHub Pages, Netlify, Vercel o Cloudflare renuevan el cert casi sin que toquemos nada.

#### Certificado wildcard

Un **wildcard** `*.johan-taller.com` cubre `www.johan-taller.com`, `app.johan-taller.com`, etc., pero **no** el apex `johan-taller.com` ni un sub-subdominio tipo `a.b.johan-taller.com` (solo un nivel). En Let’s Encrypt el wildcard exige el desafío **DNS-01**.

#### Error: “certificado no válido para este nombre”

Al configurar un **dominio custom**, es común ver en el navegador que el certificado **no es válido para este nombre**. El navegador compara el host de la URL con el **CN / SAN** del certificado. Si entras a `www.johan-taller.com` pero el cert solo tiene `johan-taller.com` (o al revés), o si el DNS aún apunta a un servidor con el cert de otro host (Pages sin el custom domain bien enlazado, proxy mal puesto), aparece el aviso. Otras causas: cert vencido, reloj del sistema mal, CA no confiable. La solución habitual es esperar a que la plataforma emita/renueve el cert **después** de que el DNS ya apunte bien, o corregir el mismatch de nombres.

#### HSTS (más que “un check”)

**HSTS** (*HTTP Strict Transport Security*) es la cabecera `Strict-Transport-Security`. Le dice al navegador: “durante N segundos (p. ej. un año), para este host **solo** uses HTTPS; ni lo intentes por HTTP”. Así un atacante en la red Wi‑Fi no te puede bajar a HTTP en la siguiente visita y robar cookies. Se recomienda activarlo cuando el sitio **ya** está estable en HTTPS (si lo pones mal, puedes “clavarte” en HTTPS roto un rato). Los TLD como **`.dev` / `.app`** van más lejos: están en la **HSTS preload list**, así que el navegador fuerza HTTPS **incluso la primera vez**, sin esperar a recibir la cabecera.

#### HTTP → HTTPS

Lo correcto es redirigir todo el tráfico a HTTPS (301). Así nadie se queda en la versión insegura.

**Ejemplo propio:** en GitHub Pages, al poner un dominio custom y marcar “Enforce HTTPS”, Pages pide un cert (a menudo Let’s Encrypt) y fuerza `https://`. Mientras el DNS no apunte bien, el candado no aparece o verás el error de nombre.

**Fuentes:** [Let’s Encrypt — Getting Started / FAQ](https://letsencrypt.org/getting-started/), [MDN — HTTPS](https://developer.mozilla.org/es/docs/Glossary/HTTPS), [MDN — Strict-Transport-Security](https://developer.mozilla.org/es/docs/Web/HTTP/Headers/Strict-Transport-Security), [Cloudflare — What is SSL/TLS?](https://www.cloudflare.com/learning/ssl/what-is-ssl/), [RFC 6797](https://www.rfc-editor.org/rfc/rfc6797) (HSTS).

---

### 5. Modelos de alojamiento

Publicar una app web no es “subir un archivo a un servidor” de una sola forma. Hay varios modelos, cada uno con distinto costo, control y tipo de carga. En un proyecto estudiantil Vite + React + Supabase conviene separar: el **front** (HTML/CSS/JS estático) de la **lógica de datos** (Supabase como BaaS).

#### Tabla comparativa de modelos

| Modelo | Qué es / ejemplos | Ventajas | Desventajas | Cuándo usarlo |
|--------|-------------------|----------|-------------|---------------|
| **Hosting compartido** | cPanel, Hostinger compartido | Barato, panel familiar, PHP listo | Poco control, recursos compartidos, mal para SPAs modernas | Blogs WordPress / PHP clásicos |
| **VPS** | DigitalOcean Droplet, Linode, Contabo | Root, installs libres, buen precio/control | Tú parcheas SO, HTTPS, backups y escalado | API Node propia, Docker, nginx |
| **Servidor dedicado** | Hetzner Dedicated, OVH | Máximo rendimiento y aislamiento | Caro, operación completa a tu cargo | Tráfico alto o requisitos especiales |
| **PaaS** | Render, Railway, Heroku-like | Deploy desde Git, menos ops | Free estricto; sleep en planes free | APIs o apps full-stack con proceso |
| **Serverless / Functions** | Vercel Functions, CF Workers, AWS Lambda, Supabase Edge Functions | Escala a demanda, pagas por uso | Cold starts, límites de tiempo/CPU | Webhooks, auth hooks, APIs ligeras |
| **Estático + CDN** | GitHub Pages, CF Pages, Netlify static | Muy rápido, barato/gratis, HTTPS fácil | Sin backend en el mismo host | SPA React/Vite ya *build*eada |
| **BaaS** | Supabase, Firebase, Appwrite | Auth, DB, Storage y APIs sin montar servidor | Vendor lock-in parcial; hay que diseñar RLS | Login, tablas, archivos, realtime |

#### CDN

Una **CDN (Content Delivery Network)** replica archivos en puntos de presencia cerca del usuario. Baja latencia y aguanta picos. GitHub Pages, Cloudflare y Netlify sirven el estático desde una red distribuida, no desde “un solo PC en un closet”.

#### Estático vs dinámico

- **Estático:** el servidor entrega archivos ya generados. Ideal para Vite/React si el backend es Supabase (API externa).
- **Dinámico:** el servidor genera HTML o JSON en cada request (Node, Python, Edge Function, etc.).

Con **Vite** (o Create React App) el comando `npm run build` produce una carpeta `dist/` (o `build/`) con assets hasheados. **Eso** es lo que se sube a Pages/Netlify/etc., no el código fuente con `node_modules`. La dinámica (login, datos) ocurre en el **navegador** hablando con **Supabase**.

#### El clásico 404 de las SPA

Si el usuario entra directo a `https://midominio.com/perfil/42`, el servidor busca un archivo `/perfil/42` que no existe → **404**. Solución habitual: **rewrite / fallback a `index.html`** para que React Router tome la ruta.

- GitHub Pages: `404.html` copiado de `index.html`, o usar HashRouter (`/#/perfil/42`).
- Netlify: `_redirects` con `/* /index.html 200`.
- Vercel / CF Pages: `rewrites` en config.

**Ejemplo propio:** en un CRUD de tareas con React Router, sin fallback, recargar en `/tareas` rompe en producción aunque en `npm run dev` funcione.

**Fuentes:** [Vite — Building for production](https://vitejs.dev/guide/static-deploy.html), [MDN — SPA](https://developer.mozilla.org/es/docs/Glossary/SPA), [Cloudflare — What is a CDN?](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/), docs de cada plataforma sobre redirects.

---

### 6. Comparativa de plataformas

Datos orientativos de planes **free / hobby** alrededor de **sep 2026** (pueden cambiar; siempre verificar en la doc oficial):

| Criterio | **GitHub Pages** | **Netlify Free** | **Vercel Hobby** | **Cloudflare Pages Free** | **Render (static / Hobby)** |
|----------|------------------|------------------|------------------|---------------------------|-----------------------------|
| **Plan free / límites** | Soft ~100 GB ancho de banda; sitio ≤ ~1 GB; soft 10 builds/h (Jekyll; con Actions otro cupo) | Créditos (~300/mes): bandwidth y deploys consumen créditos | Fair use ~100 GB; ~100 deployments/día (límites cuenta) | Bandwidth estático muy generoso / ilimitado en práctica; ~500 builds/mes | Hobby estático: ~5 GB outbound; ~500 min pipeline |
| **Env vars en build** | Sí, vía **GitHub Actions secrets** → `VITE_*` | Sí (UI / CLI) | Sí (Project Settings) | Sí (Pages → Settings) | Sí |
| **SPA sin config extra** | **No**: hay que resolver 404 / `basename` | Bueno: `_redirects` / UI | Excelente con frameworks detectados | Bueno (SPA mode / Functions) | Redirects configurables |
| **Serverless nativo** | **No** (solo estático) | Sí (Functions; consume créditos) | Sí (Functions; fair use Hobby) | Sí (Pages Functions ≈ cuota Workers) | Estático no; web service aparte (free con sleep) |
| **Dominio + HTTPS** | Sí (DNS + cert GitHub) | Sí | Sí | Sí (hasta ~100 dominios/proyecto) | Sí (Hobby: ~2 dominios) |
| **Preview PR** | No nativo (se puede con Actions) | **Deploy Previews** | Preview deployments | Preview deployments | Sí en flujos Git |

#### Elección para este taller

**Para este taller elegiría GitHub Pages**, porque el enunciado lo pide como plataforma de publicación del frontend React. Encaja bien: el proyecto es una SPA estática que habla con Supabase (el backend no vive en Pages). Custom domain y HTTPS gratis están soportados, y el flujo `git push` → Actions/Pages es simple para un entorno escolar. Auth, Postgres, Storage, Realtime y Edge Functions viven en **Supabase** (BaaS), así que no hace falta serverless en el host del front.

Si el enunciado no lo forzara, **Cloudflare Pages** sería mi plan B por límites free amplios y buen edge; Netlify/Vercel ganan si necesitamos previews de PR o functions sin montar otro servicio. Render lo dejaría para cuando haya un backend Node propio, no solo estático + Supabase.

**Fuentes:** [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Netlify docs / credits](https://docs.netlify.com/), [Vercel Hobby / limits](https://vercel.com/docs/plans/hobby), [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Render static sites](https://render.com/docs/static-sites).

---

### 7. Supabase en producción

#### Qué es un BaaS

**BaaS** (*Backend as a Service*) significa que no montas tu propio servidor de base de datos, auth ni archivos: un proveedor te entrega esas piezas por API. **Supabase** es un BaaS: el frontend (React + Vite en GitHub Pages) habla con el proyecto remoto en lugar de un backend Express propio.

#### Componentes relevantes

| Pieza | Para qué sirve en producción |
|-------|------------------------------|
| **Postgres** | Tablas, consultas y **RLS** |
| **Auth** | Registro, login, OTP, recuperación de contraseña, JWT |
| **Storage** | Buckets de archivos (avatares, adjuntos…) |
| **Realtime** | Suscripciones / eventos en vivo sobre cambios en tablas o canales |
| **Edge Functions** | Funciones Deno en el borde (lógica de servidor sin VPS propio); ahí sí pueden usarse secretos con cuidado |

En producción el frontend llama a `https://xxxx.supabase.co` con la **anon key**.

#### Anon key vs service_role (diferencia explícita)

| Clave | ¿Dónde va? | Comportamiento |
|-------|------------|----------------|
| **anon / publishable** | **Sí en el frontend** (`VITE_SUPABASE_ANON_KEY`) | Pensada para el navegador. Solo es “segura” si **RLS** limita qué puede hacer cada usuario. |
| **service_role / secret** | **Jamás en React ni en el repo público** | **Bypasea RLS por completo**. Solo en servidor (Edge Function, script admin, CI muy controlado). |

Docs: [Securing your API](https://supabase.com/docs/guides/api/securing-your-api).

#### Plan free (aprox. 2026)

- **2 proyectos activos**
- Pausa automática tras ~**1 semana** de inactividad
- **~500 MB** de base de datos
- **~1 GB** Storage
- **~5 GB** egress
- **~50k MAU** (Monthly Active Users) en Auth

Para un taller escolar alcanza; hay que “despertar” el proyecto si se pausa.

#### Auth, CORS, Site URL y Redirect URLs

En el dashboard de Auth hay que configurar:

- **Site URL:** la URL principal de producción (p. ej. `https://johanxinho.github.io/taller-react/`).
- **Redirect URLs:** lista de URLs permitidas tras login / magic link / OAuth. Debe incluir la de Pages **y** `http://localhost:5173` (o el puerto de Vite) para desarrollo.

**Qué pasa si no configuras la URL de producción:** Auth sigue pensando que el sitio “oficial” es localhost (o la URL vieja). Tras login o al abrir el enlace del correo, el usuario **redirige a localhost** (que en el celular del profe no existe) o el flujo falla. También pueden aparecer errores de **CORS** / origen no permitido si el front en Pages llama a la API sin que el proyecto acepte ese origen / esas redirects.

Docs: [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

#### RLS obligatorio con anon en el browser

Si la anon key está en el cliente, cualquiera puede llamar a la API. **Sin RLS**, alguien podría leer o escribir filas ajenas.

#### Ejemplo propio de política RLS (SQL)

Escenario: tabla `tareas` donde cada usuario solo ve y edita las suyas.

```sql
-- Activar RLS
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

-- Lectura: solo mis filas
CREATE POLICY "usuarios_leen_sus_tareas"
ON public.tareas
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Inserción: el user_id debe ser el mío
CREATE POLICY "usuarios_crean_sus_tareas"
ON public.tareas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update / delete: solo dueño
CREATE POLICY "usuarios_actualizan_sus_tareas"
ON public.tareas
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_borran_sus_tareas"
ON public.tareas
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

Nunca desactivo RLS “para que funcione rápido” en producción: es el candado principal del modelo client → Supabase. **Realtime** y **Storage** también se protegen con políticas; las **Edge Functions** sirven cuando necesitas lógica que no debe vivir en el navegador (y ahí puedes usar el service role con extremo cuidado, nunca embebido en el front).

**Fuentes:** [Supabase — Row Level Security](https://supabase.com/docs/guides/auth/row-level-security), [Supabase — Free plan / pricing](https://supabase.com/pricing), [Supabase Auth](https://supabase.com/docs/guides/auth), [Supabase — API keys](https://supabase.com/docs/guides/api/api-keys).

---

### 8. Variables de entorno y seguridad

En Vite, las variables expuestas al cliente deben prefijarse con `VITE_`:

```bash
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...   # anon / public key
```

En código:

```ts
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

#### Qué son y por qué `.env` va en `.gitignore`

Son valores de configuración fuera del código. Si subes `.env` a Git, cualquiera con acceso al repo (o un fork público) ve los secretos. Se ignora el `.env` / `.env.local` y se deja un `.env.example` **sin** secretos reales.

#### Qué sí y qué no va al frontend

| Valor | ¿En el bundle del navegador? | Motivo |
|-------|------------------------------|--------|
| `VITE_SUPABASE_URL` | Sí (público) | Necesario para llamar a la API |
| `anon` / `publishable` key | Sí (pública por diseño) | Restringida por RLS |
| `service_role` key | **NUNCA** | Bypass total de RLS |
| Passwords de DB, tokens privados | **NUNCA** | Secretos de servidor |

La anon key **no es secreta** en el sentido de “nadie la verá”: cualquiera puede abrir DevTools y verla. La seguridad real es **RLS + Auth**, no esconder la anon key. Nunca pongas `service_role` con prefijo `VITE_`.

#### Secreto de build (GitHub Secrets) vs secreto de runtime en servidor

- **Secreto de build:** en GitHub Actions guardas `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` como **Secrets** del repo y los inyectas solo durante `npm run build`. Ojo: después del build esas `VITE_*` **quedan literales en el JS público** del `dist/` (eso es esperado para la anon key). No uses este mecanismo para meter el `service_role`.
- **Secreto de runtime (servidor / Edge Function):** se lee en cada petición en un entorno de servidor; **nunca** se empaqueta en el front. Ahí sí pueden vivir claves privilegiadas, con rotación y acceso mínimo.

#### Si filtraste una clave

1. **Rótala ya** en el dashboard del proveedor (Supabase → API settings / generate new). La clave vieja sigue válida hasta que la revoques.
2. Quita el archivo/commit del working tree y asume que el secreto **ya es público**.
3. Actualiza `.gitignore`, secrets de CI y cualquier deploy que aún use la clave vieja.

**Borrar el commit no basta:** el historial de git (y forks, mirrors, Actions logs, caches) puede conservar la clave. Hace falta rotar; opcionalmente limpiar historial con cuidado, pero la rotación es el paso obligatorio.

**Ejemplo propio:** si alguien sube `service_role` a un commit público, puede borrar toda la DB. Hay que rotar la key en el dashboard de Supabase y revisar el historial de git (idealmente nunca llegar ahí).

**Fuentes:** [Vite — Env variables](https://vitejs.dev/guide/env-and-mode.html), [Supabase — API keys](https://supabase.com/docs/guides/api/api-keys).

---

### 9. Build y despliegue

Flujo típico React (Vite) + Supabase + GitHub Pages:

1. **Desarrollo local:** `npm install` → `npm run dev`. `.env.local` con URL y anon key.
2. **Calidad:** tests/lint si el taller los pide; asegurar rutas y variables.
3. **Build de producción:** `npm run build` → carpeta `dist/` (HTML + JS/CSS optimizados).
4. **Preview local del build:** `npm run preview` para cazar errores que solo salen en producción (rutas base, env).
5. **Publicar** con CI/CD (ver abajo: rama `gh-pages` vs Actions).
6. **Base path:** si el sitio vive en `https://user.github.io/repo/`, configurar `base: '/repo/'` en `vite.config.ts`.
7. **SPA fallback:** `404.html` = `index.html` (o HashRouter) para no romper rutas al recargar.
8. **Dominio custom (opcional):** CNAME/A (o ALIAS) en el DNS + Enforce HTTPS en Pages.
9. **Supabase:** Site URL + Redirect URLs de Auth con el dominio de Pages; RLS ya aplicadas.
10. **Verificación:** abrir el sitio, login, CRUD básico, DevTools Network sin errores CORS/401 inesperados.

#### Qué hace el build: minificación, tree shaking, code splitting, hashing

En Vite, `npm run build` no solo “copia archivos”:

- **Minificación:** quita espacios/comentarios y acorta identificadores → JS/CSS más pequeños y menos legibles.
- **Tree shaking:** elimina código de módulos ES que no se importa / no se usa.
- **Code splitting:** trocea el bundle (p. ej. con `import()` dinámico o por rutas) para que el navegador cargue solo lo necesario al inicio.
- **Hashing de nombres:** archivos como `index-a1b2c3.js` permiten caché larga en la CDN: si el contenido cambia, cambia el hash y el navegador descarga la versión nueva sin quedarse con JS viejo.

Eso es lo que termina en `dist/` y se publica en Pages.

#### CI/CD y GitHub Actions

**CI/CD** (*Continuous Integration / Continuous Delivery*) automatiza pruebas y despliegue en cada push o PR. **GitHub Actions** es el sistema de workflows de GitHub: archivos YAML en `.github/workflows/` que corren en runners (instalar Node, `npm ci`, `npm run build`, subir artifact, publicar Pages). Los **Secrets** del repo alimentan las `VITE_*` en el build sin subir `.env`.

#### Rama `gh-pages` vs workflow de Actions

| Enfoque | Cómo funciona | Notas |
|---------|---------------|-------|
| **Rama `gh-pages`** | Se publica una rama que contiene el sitio estático ya buildeado (a veces con el paquete `gh-pages` o un push manual de `dist/`) | Simple, pero meter artefactos de build en git ensucia el repo; secretos de build son más incómodos |
| **Actions + Pages (artifact)** | El workflow construye en CI, sube el artifact y GitHub Pages despliega desde el workflow (**Source = GitHub Actions**, lo recomendado hoy) | Mejor: `VITE_*` inyectadas en el build sin subir `.env`; historial del repo se queda en el código fuente |

**Ejemplo propio de `vite.config.ts` mínimo para Pages en subruta:**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/taller-despliegue/',
});
```

Checklist rápido antes de decir “ya quedó”:

- [ ] `dist/` generado sin errores
- [ ] Variables `VITE_*` presentes en el entorno de CI
- [ ] No hay `service_role` en el repo
- [ ] RLS activo en tablas sensibles
- [ ] Auth Site URL / Redirect URLs incluyen el dominio de Pages
- [ ] Recargar una ruta profunda no da 404 blanco

**Fuentes:** [Vite — Static deploy](https://vitejs.dev/guide/static-deploy.html), [Vite — Building for Production](https://vitejs.dev/guide/build), [GitHub Pages — Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Supabase — Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

---

## Fuentes consultadas

- MDN Web Docs — How the Web works: https://developer.mozilla.org/es/docs/Learn/Getting_started_with_the_web/How_the_Web_works
- MDN — What is a URL?: https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL
- MDN — HTTPS / SPA glossaries: https://developer.mozilla.org/es/docs/Glossary/HTTPS
- MDN — Strict-Transport-Security: https://developer.mozilla.org/es/docs/Web/HTTP/Headers/Strict-Transport-Security
- Cloudflare Learning — DNS: https://www.cloudflare.com/learning/dns/what-is-dns/
- Cloudflare Learning — DNS records: https://www.cloudflare.com/learning/dns/dns-records/
- Cloudflare Learning — SSL/TLS: https://www.cloudflare.com/learning/ssl/what-is-ssl/
- Cloudflare Learning — CDN: https://www.cloudflare.com/learning/cdn/what-is-a-cdn/
- ICANN — Domain Name System: https://www.icann.org/resources/pages/dns-2014-05-19-en
- ICANN — Domain names / beginner guides: https://www.icann.org/resources/pages/domain-name-2014-05-19-en
- Let’s Encrypt — Getting Started / FAQ: https://letsencrypt.org/getting-started/
- HSTS preload: https://hstspreload.org/
- DNS Checker (alternativa a dig +trace): https://dnschecker.org
- RFC 3986 (URI), RFC 1034/1035 (DNS), RFC 6797 (HSTS)
- Vite — Env variables & mode: https://vitejs.dev/guide/env-and-mode.html
- Vite — Deploying a Static Site / Build: https://vitejs.dev/guide/static-deploy.html
- GitHub Docs — Pages / limits / publishing source: https://docs.github.com/en/pages
- Supabase Docs — RLS: https://supabase.com/docs/guides/auth/row-level-security
- Supabase Docs — API keys / securing API: https://supabase.com/docs/guides/api/api-keys
- Supabase Docs — Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase — Pricing: https://supabase.com/pricing
- Netlify Docs: https://docs.netlify.com/
- Vercel Docs: https://vercel.com/docs
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Cloudflare Registrar: https://developers.cloudflare.com/registrar/
- Render — Static Sites: https://render.com/docs/static-sites

---

*Parte 1 teórica del taller de despliegue React + Supabase. Salidas DNS tomadas de `/workspace/taller-despliegue/dns-comandos.txt` (2026-09-15 18:17:14 UTC).*
