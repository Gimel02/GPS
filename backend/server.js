const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME
});

db.on("error", (err) => {
  console.error("[MySQL]", err.code || "", err.message);
});

/** Identificador único del trabajador (cuerpo de solicitud). */
function numeroTrabajadorFromBody(body) {
  if (!body || typeof body !== "object") return null;
  const v = body.numero_trabajador ?? body.numero_empleado;
  return v != null && String(v).trim() !== "" ? String(v).trim() : null;
}

function isBadFieldError(err) {
  return err && (err.code === "ER_BAD_FIELD_ERROR" || err.errno === 1054);
}

function tryNumeroEmpleado(numero, callback) {
  db.query(
    "SELECT * FROM trabajadores WHERE numero_empleado = ? LIMIT 1",
    [numero],
    (err, rows) => {
      if (err) {
        if (isBadFieldError(err)) return callback(null, null);
        return callback(err);
      }
      if (!rows.length) return callback(null, null);
      callback(null, rows[0]);
    }
  );
}

/** Busca por numero_trabajador; si no hay fila o la columna no existe, intenta numero_empleado (esquemas previos). */
function queryTrabajadorByNumero(numero, callback) {
  db.query(
    "SELECT * FROM trabajadores WHERE numero_trabajador = ? LIMIT 1",
    [numero],
    (err, rows) => {
      if (err) {
        if (!isBadFieldError(err)) return callback(err);
        return tryNumeroEmpleado(numero, callback);
      }
      if (rows.length) return callback(null, rows[0]);
      return tryNumeroEmpleado(numero, callback);
    }
  );
}

function jsonTrabajador(row) {
  const num =
    row.numero_trabajador != null && row.numero_trabajador !== ""
      ? row.numero_trabajador
      : row.numero_empleado;
  return {
    ...row,
    numero_trabajador: num,
    numero_empleado: num
  };
}

/** Condición para localizar fila en `puertas` por id numérico o por código (ej. puerta1). */
function puertaLookupFromParam(puerta) {
  if (puerta === undefined || puerta === null) return null;
  const s = String(puerta).trim();
  if (s === "") return null;
  if (/^\d+$/.test(s)) {
    return { column: "id", value: parseInt(s, 10) };
  }
  return { column: "codigo", value: s };
}

/**
 * MySQL / mysql2 puede devolver BOOLEAN como 0/1, string o Buffer (BIT).
 * `!!buffer` es siempre true con un Buffer no vacío, y la UI marca todas bloqueadas.
 */
function normalizeLockedFromDb(v) {
  if (v == null || v === "") return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (Buffer.isBuffer(v)) {
    if (v.length === 0) return false;
    return v[0] !== 0;
  }
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true";
  }
  return false;
}

/** Acepta boolean o equivalentes por si el cliente envía otro tipo. */
function parseLockedFromBody(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
  }
  return null;
}

function isPuertaBloqueada(puertaParam, cb) {
  const lookup = puertaLookupFromParam(puertaParam);
  if (!lookup) {
    return cb(null, false);
  }
  const sql = `SELECT locked FROM puertas WHERE ${lookup.column} = ? LIMIT 1`;
  db.query(sql, [lookup.value], (err, rows) => {
    if (err) return cb(err);
    if (!rows.length) return cb(null, false);
    cb(null, normalizeLockedFromDb(rows[0].locked));
  });
}

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
  const numero = numeroTrabajadorFromBody(req.body);
  if (!numero) {
    return res.status(400).json({ success: false, error: "numero_empleado_requerido" });
  }

  queryTrabajadorByNumero(numero, (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "error_db" });
    }
    if (!row) {
      return res.json({
        success: false,
        error: "no_encontrado",
        hint:
          "Ejecuta en MySQL el INSERT de ejemplo en database.sql (trabajadores) o crea la tabla y el registro 10001."
      });
    }
    res.json({ success: true, trabajador: jsonTrabajador(row) });
  });
});

/**
 * Bloqueo maestro: fija locked = true en una o varias puertas.
 * Body: { puerta_ids: number[] }
 */
