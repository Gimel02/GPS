CREATE DATABASE IF NOT EXISTS parking;
USE parking;

DROP TABLE IF EXISTS entradas_del_dia;
DROP TABLE IF EXISTS cajones;
DROP TABLE IF EXISTS trabajadores;
DROP TABLE IF EXISTS estudiantes;

-- =========================
-- TABLA ESTUDIANTES
-- =========================
CREATE TABLE estudiantes (
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

INSERT INTO estudiantes
(numero_control, nombre, apellido_paterno, apellido_materno, password, marca_auto, color, placas, carrera)
VALUES
('22130001','Carlos','Ramirez','Lopez','1234','Nissan','Rojo','EST001','Sistemas'),
('22130002','Laura','Gomez','Perez','1234','Toyota','Blanco','EST002','Industrial'),
('22130003','Miguel','Torres','Diaz','1234','Honda','Negro','EST003','Mecatronica'),
('22130004','Ana','Martinez','Ruiz','1234','Chevrolet','Azul','EST004','Gestion Empresarial'),
('22130005','Jorge','Hernandez','Soto','1234','Ford','Gris','EST005','Civil'),
('22130006','Paola','Navarro','Cruz','1234','Mazda','Rojo','EST006','Quimica'),
('22130007','Luis','Vazquez','Morales','1234','Kia','Blanco','EST007','Electrica'),
('22130008','Sofia','Reyes','Campos','1234','Hyundai','Negro','EST008','Sistemas'),
('22130009','Diego','Aguilar','Vega','1234','Toyota','Plata','EST009','Industrial'),
('22130843','Gimel','Muñoz','Flores','1234','Volkswagen','Plata','EG156F','Sistemas');

-- =========================
-- TABLA TRABAJADORES
-- =========================
CREATE TABLE trabajadores (
  numero_empleado VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(50),
  apellido_paterno VARCHAR(50),
  apellido_materno VARCHAR(50),
  password VARCHAR(50),
  marca_auto VARCHAR(50),
  color VARCHAR(50),
  placas VARCHAR(20),
  departamento VARCHAR(100)
);

INSERT INTO trabajadores
(numero_empleado, nombre, apellido_paterno, apellido_materno, password, marca_auto, color, placas, departamento)
VALUES
('10001','Carlos','Ramirez','Lopez','1234','Nissan','Rojo','ABC111','Administración'),
('10002','Laura','Gomez','Perez','1234','Toyota','Blanco','ABC222','Biblioteca'),
('10003','Miguel','Torres','Diaz','1234','Honda','Negro','ABC333','Mantenimiento'),
('10004','Ana','Martinez','Ruiz','1234','Chevrolet','Azul','ABC444','Escolares'),
('10005','Jorge','Hernandez','Soto','1234','Ford','Gris','ABC555','Dirección'),
('10006','Paola','Navarro','Cruz','1234','Mazda','Rojo','ABC666','Laboratorio'),
('10007','Luis','Vazquez','Morales','1234','Kia','Blanco','ABC777','Vigilancia'),
('10008','Sofia','Reyes','Campos','1234','Hyundai','Negro','ABC888','Finanzas'),
('10009','Diego','Aguilar','Vega','1234','Toyota','Plata','ABC999','Docencia'),
('10953','Gimel','Muñoz','Flores','1234','Volkswagen','Plata','EG156F','Sistemas');

-- =========================
-- TABLA CAJONES
-- =========================
CREATE TABLE cajones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zona VARCHAR(20),
  numero INT,
  ocupado BOOLEAN DEFAULT 0,
  usuario VARCHAR(50)
);

-- Puerta 1 llena, para prueba visual
INSERT INTO cajones (zona, numero, ocupado, usuario)
SELECT 'puerta1', n, 1, NULL FROM (
SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40
) nums;

-- Puerta 2 disponible
INSERT INTO cajones (zona, numero, ocupado, usuario)
SELECT 'puerta2', n, 0, NULL FROM (
SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40
) nums;

-- Puerta 3 llena, para prueba visual
INSERT INTO cajones (zona, numero, ocupado, usuario)
SELECT 'puerta3', n, 1, NULL FROM (
SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40
) nums;

-- Puerta 4 disponible
INSERT INTO cajones (zona, numero, ocupado, usuario)
SELECT 'puerta4', n, 0, NULL FROM (
SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40
) nums;

-- =========================
-- TABLA ENTRADAS DEL DIA
-- =========================
CREATE TABLE entradas_del_dia (
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
  id_cajon INT NULL,
  numero_cajon INT NULL,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_salida DATETIME NULL,
  estado VARCHAR(20) DEFAULT 'dentro'
);
