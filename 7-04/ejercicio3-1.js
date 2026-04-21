let frase = "  Bienvenidos al taller de JavaScript  ";

console.log("Frase original:", frase);

let fraseSinEspacios = frase.trim();
console.log("Frase sin espacios al inicio y al final:", fraseSinEspacios);

let fraseEnMayusculas = fraseSinEspacios.toUpperCase();
console.log("Frase en mayúsculas:", fraseEnMayusculas);

let fraseEnMinusculas = fraseSinEspacios.toLowerCase();
console.log("Frase en minúsculas:", fraseEnMinusculas);

let palabras = fraseSinEspacios.split(" ");
console.log("Frase dividida en palabras:", palabras);