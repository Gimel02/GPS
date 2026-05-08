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
INSERT INTO estudiantes VALUES
(
  '22130851',
  'Luis',
  'Murillo',
  'Aguero',
  '1234',
  'Nissan',
  'Rojo',
  'ABC123',
  'TICS'
);
INSERT INTO cajones (zona, numero, ocupado)
VALUES

('puerta4',1,0),
('puerta4',2,0),
('puerta4',3,0),
('puerta4',4,0),
('puerta4',5,0),
('puerta4',6,0),
('puerta4',7,0),
('puerta4',8,0);