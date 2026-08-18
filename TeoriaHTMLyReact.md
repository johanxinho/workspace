# Teoría de HTML, CSS y React

## 1. HTML

### ¿Qué es una etiqueta HTML?

Una etiqueta HTML es una marca que le indica al navegador qué representa una parte de la página. Por ejemplo, `<p>` identifica un párrafo y `<img>` identifica una imagen. Muchas etiquetas tienen apertura y cierre, como `<p>Texto</p>`, aunque algunas no necesitan una etiqueta de cierre, como `<img>` o `<br>`.

Las etiquetas también pueden tener **atributos**, que agregan información o configuración. En `<img src="foto.jpg" alt="Una foto">`, `src` indica dónde está la imagen y `alt` describe su contenido.

### Estructura de un archivo HTML

Un archivo HTML normalmente tiene esta estructura:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi página</title>
  </head>
  <body>
    <h1>Contenido visible</h1>
  </body>
</html>
```

- `<!DOCTYPE html>` indica que se está usando HTML5.
- `<html>` es el elemento raíz que contiene todo el documento.
- `<head>` guarda información de configuración que normalmente no se muestra directamente.
- `<meta>` define datos como la codificación de caracteres y la adaptación a pantallas pequeñas.
- `<title>` establece el texto de la pestaña del navegador.
- `<body>` contiene todo lo que el usuario ve en la página.

### Cinco etiquetas de texto

1. **`<h1>`**: representa el título principal de la página. Los títulos secundarios se pueden hacer con `<h2>` hasta `<h6>`.
2. **`<p>`**: representa un párrafo de texto.
3. **`<strong>`**: marca un texto como importante y normalmente lo muestra en negrita.
4. **`<em>`**: da énfasis a un texto y normalmente lo muestra en cursiva.
5. **`<br>`**: inserta un salto de línea sin crear un párrafo nuevo.

Ejemplo:

```html
<h1>Bienvenidos</h1>
<p>Este es un <strong>concepto importante</strong> y este tiene <em>énfasis</em>.<br>
La frase continúa en otra línea.</p>
```

### Links en HTML

Un link o enlace permite ir a otra página, archivo, sección del mismo documento o dirección de internet. Se crea con la etiqueta `<a>` y su atributo `href`, que contiene el destino. El texto ubicado entre la apertura y el cierre es lo que la persona puede pulsar.

```html
<a href="https://developer.mozilla.org/es/">Aprender HTML</a>
```

También se puede abrir el destino en otra pestaña usando `target="_blank"`. En ese caso conviene agregar `rel="noopener noreferrer"`:

```html
<a href="https://developer.mozilla.org/es/" target="_blank" rel="noopener noreferrer">
  Consultar documentación
</a>
```

Para enlazar una parte de la misma página, se coloca un `id` en el destino y se usa ese identificador después de `#`:

```html
<a href="#contacto">Ir al contacto</a>
<h2 id="contacto">Contacto</h2>
```

## 2. CSS

CSS significa *Cascading Style Sheets* o hojas de estilo en cascada.  
Se usa para cambiar la presentación de HTML, como colores, tamaños, espacios y posiciones.  
La palabra “cascada” indica que varias reglas pueden aplicarse y el navegador decide cuál tiene prioridad.

### Selectores CSS

Un selector indica qué elementos HTML recibirán una regla de estilo. Los más comunes son:

```css
/* Selector de etiqueta */
p {
  color: black;
}

/* Selector de clase */
.destacado {
  color: crimson;
}

/* Selector de id */
#titulo-principal {
  font-size: 2rem;
}

/* Selector de atributo */
input[type="email"] {
  border-color: steelblue;
}

/* Selector descendiente */
article p {
  line-height: 1.5;
}

/* Selector universal */
* {
  box-sizing: border-box;
}
```

También existen selectores de estado, como `a:hover`, que se aplican cuando el cursor pasa sobre un enlace, y selectores de hijo directo, como `ul > li`.

### Una etiqueta modificada por múltiples selectores

Un mismo elemento puede coincidir con varios selectores. Por ejemplo:

```html
<p id="aviso" class="destacado">Mensaje importante</p>
```

```css
p {
  color: black;
}

.destacado {
  color: orange;
}

#aviso {
  color: red;
}
```

El párrafo coincide con los tres selectores, pero termina siendo rojo porque un selector de `id` tiene más especificidad que uno de clase o de etiqueta. Si dos reglas tienen la misma especificidad, gana la que aparece después. Una regla escrita directamente en `style` suele tener todavía más prioridad, y `!important` fuerza una prioridad especial, por lo que conviene usarlo únicamente cuando sea necesario.

## 3. React y los componentes

