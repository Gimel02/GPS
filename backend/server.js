const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔌 conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "050500", // 👈 pon aquí tu password (si le pusiste)
  database: "parking"
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

app.listen(3000, () => {
  console.log("🔥 Backend corriendo en http://localhost:3000");
});

