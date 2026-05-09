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

//  LOGIN
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


//TRABAJADOR
app.post("/trabajador", (req, res) => {
  const { numero_empleado } = req.body;

  const sql = `
    SELECT * FROM trabajadores
    WHERE numero_empleado = ?
  `;

  db.query(sql, [numero_empleado], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (result.length > 0) {
      res.json({ success: true, trabajador: result[0] });
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
  clave,
  puerta,
  proposito,
  nombre,
  apellido,
  entra_vehiculo,
  placas,
  marca,
  color,
  id_cajon,
  numero_cajon
} = req.body;

  function insertarEntrada(claveFinal) {
    const sql = `
      INSERT INTO entradas_del_dia
(tipo, clave, puerta, proposito, nombre, apellido, entra_vehiculo, placas, marca, color, id_cajon, numero_cajon, estado)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'dentro')
    `;

    db.query(
      sql,
      [
  tipo,
  claveFinal || null,
  puerta,
  proposito,
  nombre,
  apellido,
  entra_vehiculo,
  placas || null,
  marca || null,
  color || null,
  id_cajon || null,
  numero_cajon || null
],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false });
        }

        res.json({
          success: true,
          id: result.insertId,
          clave: claveFinal
        });
      }
    );
  }

  if (tipo === "invitado") {
    const sqlClave = `
      SELECT clave
      FROM entradas_del_dia
      WHERE tipo = 'invitado' AND clave LIKE 'INV-%'
      ORDER BY id DESC
      LIMIT 1
    `;

    db.query(sqlClave, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }

      let siguiente = 1;

      if (result.length > 0 && result[0].clave) {
        const ultimoNumero = parseInt(result[0].clave.replace("INV-", ""), 10);
        if (!isNaN(ultimoNumero)) {
          siguiente = ultimoNumero + 1;
        }
      }

      const claveInvitado = `INV-${String(siguiente).padStart(6, "0")}`;
      insertarEntrada(claveInvitado);
    });

    return;
  }

  insertarEntrada(clave);
});

app.post("/estudiante", (req, res) => {
  const { numero_control } = req.body;

  const sql = `
    SELECT * FROM estudiantes
    WHERE numero_control = ?
  `;

  db.query(sql, [numero_control], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (result.length > 0) {
      res.json({ success: true, estudiante: result[0] });
    } else {
      res.json({ success: false });
    }
  });
});

app.get("/entradas-dia", (req, res) => {
  const sql = `
    SELECT 
      id,
      tipo,
      clave,
      puerta,
      proposito,
      nombre,
      apellido,
      entra_vehiculo,
      placas,
      marca,
      color,
      fecha_hora
    FROM entradas_del_dia
    ORDER BY fecha_hora DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    res.json(result);
  });
});

app.get("/buscar-salida/:valor", (req, res) => {
  const valor = req.params.valor;

  const sql = `
    SELECT *
    FROM entradas_del_dia
    WHERE estado = 'dentro'
      AND (
        clave = ?
        OR placas = ?
        OR nombre = ?
      )
    ORDER BY fecha_hora DESC
    LIMIT 1
  `;

  db.query(sql, [valor, valor, valor], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (result.length === 0) {
      return res.json({ success: false, message: "No se encontró entrada activa" });
    }

    res.json({ success: true, entrada: result[0] });
  });
}); 

app.post("/registrar-salida", (req, res) => {
  const { id_entrada, id_cajon } = req.body;

  const actualizarEntrada = `
    UPDATE entradas_del_dia
    SET estado = 'salio',
        fecha_salida = NOW()
    WHERE id = ? AND estado = 'dentro'
  `;

  db.query(actualizarEntrada, [id_entrada], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "La entrada ya fue cerrada" });
    }

    if (!id_cajon) {
      return res.json({ success: true });
    }

    const liberarCajon = `
      UPDATE cajones
      SET ocupado = 0,
          usuario = NULL
      WHERE id = ?
    `;

    db.query(liberarCajon, [id_cajon], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ success: false });
      }

      res.json({ success: true });
    });
  });
});

app.get("/registros-activos", (req, res) => {
  const sql = `
    SELECT 
      id,
      tipo,
      clave,
      puerta,
      proposito,
      nombre,
      apellido,
      entra_vehiculo,
      placas,
      marca,
      color,
      id_cajon,
      numero_cajon,
      fecha_hora,
      estado
    FROM entradas_del_dia
    WHERE estado = 'dentro'
    ORDER BY fecha_hora DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    res.json(result);
  });
});

app.listen(3000, () => {
  console.log("🔥 Backend corriendo en http://localhost:3000");
});


console.log(process.env.DB_HOST);