### ¿Qué es un componente de React?

Un componente de React es una función reutilizable que recibe información y devuelve una parte de la interfaz. Normalmente se escribe con una función cuyo nombre comienza en mayúscula y retorna JSX.

```jsx
function Saludo({ nombre }) {
  return <h1>Hola, {nombre}</h1>;
}
```

Después se puede usar como si fuera una etiqueta propia:

```jsx
<Saludo nombre="Johan" />
```

### Relación entre componentes y etiquetas HTML

Se parecen porque ambos sirven para construir la interfaz y un componente puede devolver etiquetas HTML. La diferencia es que una etiqueta HTML es una instrucción que el navegador conoce directamente, mientras que un componente es una pieza de código creada por el programador para organizar y reutilizar la interfaz.

En JSX pueden mezclarse los dos tipos:

```jsx
function Tarjeta() {
  return (
    <article>
      <h2>Producto</h2>
      <button>Comprar</button>
    </article>
  );
}
```

`article`, `h2` y `button` son etiquetas HTML. `Tarjeta` es un componente de React. JSX se parece a HTML, pero permite incluir expresiones de JavaScript entre llaves, como `{nombre}`.

## 4. Conceptos importantes de React

### Tipos de variables en un componente

Dentro de un componente se pueden encontrar varias clases de valores:

- **Constantes y variables locales**: se crean con `const` o `let` para cálculos o datos temporales durante una ejecución. Cambiarlas por sí solas no actualiza la pantalla.
- **Props**: datos que el componente recibe desde su componente padre. Son de solo lectura para el componente que los recibe.
- **Estado (`state`)**: datos que pueden cambiar durante la vida del componente. Se manejan con hooks como `useState`; al actualizarlos React vuelve a renderizar el componente.
- **Referencias (`ref`)**: valores persistentes que se guardan con `useRef` y pueden cambiar sin provocar un nuevo renderizado. Son útiles para acceder al DOM o conservar un valor entre renderizados.

### ¿Qué son los props?

Los props son propiedades que un componente padre le pasa a un componente hijo. Sirven para configurarlo y para enviarle información. El hijo puede leerlos, pero no debe modificarlos directamente.

```jsx
function Boton({ texto, color }) {
  return <button style={{ color }}>{texto}</button>;
}

<Boton texto="Guardar" color="green" />
```

En este ejemplo, `texto` y `color` son props. Si el padre cambia sus valores, el botón se renderiza con la nueva información.

### ¿Qué es `useState`?

`useState` es un hook que permite guardar un dato que cambia y hacer que React actualice la interfaz cuando ese dato cambia. Devuelve un arreglo con el valor actual y una función para actualizarlo.

```jsx
import { useState } from "react";

function Contador() {
  const [cantidad, setCantidad] = useState(0);

  return (
    <button onClick={() => setCantidad(cantidad + 1)}>
      Clics: {cantidad}
    </button>
  );
}
```

La función `setCantidad` debe usarse para cambiar el estado. React detecta ese cambio y vuelve a mostrar el componente con el nuevo valor.

### ¿Qué es `useEffect`?

`useEffect` es un hook para ejecutar efectos secundarios después de que React renderiza un componente. Un efecto secundario es una acción que interactúa con algo externo al cálculo de la interfaz, como pedir datos a una API, cambiar el título de la pestaña, iniciar un temporizador o suscribirse a un evento.

```jsx
import { useEffect } from "react";

function Pagina() {
  useEffect(() => {
    document.title = "Mi página";
  }, []);

  return <h1>Inicio</h1>;
}
```

El arreglo de dependencias controla cuándo se ejecuta el efecto. `[]` significa que se ejecuta una vez después del montaje. Si contiene valores, se vuelve a ejecutar cuando esos valores cambian. Un efecto también puede devolver una función de limpieza, por ejemplo para detener un temporizador o quitar un evento.

### Diferencias entre `useState` y `useEffect`

| `useState` | `useEffect` |
| --- | --- |
| Guarda información que pertenece al componente. | Ejecuta una acción después del renderizado. |
| Su actualización puede provocar un nuevo renderizado. | Sirve para sincronizar React con sistemas externos. |
| Devuelve un valor y una función para cambiarlo. | Recibe una función de efecto y, opcionalmente, dependencias. |
| Ejemplos: contador, texto de formulario o menú abierto. | Ejemplos: API, temporizador o cambio del título del documento. |

En resumen, `useState` representa datos que la interfaz necesita recordar, mientras que `useEffect` realiza tareas relacionadas con esos datos fuera del renderizado. No se deben usar para lo mismo: primero se guarda el dato con `useState` y solo se usa `useEffect` cuando hace falta sincronizar ese dato con algo externo.