# Documentación de código

## ¿Qué es la documentación de código?

La documentación de código es la información que explica qué hace un programa, cómo está organizado, cómo se utiliza y qué decisiones importantes se tomaron al construirlo. Sirve para que otras personas, o el mismo autor en el futuro, puedan entender, utilizar y mantener el proyecto.

Una buena documentación debe ser:

- Clara y breve.
- Actualizada junto con el código.
- Dirigida a la persona que necesita usar o modificar el proyecto.
- Acompañada de ejemplos cuando una explicación puede generar dudas.
- Precisa con los requisitos, entradas, salidas y posibles errores.

## ¿Cómo se documenta el código frontend?

El frontend es la parte de una aplicación con la que interactúa el usuario, normalmente mediante el navegador. Incluye HTML, CSS, JavaScript y bibliotecas o frameworks como React.

Para documentarlo se recomienda explicar:

- La estructura de las páginas y sus componentes.
- El comportamiento de los botones, formularios y eventos.
- Los datos que recibe y muestra cada componente.
- Los estados de carga, error y contenido vacío.
- La comunicación con APIs o servicios externos.
- Las instrucciones para instalar, ejecutar y construir el proyecto.
- Las decisiones importantes de diseño, accesibilidad y adaptación a dispositivos móviles.

También conviene documentar la interfaz pública de cada componente: sus propiedades, los valores permitidos y el resultado que muestra.

## Diferencias entre la documentación frontend y backend

| Aspecto | Frontend | Backend |
|---|---|---|
| Lugar donde funciona | Navegador o aplicación cliente | Servidor |
| Qué se explica | Componentes, pantallas, eventos y estados | APIs, reglas de negocio, base de datos y procesos |
| Usuarios principales | Diseñadores y desarrolladores de interfaz | Desarrolladores, administradores y equipos de operaciones |
| Documentación habitual | Guía de componentes, capturas y flujos de usuario | Documentación de endpoints, modelos de datos y variables de entorno |
| Errores importantes | Validaciones, mensajes y estados visuales | Códigos HTTP, excepciones, permisos y registros |
| Seguridad | Evitar exponer secretos y validar la entrada del usuario | Autenticación, autorización, datos sensibles y protección de servicios |

Ambos lados necesitan un README, instrucciones de instalación, ejemplos y una descripción de sus dependencias. La diferencia principal está en el comportamiento que se debe explicar: el frontend se centra en la experiencia e interacción del usuario, mientras que el backend se centra en los datos, la lógica y los servicios.

## ¿Cómo se documenta código CSS?

CSS se documenta principalmente mediante comentarios y, cuando el proyecto es grande, mediante una guía de estilos.

Los comentarios se escriben entre `/*` y `*/`:

```css
/* Botón principal usado en formularios y acciones de confirmación. */
.boton-principal {
  background-color: #1769aa;
  color: white;
  padding: 0.75rem 1rem;
}
```

Es útil documentar:

- La organización de los archivos y las capas de estilos.
- El propósito de las variables CSS y los colores principales.
- Los nombres y usos de las clases reutilizables.
- Los puntos de quiebre utilizados para diseño responsive.
- Los estados como `:hover`, `:focus`, `:disabled` y `:checked`.
- Las excepciones o reglas que no sean evidentes.

No es necesario comentar cada propiedad. El código debe tener nombres claros y los comentarios deben explicar la intención o una decisión que no sea obvia.

## ¿Cómo se documenta código JavaScript?

JavaScript puede documentarse con comentarios normales para explicar una decisión puntual y con **JSDoc** para describir funciones, clases, parámetros y valores de retorno.

```javascript
/**
 * Calcula el precio final de un producto aplicando un descuento.
 *
 * @param {number} precio - Precio original del producto.
 * @param {number} descuento - Descuento expresado como porcentaje.
 * @returns {number} Precio final con el descuento aplicado.
 * @throws {TypeError} Si los argumentos no son números.
 */
function calcularPrecioFinal(precio, descuento) {
  if (typeof precio !== "number" || typeof descuento !== "number") {
    throw new TypeError("El precio y el descuento deben ser números");
  }

  return precio - (precio * descuento) / 100;
}
```

Etiquetas JSDoc frecuentes:

- `@param`: describe un parámetro.
- `@returns`: describe el valor que devuelve una función.
- `@throws`: indica cuándo puede producirse un error.
- `@example`: muestra un ejemplo de uso.
- `@deprecated`: señala que una función ya no debería utilizarse.
- `@type`: indica el tipo de una variable o propiedad.

Además de JSDoc, un proyecto JavaScript debería incluir un README con la instalación, los comandos disponibles, la configuración y ejemplos de uso. Los comentarios deben explicar el motivo de una decisión, no repetir literalmente lo que ya se entiende leyendo el código.

## ¿Cómo se documenta código React específicamente?

En React se documentan los componentes, sus props, el estado que administran, los eventos que reciben y las condiciones en las que se muestran. También se debe indicar si un componente depende de un contexto, realiza peticiones o tiene efectos secundarios.

Ejemplo con JSDoc:

```jsx
/**
 * Muestra un botón que indica el estado de una operación.
 *
 * @param {object} props - Propiedades del componente.
 * @param {string} props.texto - Texto visible del botón.
 * @param {boolean} props.cargando - Indica si la operación está en curso.
 * @param {() => void} props.alHacerClick - Función ejecutada al pulsar el botón.
 * @returns {JSX.Element} Botón con el estado correspondiente.
 */
function BotonGuardar({ texto, cargando, alHacerClick }) {
  return (
    <button type="button" disabled={cargando} onClick={alHacerClick}>
      {cargando ? "Guardando..." : texto}
    </button>
  );
}
```

En un componente React es importante documentar:

- El propósito y la responsabilidad del componente.
- Cada prop, su tipo y si es obligatoria u opcional.
- Los estados posibles de la interfaz.
- Las acciones que puede ejecutar el usuario.
- Las peticiones a APIs y la forma de manejar sus errores.
- Los hooks utilizados cuando su propósito no sea evidente.
- Los componentes que se pueden reutilizar y los que son específicos de una pantalla.

Para proyectos grandes también se pueden usar herramientas como Storybook para mostrar componentes en diferentes estados, TypeScript para describir tipos y una herramienta de generación de documentación a partir de JSDoc.

## Ejemplo de documentación de un componente

```jsx
/**
 * Lista productos obtenidos desde el servidor.
 *
 * Estados de la interfaz:
 * - Mientras carga: muestra un mensaje de espera.
 * - Si falla la petición: muestra un mensaje de error.
 * - Si no hay productos: muestra una lista vacía.
 * - Si la petición funciona: muestra los productos.
 */
function ListaProductos({ productos, cargando, error }) {
  if (cargando) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p role="alert">No se pudieron cargar los productos.</p>;
  }

  if (productos.length === 0) {
    return <p>No hay productos disponibles.</p>;
  }

  return (
    <ul>
      {productos.map((producto) => (
        <li key={producto.id}>{producto.nombre}</li>
      ))}
    </ul>
  );
}
```

## Recomendaciones finales

1. Escribir la documentación cerca del código que describe.
2. Usar nombres claros para funciones, variables, clases y componentes.
3. Mantener el README actualizado con los comandos reales del proyecto.
4. Documentar primero las partes públicas y reutilizables.
5. Explicar los casos límite y los errores esperados.
6. Revisar la documentación durante los cambios de código.
7. Evitar comentarios obvios, duplicados o que ya no coincidan con la implementación.
