require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 🚀 LOGIN
app.post("/login", (req, res) => {
  const { numero_control, password } = req.body;

  const sql = `
    SELECT * FROM estudiantes 
    WHERE numero_control = ? AND password = ?
  `;

  db.query(sql, [numero_control, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (result.length > 0) {
      res.json({ success: true, user: result[0] });
    } else {
      res.json({ success: false });
    }
  });
});


//
app.post("/apartar", (req, res) => {
  const { id_cajon, usuario } = req.body;

  const sql = `
    UPDATE cajones 
    SET ocupado = 1, usuario = ?
    WHERE id = ? AND ocupado = 0
  `;

  db.query(sql, [usuario, id_cajon], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Ya está ocupado" });
    }
  });
});

app.get("/cajones/:zona", (req, res) => {
  const zona = req.params.zona;

  const sql = "SELECT * FROM cajones WHERE zona = ?";

  db.query(sql, [zona], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});

app.post("/liberar", (req, res) => {
  const { id_cajon, usuario } = req.body;

  const sql = `
    UPDATE cajones
    SET ocupado = 0, usuario = NULL
    WHERE id = ? AND usuario = ?
  `;

  db.query(sql, [id_cajon, usuario], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: result.affectedRows > 0 });
  });
});

app.post("/entradas-dia", (req, res) => {
  const {
    tipo,
    puerta,
    proposito,
    nombre,
    apellido,
    entra_vehiculo,
    placas,
    marca,
    color
  } = req.body;

  const sql = `
    INSERT INTO entradas_del_dia
    (tipo, puerta, proposito, nombre, apellido, entra_vehiculo, placas, marca, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      tipo,
      puerta,
      proposito,
      nombre,
      apellido,
      entra_vehiculo,
      placas || null,
      marca || null,
      color || null
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }

      res.json({ success: true, id: result.insertId });
    }
  );
});

app.listen(3000, () => {
  console.log("🔥 Backend corriendo en http://localhost:3000");
});


console.log(process.env.DB_HOST);