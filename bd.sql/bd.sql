
-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE recordarte; -- Crea el contenedor principal para toda la información del proyecto.

USE recordarte; -- Selecciona esta base de datos para que las tablas se creen dentro de ella.


-- 2. TABLA PARA EL PERSONAL DE APOYO O DOCENTES
CREATE TABLE trabajadores (
    id_trabajador INT PRIMARY KEY AUTO_INCREMENT, -- Identificador único interno para cada trabajador.
    nombre_t VARCHAR(255) NOT NULL,              -- Almacena el nombre completo del trabajador.
    id_t INT NOT NULL,                           -- Guarda el número de documento de identidad (TI/CC).
    ocupacion_t VARCHAR(255),                    -- Define el cargo o rol específico (ej. "Coordinador").
    -- Métodos lógicos:
    -- + Guardar(): Inserta un nuevo trabajador en el sistema.
    -- + Mostrar a admins(): Permite que los administradores vean la lista de personal.
);


-- 3. TABLA PARA LOS LÍDERES O GESTORES DEL SISTEMA
CREATE TABLE administradores (
    id_administrador INT PRIMARY KEY AUTO_INCREMENT, -- Identificador único para el control de acceso.
    nombre_a VARCHAR(255) NOT NULL,                  -- Nombre completo del administrador.
    id_a INT NOT NULL,                               -- Documento de identidad del administrador.
    encargo_a VARCHAR(255),                          -- Responsabilidad específica (ej. "Líder de Deportes").
    -- + Guardar(): Registra un nuevo administrador con permisos.
);


-- 4. TABLA PARA LOS USUARIOS (ESTUDIANTES DE LA CANDELARIA)
CREATE TABLE estudiantes (
    id_estudiante INT PRIMARY KEY AUTO_INCREMENT, -- ID único para identificar a cada alumno.
    nombre_e VARCHAR(255) NOT NULL,               -- Nombre completo del estudiante.
    id_e INT NOT NULL,                            -- Número de tarjeta de identidad del estudiante.
    curso_e VARCHAR(100),                         -- Grado al que pertenece (ej. "11°", "10-2").
    -- + Guardar(): Registra al estudiante en la plataforma.
    -- + Mostrar a admins(): Permite la supervisión por parte de los líderes.
);


-- 5. TABLA NÚCLEO: GESTIÓN DE RECORDATORIOS Y AGENDA
CREATE TABLE actividades (
    id_actividad INT PRIMARY KEY AUTO_INCREMENT, -- Identificador único de cada recordatorio creado.
    fecha_a DATE NOT NULL,                       -- Fecha programada para la tarea o el evento.
    actividad_a VARCHAR(255) NOT NULL,           -- Descripción del deber o examen (ej. "Taller Filosofía").
    alarma_a ENUM('SI', 'NO') DEFAULT 'NO',      -- Define si el sistema debe generar una alerta activa.
    
    -- LLAVES FORÁNEAS: Conectan la actividad con su responsable/creador
    id_administrador_fk INT, -- Liga la actividad a un administrador específico.
    id_trabajador_fk INT,    -- Liga la actividad a un trabajador de apoyo.
    id_estudiante_fk INT,     -- Liga la actividad a la agenda personal de un estudiante.
    
    FOREIGN KEY (id_administrador_fk) REFERENCES administradores(id_administrador),
    FOREIGN KEY (id_trabajador_fk) REFERENCES trabajadores(id_trabajador),
    FOREIGN KEY (id_estudiante_fk) REFERENCES estudiantes(id_estudiante)
    -- + Guardar(): Almacena la nueva actividad en el calendario.
    -- + Mostrar a usuarios(): Publica el recordatorio para que los estudiantes lo vean.
);