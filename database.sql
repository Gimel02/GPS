CREATE DATABASE IF NOT EXISTS parking;
USE parking;

-- ======================
-- TABLA ESTUDIANTES
-- ======================
CREATE TABLE IF NOT EXISTS estudiantes (
  numero_control VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(50),
  apellido_paterno VARCHAR(50),
  apellido_materno VARCHAR(50),
  password VARCHAR(50),
  marca_auto VARCHAR(50),
  color VARCHAR(50),
  placas VARCHAR(20),
  carrera VARCHAR(100)
);

-- ======================
-- TABLA CAJONES
-- ======================
CREATE TABLE IF NOT EXISTS cajones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zona VARCHAR(20),
  numero INT,
  ocupado BOOLEAN,
  usuario VARCHAR(50)
);

-- ======================
-- TABLA ENTRADAS DEL DIA
-- ======================
CREATE TABLE IF NOT EXISTS entradas_del_dia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(30),
  clave VARCHAR(30),
  puerta VARCHAR(20),
  proposito VARCHAR(150),
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  entra_vehiculo BOOLEAN,
  placas VARCHAR(20),
  marca VARCHAR(50),
  color VARCHAR(50),
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- TABLA TRABAJADORES (IngresoSeguro / control de acceso)
-- numero_trabajador: identificador único (lectura tarjeta / número de empleado)
-- ======================
CREATE TABLE IF NOT EXISTS trabajadores (
  numero_trabajador VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(50),
  apellido_paterno VARCHAR(50),
  apellido_materno VARCHAR(50),
  password VARCHAR(50),
  marca_auto VARCHAR(50),
  color VARCHAR(50),
  placas VARCHAR(20),
  departamento VARCHAR(100),
  tipo_usuario VARCHAR(30) NOT NULL DEFAULT 'Trabajador',
  rol VARCHAR(50) NOT NULL DEFAULT 'Usuario'
);

-- ======================
-- TABLA PUERTAS (bloqueo maestro por infraestructura)
-- ======================
CREATE TABLE IF NOT EXISTS puertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(100),
  locked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Puertas alineadas con el front existente (puerta1..puerta4)
INSERT IGNORE INTO puertas (codigo, nombre, locked) VALUES
  ('puerta1', 'Puerta 1', FALSE),
  ('puerta2', 'Puerta 2', FALSE),
  ('puerta3', 'Puerta 3', FALSE),
  ('puerta4', 'Puerta 4', FALSE);

-- Ejemplo: administrador para probar POST /admin/bloqueo-maestro (ajusta numero_trabajador).
INSERT IGNORE INTO trabajadores (numero_trabajador, nombre, apellido_paterno, apellido_materno, tipo_usuario, rol)
VALUES ('10001', 'Nombre', 'Apellido', '', 'Trabajador', 'Administrador');

-- Si la tabla entradas_del_dia ya existía sin la columna clave:
-- ALTER TABLE entradas_del_dia ADD COLUMN clave VARCHAR(30) AFTER tipo;