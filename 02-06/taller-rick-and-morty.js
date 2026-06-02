async function obtenerPersonaje(id) {
  try {
    const url = `https://rickandmortyapi.com/api/character/${id}`;

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const personaje = await respuesta.json();

    console.log("=== PERSONAJE POR ID ===");
    console.log(personaje);
  } catch (error) {
    console.error("Error al obtener el personaje:", error.message);
  }
}

obtenerPersonaje(2);


async function obtenerPersonajes() {
  try {
    const respuesta = await fetch(
      "https://rickandmortyapi.com/api/character"
    );

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    console.log("=== TODOS LOS PERSONAJES ===");
    console.log(datos);
  } catch (error) {
    console.error("Error al obtener los personajes:", error.message);
  }
}

obtenerPersonajes();


async function obtenerNombres() {
  try {
    const respuesta = await fetch(
      "https://rickandmortyapi.com/api/character"
    );

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    console.log("=== NOMBRES DE PERSONAJES ===");

    datos.results.forEach((personaje) => {
      console.log(personaje.name);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

obtenerNombres();


async function obtenerInformacion() {
  try {
    const respuesta = await fetch(
      "https://rickandmortyapi.com/api/character"
    );

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    console.log("=== NOMBRE | ESTADO | ESPECIE ===");

    datos.results.forEach((personaje) => {
      console.log(
        `Nombre: ${personaje.name} | Estado: ${personaje.status} | Especie: ${personaje.species}`
      );
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

obtenerInformacion();



async function obtenerPagina(numeroPagina) {
  try {
    const respuesta = await fetch(
      `https://rickandmortyapi.com/api/character?page=${numeroPagina}`
    );

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    console.log(`=== PÁGINA ${numeroPagina} ===`);
    console.log(datos);

    console.log("=== NOMBRES DE LA PÁGINA ===");

    datos.results.forEach((personaje) => {
      console.log(personaje.name);
    });

    console.log("=== INFORMACIÓN DE PAGINACIÓN ===");
    console.log(datos.info);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

obtenerPagina(2);