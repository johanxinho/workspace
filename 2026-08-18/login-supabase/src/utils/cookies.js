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