app.post("/admin/bloqueo-maestro", (req, res) => {
  const puertaIds = req.body.puerta_ids;

  if (!Array.isArray(puertaIds) || puertaIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Se requiere puerta_ids: arreglo con uno o más IDs de puerta."
    });
  }

  const ids = [];
  for (const raw of puertaIds) {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1) {
      return res.status(400).json({
        success: false,
        error: "puerta_ids debe ser un arreglo de enteros positivos (IDs de puerta)."
      });
    }
    ids.push(n);
  }

  const placeholders = ids.map(() => "?").join(",");
  const sql = `UPDATE puertas SET locked = TRUE WHERE id IN (${placeholders})`;

  db.query(sql, ids, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    if (!result.affectedRows || result.affectedRows < 1) {
      return res.status(404).json({
        success: false,
        error: "No se encontró ninguna puerta con los IDs enviados."
      });
    }

    res.json({
      success: true,
      filas_actualizadas: result.affectedRows
    });
  });
});

/**
 * Bloquea o desbloquea una sola puerta por ID.
 * Body: { puerta_id: number, locked: boolean }
 */
app.post("/admin/puerta-locked", (req, res) => {
  const rawId = req.body.puerta_id;
  const id =
    typeof rawId === "string" && /^\d+$/.test(String(rawId).trim())
      ? parseInt(String(rawId).trim(), 10)
      : Number(rawId);
  const lockedParsed = parseLockedFromBody(req.body.locked);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      error: "puerta_id debe ser un entero positivo."
    });
  }
  if (lockedParsed === null) {
    return res.status(400).json({
      success: false,
      error: "locked debe ser true (bloquear) o false (desbloquear)."
    });
  }

  const lockedSql = lockedParsed ? 1 : 0;

  db.query(
    "UPDATE puertas SET locked = ? WHERE id = ?",
    [lockedSql, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }
      if (result.affectedRows > 0) {
        return res.json({ success: true });
      }
      db.query(
        "SELECT id, locked FROM puertas WHERE id = ? LIMIT 1",
        [id],
        (e2, r2) => {
          if (e2) {
            console.error(e2);
            return res.status(500).json({ success: false });
          }
          if (!r2.length) {
            return res.status(404).json({
              success: false,
              error: "No se encontró la puerta indicada."
            });
          }
          const current = normalizeLockedFromDb(r2[0].locked);
          if (current === lockedParsed) {
            return res.json({ success: true });
          }
          return res.status(500).json({
            success: false,
            error: "No se pudo actualizar el estado de la puerta."
          });
        }
      );
    }
  );
});

/**
 * Validación de acceso para lectores QR/tarjeta: deniega a todos los perfiles si la puerta está bloqueada.
 * Body: { puerta } o { puerta_id } o { codigo_puerta } (id numérico o código ej. puerta1)
 */
app.post("/validar-acceso", (req, res) => {
  const puerta =
    req.body.puerta_id ?? req.body.codigo_puerta ?? req.body.puerta;

  isPuertaBloqueada(puerta, (err, bloqueada) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ permitido: false, motivo: "error_servidor" });
    }
    if (bloqueada) {
      return res.status(403).json({
        permitido: false,
        motivo: "puerta_bloqueada"
      });
    }
    res.json({ permitido: true });
  });
});

/** Estado de puertas (locked) para sincronizar lectores o consola; lectura desde la misma tabla persistida. */
app.get("/puertas", (req, res) => {
  const sql = "SELECT id, codigo, nombre, locked FROM puertas ORDER BY id";
  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "error_servidor" });
    }
    res.json(
      rows.map((r) => ({
        ...r,
        locked: normalizeLockedFromDb(r.locked)
      }))
    );
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

function printMysqlHelp() {
  console.error("\n❌ No se pudo conectar a MySQL (acceso denegado o datos incorrectos).");
  console.error("   Comprueba backend/.env:");
  console.error("   • DB_USER y DB_PASSWORD deben ser los mismos con los que entras a phpMyAdmin.");
  console.error("   • Si root no tiene contraseña (XAMPP, etc.), deja: DB_PASSWORD=");
  console.error("   • DB_NAME debe existir (p. ej. parking).\n");
}

db.connect((err) => {
  if (err) {
    console.error("Mensaje:", err.message);
    printMysqlHelp();
    process.exit(1);
  }
  console.log("✓ MySQL conectado");
  app.listen(3000, () => {
    console.log("🔥 Backend corriendo en http://localhost:3000");
  });
});
