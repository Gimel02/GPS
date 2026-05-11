import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [puertasLlenas, setPuertasLlenas] = useState({});
  const [tipo, setTipo] = useState("");
  const [puerta, setPuerta] = useState("");
  const [pantalla, setPantalla] = useState("seleccion");

  const [proposito, setProposito] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [entraVehiculo, setEntraVehiculo] = useState(null);

  const [scannerActivo, setScannerActivo] = useState(false);
  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [buscaEstacionamiento, setBuscaEstacionamiento] = useState(null);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [placas, setPlacas] = useState("");
  const [marca, setMarca] = useState("");
  const [color, setColor] = useState("");

  const [numeroControl, setNumeroControl] = useState("");
const [buscaEstacionamientoEstudiante, setBuscaEstacionamientoEstudiante] = useState(null);
const [scannerEstudianteActivo, setScannerEstudianteActivo] = useState(false);

  async function validarTrabajadorYContinuar(numeroLeido) {
  const numeroLimpio = numeroLeido.trim();

  if (!numeroLimpio) {
    alert("No se detectó número de empleado");
    return;
  }

  if (buscaEstacionamiento === null) {
    alert("Primero selecciona si busca estacionamiento");
    return;
  }

  try {
    const resTrabajador = await fetch("http://localhost:3000/trabajador", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        numero_empleado: numeroLimpio
      })
    });

    const dataTrabajador = await resTrabajador.json();

    if (!dataTrabajador.success) {
      alert("Empleado no reconocido. Verifica el QR o escribe el número nuevamente.");
      setNumeroEmpleado("");
      setScannerActivo(false);
      return;
    }

    const trabajador = dataTrabajador.trabajador;

    if (buscaEstacionamiento === true) {
      onLogin({
        user: trabajador.numero_empleado,
        nombre: trabajador.nombre,
        apellido_paterno: trabajador.apellido_paterno,
        apellido_materno: trabajador.apellido_materno,
        tipo: "trabajador",
        puerta,
        marca_auto: trabajador.marca_auto,
        color: trabajador.color,
        placas: trabajador.placas,
        carrera: trabajador.departamento
      });

      setScannerActivo(false);
      navigate("/parking");
      return;
    }

    const res = await fetch("http://localhost:3000/entradas-dia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tipo: "trabajador",
        clave: trabajador.numero_empleado,
        puerta,
        proposito: "Entrada sin estacionamiento",
        nombre: trabajador.nombre,
        apellido: trabajador.apellido_paterno,
        entra_vehiculo: false,
        placas: null,
        marca: null,
        color: null
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Acceso permitido. Trabajador registrado en bitácora.");

      setNumeroEmpleado("");
      setBuscaEstacionamiento(null);
      setTipo("");
      setPuerta("");
      setPantalla("seleccion");
    } else {
      alert("Error al guardar en bitácora");
    }
  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
  }
}

  useEffect(() => {
  if (!scannerActivo || pantalla !== "trabajador") return;

  const scanner = new Html5QrcodeScanner(
    "qr-reader",
    {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250
      }
    },
    false
  );

  scanner.render(
  async (decodedText) => {
    setNumeroEmpleado(decodedText);

    try {
      await scanner.clear();
    } catch (error) {
      console.error("Error al cerrar scanner:", error);
    }

    setScannerActivo(false);
    await validarTrabajadorYContinuar(decodedText);
  },
    (error) => {
      // No pasa nada, esto se dispara muchas veces mientras busca QR
    }
  );

  return () => {
    scanner.clear().catch(() => {});
  };
}, [scannerActivo, pantalla]);

useEffect(() => {
  if (!scannerEstudianteActivo || pantalla !== "estudiante") return;

  const scanner = new Html5QrcodeScanner(
    "qr-reader-estudiante",
    {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250
      }
    },
    false
  );

  scanner.render(
    async (decodedText) => {
      setNumeroControl(decodedText);

      try {
        await scanner.clear();
      } catch (error) {
        console.error("Error al cerrar scanner:", error);
      }

      setScannerEstudianteActivo(false);
      await validarEstudianteYContinuar(decodedText);
    },
    () => {}
  );

  return () => {
    scanner.clear().catch(() => {});
  };
}, [scannerEstudianteActivo, pantalla, buscaEstacionamientoEstudiante]);

useEffect(() => {
  if (pantalla === "seleccion") {
    cargarEstadoPuertas();
  }
}, [pantalla]);

useEffect(() => {
  if (puerta && puertasLlenas[puerta]) {
    setPuerta("");
  }
}, [puertasLlenas, puerta]);

  function seleccionarInvitado() {
    setTipo("invitado");
  }

  async function cargarEstadoPuertas() {
  const puertas = ["puerta1", "puerta2", "puerta3", "puerta4"];
  const estado = {};

  try {
    for (const p of puertas) {
      const res = await fetch(`http://localhost:3000/cajones/${p}`);
      const data = await res.json();

      const llena =
        data.length > 0 &&
        data.every((c) => c.ocupado === 1 || c.ocupado === true);

      estado[p] = llena;
    }

    setPuertasLlenas(estado);
  } catch (error) {
    console.error("Error cargando estado de puertas:", error);
  }
}

  function continuarSeleccion() {
  if (!tipo) {
    alert("Selecciona Estudiante, Trabajador o Invitado");
    return;
  }

  async function validarPuertaDisponible() {
    try {
      const res = await fetch("http://localhost:3000/validar-acceso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ puerta })
      });
      const data = await res.json();
      if (!res.ok || data.permitido === false) {
        alert("Acceso denegado: puerta bloqueada por bloqueo maestro.");
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      alert("No se pudo validar el estado de la puerta.");
      return false;
    }
  }

  if (tipo === "invitado") {
    setPantalla("invitado");
  } else if (tipo === "trabajador") {
    setPantalla("trabajador");
  } else if (tipo === "estudiante") {
    setPantalla("estudiante");
  }
}

  async function handleInvitadoSubmit(e) {
    e.preventDefault();

    if (!proposito.trim() || !nombre.trim() || !apellido.trim()) {
      alert("Completa propósito, nombre y apellido");
      return;
    }

    if (entraVehiculo === null) {
      alert("Selecciona si entra en vehículo");
      return;
    }

    if (entraVehiculo === true) {
      if (!placas.trim() || !marca.trim() || !color.trim()) {
        alert("Completa placas, marca y color del vehículo");
        return;
      }
      const accesoPermitido = await validarPuertaDisponible();
      if (!accesoPermitido) return;

      onLogin({
        user: null,
        nombre,
        apellido_paterno: apellido,
        tipo: "invitado",
        puerta,
        proposito,
        entraVehiculo,
        placas,
        marca_auto: marca,
        color,
        carrera: "Invitado"
      });
      return;
    }

    try {
  const res = await fetch("http://localhost:3000/entradas-dia", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
  tipo: "invitado",
  clave: null,
  puerta,
  proposito,
  nombre,
  apellido,
  entra_vehiculo: false,
  placas: null,
  marca: null,
  color: null
})
  });

  const data = await res.json();

  if (data.success) {
  alert("Permitir acceso. Datos guardados en la bitácora del día.");

  // LIMPIAR FORM 
  setProposito("");
  setNombre("");
  setApellido("");
  setEntraVehiculo(null);
  setTipo("");
setPuerta("");

  // REGRESAR A PANTALLA PRINCIPAL
  setPantalla("seleccion");
} else {
    alert("Error al guardar en bitácora");
  }
} catch (error) {
  console.error(error);
  alert("Error conectando con el servidor");
}
    
  }

async function validarEstudianteYContinuar(numeroLeido) {
  const numeroLimpio = numeroLeido.trim();

  if (!numeroLimpio) {
    alert("Ingresa número de control");
    return;
  }

  if (buscaEstacionamientoEstudiante === null) {
    alert("Selecciona si busca estacionamiento");
    return;
  }

  try {
    const resEstudiante = await fetch("http://localhost:3000/estudiante", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        numero_control: numeroLimpio
      })
    });

    const dataEstudiante = await resEstudiante.json();

    if (!dataEstudiante.success) {
      alert("Estudiante no reconocido");
      setNumeroControl("");
      return;
    }

    const estudiante = dataEstudiante.estudiante;

    if (buscaEstacionamientoEstudiante === true) {
      onLogin({
        user: estudiante.numero_control,
        nombre: estudiante.nombre,
        apellido_paterno: estudiante.apellido_paterno,
        apellido_materno: estudiante.apellido_materno,
        tipo: "estudiante",
        puerta,
        marca_auto: estudiante.marca_auto,
        color: estudiante.color,
        placas: estudiante.placas,
        carrera: estudiante.carrera
      });

      navigate("/parking");
      return;
    }

    const res = await fetch("http://localhost:3000/entradas-dia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tipo: "estudiante",
        clave: estudiante.numero_control,
        puerta,
        proposito: "Entrada sin estacionamiento",
        nombre: estudiante.nombre,
        apellido: estudiante.apellido_paterno,
        entra_vehiculo: false,
        placas: null,
        marca: null,
        color: null
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Acceso permitido. Estudiante registrado en bitácora.");

      setNumeroControl("");
      setBuscaEstacionamientoEstudiante(null);
      setTipo("");
      setPuerta("");
      setPantalla("seleccion");
    } else {
      alert("Error al guardar");
    }
  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
  }
}

//pantalla de estudiante
if (pantalla === "estudiante") {
  return (
    <div className="page center-page">
      <div className="card login-card">
        <div className="logo-circle">🎓</div>

        <h1 className="guest-title">ESTUDIANTE</h1>

        <p className="selected-door">
          {puerta.replace("puerta", "Puerta ")} seleccionada
        </p>

        <div className="form">
          <div className="vehicle-question">
            <span>¿Busca estacionamiento?</span>

            <div className="availability-actions">
              <button
                type="button"
                className={
                  buscaEstacionamientoEstudiante === true
                    ? "status-pill yes active"
                    : "status-pill yes"
                }
                onClick={() => setBuscaEstacionamientoEstudiante(true)}
              >
                Sí
              </button>

              <button
                type="button"
                className={
                  buscaEstacionamientoEstudiante === false
                    ? "status-pill no active"
                    : "status-pill no"
                }
                onClick={() => setBuscaEstacionamientoEstudiante(false)}
              >
                No
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "20px 0" }}>
            {!scannerEstudianteActivo && (
              <button
                type="button"
                className="qr-fake-box"
                onClick={() => setScannerEstudianteActivo(true)}
              >
                📷 Escanear QR
              </button>
            )}

            {scannerEstudianteActivo && (
              <div className="qr-reader-box">
                <div id="qr-reader-estudiante"></div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setScannerEstudianteActivo(false)}
                  style={{ marginTop: "12px" }}
                >
                  Cancelar escaneo
                </button>
              </div>
            )}
          </div>

          <label>
            Número de control
            <input
              type="text"
              value={numeroControl}
              onChange={(e) => setNumeroControl(e.target.value)}
              placeholder="Ej. 22130843"
            />
          </label>

          <div className="student-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPantalla("seleccion")}
            >
              Volver
            </button>

            <button
              className="btn"
              onClick={() => validarEstudianteYContinuar(numeroControl)}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//pantalla del trabajador
  if (pantalla === "trabajador") {
  return (
    <div className="page center-page">
      <div className="card login-card">
        <div className="logo-circle">📷</div>

        <h1 className="guest-title">TRABAJADOR</h1>

        <p className="selected-door">
          {puerta.replace("puerta", "Puerta ")} seleccionada
        </p>

        <div className="form">

          <div className="vehicle-question">
            <span>¿Busca estacionamiento?</span>

            <div className="availability-actions">
              <button
                type="button"
                className={
                  buscaEstacionamiento === true
                    ? "status-pill yes active"
                    : "status-pill yes"
                }
                onClick={() => setBuscaEstacionamiento(true)}
              >
                Sí
              </button>

              <button
                type="button"
                className={
                  buscaEstacionamiento === false
                    ? "status-pill no active"
                    : "status-pill no"
                }
                onClick={() => setBuscaEstacionamiento(false)}
              >
                No
              </button>
            </div>
          </div>

          {/* FAKE QR */}
          <div style={{ textAlign: "center", margin: "20px 0" }}>
  {!scannerActivo && (
    <button
      type="button"
      className="qr-fake-box"
      onClick={() => setScannerActivo(true)}
    >
      📷 Escanear QR
    </button>
  )}

  {scannerActivo && (
    <div className="qr-reader-box">
      <div id="qr-reader"></div>

      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setScannerActivo(false)}
        style={{ marginTop: "12px" }}
      >
        Cancelar escaneo
      </button>
    </div>
  )}
</div>

          {/* INPUT REAL */}
          <label>
            Número de empleado
            <input
              type="text"
              value={numeroEmpleado}
              onChange={(e) => setNumeroEmpleado(e.target.value)}
              placeholder="Ej. 12345"
            />
          </label>

          <div className="student-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPantalla("seleccion")}
            >
              Volver
            </button>
            <button
              className="btn"
              onClick={() => validarTrabajadorYContinuar(numeroEmpleado)}
            >
              Continuar
            </button>        
          </div>
        </div>
      </div>
    </div>
  );
}

//pantalla del invitado
  if (pantalla === "invitado") {
    return (
      <div className="page center-page">
        <div className="card login-card">
          <div className="logo-circle">?</div>

          <h1 className="guest-title">INVITADO</h1>
          <p className="selected-door">
            {puerta.replace("puerta", "Puerta ")} seleccionada
          </p>

          <form className="form" onSubmit={handleInvitadoSubmit}>
            <label>
              Propósito
              <input
                type="text"
                value={proposito}
                onChange={(e) => setProposito(e.target.value)}
                placeholder="Ej. Visita, trámite, reunión"
              />
            </label>

            <label>
              Nombre
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del invitado"
              />
            </label>

            <label>
              Apellido
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Apellido del invitado"
              />
            </label>

            <div className="vehicle-question">
              <span>¿Entra en vehículo?</span>

              <div className="availability-actions">
                <button
                  type="button"
                  className={
                    entraVehiculo === true
                      ? "status-pill yes active"
                      : "status-pill yes"
                  }
                  onClick={() => setEntraVehiculo(true)}
                >
                  Sí
                </button>

                <button
                  type="button"
                  className={
                    entraVehiculo === false
                      ? "status-pill no active"
                      : "status-pill no"
                  }
                  onClick={() => setEntraVehiculo(false)}
                >
                  No
                </button>
              </div>
            </div>

            {entraVehiculo === true && (
              <>
                <label>
                  Placas
                  <input
                    type="text"
                    value={placas}
                    onChange={(e) => setPlacas(e.target.value)}
                    placeholder="Ej. ABC123"
                  />
                </label>

                <label>
                  Marca
                  <input
                    type="text"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Ej. Volkswagen"
                  />
                </label>

                <label>
                  Color
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Plata"
                  />
                </label>
              </>
            )}

            <div className="student-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPantalla("seleccion")}
              >
                Volver
              </button>

              <button type="submit" className="btn">
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  //seleccionarestudiante, trabajador o invitado y seleccionar la puerta
  return (
    <div className="page center-page">
      <div className="card login-card">
         <button
  type="button"
  className="hamburger-btn"
  onClick={() => setMenuAbierto(true)}
>
  ☰
</button>

{menuAbierto && (
  <div className="side-menu-overlay" onClick={() => setMenuAbierto(false)}>
    <aside className="side-menu" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="close-menu-btn"
        onClick={() => setMenuAbierto(false)}
      >
        ✕
      </button>

      <h2>Menú</h2>

      <button
        type="button"
        className="btn menu-action-btn"
        onClick={() => navigate("/bitacora")}
      >
        Consultar bitácora del día
      </button>
       <button
        type="button"
        className="btn menu-action-btn"
        onClick={() => navigate("/registros-activos")}
      >
        Ver registros activos
      </button>
            <button
        type="button"
        className="btn menu-action-btn"
        onClick={() => navigate("/salida")}
      >
        Registrar salida
      </button>
           
    </aside>
  </div>
)}
        <div className="logo-circle">?</div>

        <h1>Favor de seleccionar</h1>

        <div className="role-buttons three-buttons">
          <button
            className={
              tipo === "estudiante"
                ? "btn role-btn active-btn"
                : "btn btn-ghost role-btn"
            }
            onClick={() => setTipo("estudiante")}
          >
            Estudiante
          </button>

          <button
            className={
              tipo === "trabajador"
                ? "btn role-btn active-btn"
                : "btn btn-ghost role-btn"
            }
            onClick={() => setTipo("trabajador")}
          >
            Trabajador
          </button>

          <button
            className={
              tipo === "invitado"
                ? "btn role-btn active-btn"
                : "btn btn-ghost role-btn"
            }
            onClick={seleccionarInvitado}
          >
            Invitado
          </button>
        </div>

        <p className="muted center-text">
          Selecciona la puerta donde te encuentras
        </p>

        <div className="door-buttons">
  {["puerta1", "puerta2", "puerta3", "puerta4"].map((p, index) => {
    const estaLlena = puertasLlenas[p];

    return (
      <button
        key={p}
        type="button"
        className={
          estaLlena
            ? "btn door-full"
            : puerta === p
            ? "btn active-door"
            : "btn btn-ghost"
        }
        onClick={() => {
          if (estaLlena) {
            alert("Puerta sin estacionamiento disponible");
            return;
          }

          setPuerta(p);
        }}
      >
        Puerta {index + 1}
      </button>
    );
  })}
</div>

        <button className="btn continue-selection-btn" onClick={continuarSeleccion}>
          Continuar
        </button>
      </div>
    </div>
  );
}

function Parking({ session, onLogout }) {
  const navigate = useNavigate();

  const [zona, setZona] = useState("");
  const [cajones, setCajones] = useState([]);
  const [disponible, setDisponible] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [cajonApartado, setCajonApartado] = useState(null);

  useEffect(() => {
  if (session.puerta) {
    cargarZona(session.puerta);
  }
}, []);

  async function cargarZona(zonaSeleccionada) {
    try {
      setZona(zonaSeleccionada);
      setSelectedId(null);

      const res = await fetch(`http://localhost:3000/cajones/${zonaSeleccionada}`);
      const data = await res.json();

      setCajones(data);

      const hayDisponible = data.some(
        (c) => c.ocupado === 0 || c.ocupado === false
      );
      setDisponible(hayDisponible);
    } catch (error) {
      console.error(error);
      alert("Error al cargar los cajones");
    }
  }

  async function handleLiberarEspacio() {
  const confirmar = window.confirm(
    "Al seleccionar liberar espacio es porque te retiras del tecnológico. ¿Estás seguro de liberar el espacio?"
  );

  if (!confirmar) return;

  try {
    const res = await fetch("http://localhost:3000/liberar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_cajon: cajonApartado.id,
        usuario: session.user
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Espacio liberado correctamente");
      setCajonApartado(null);
      cargarZona(zona);
    } else {
      alert("No se pudo liberar el espacio");
    }
  } catch (error) {
    console.error(error);
    alert("Error al liberar espacio");
  }
}

  function handleSpotClick(cajon) {
    if (cajon.ocupado === 1 || cajon.ocupado === true) return;
    setSelectedId((current) => (current === cajon.id ? null : cajon.id));
  }

async function handleReserve() {
  if (!selectedId) {
    alert("Selecciona un cajón primero");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/apartar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  id_cajon: selectedId,
  usuario: session.user,
  zona: zona
})
    });

    const data = await res.json();

    if (data.success) {
  const cajon = cajones.find((c) => c.id === selectedId);

await fetch("http://localhost:3000/entradas-dia", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
  tipo: session.tipo,
  clave: session.user,
  puerta: session.puerta,
  proposito: session.proposito || "Entrada con estacionamiento",
  nombre: session.nombre,
  apellido: session.apellido_paterno || "",
  entra_vehiculo: true,
  placas: session.placas || null,
  marca: session.marca_auto || null,
  color: session.color || null,
  id_cajon: cajon.id,
  numero_cajon: cajon.numero
})
});

alert(
  `Permitir acceso.\nSe apartó el cajón ${cajon.numero}.\nSe registró en bitácora.`
);

onLogout();
navigate("/login");
  alert(
    `Permitir acceso.\nSe apartó el cajón ${cajon.numero}.\nSe registró en bitácora.`
  );

  // regresar a pantalla principal
  onLogout();
  navigate("/login");

} else {
  alert("Error al apartar cajón");
}

  } catch (error) {
    console.error(error);
    alert("Error conectando con el servidor");
  }
}

  function handleLogout() {
    onLogout();
    navigate("/login");
  }

  if (cajonApartado) {
  return (
    <div className="page parking-page">
      <header className="topbar">
        <div>
          <h2 className="topbar-title">
            Cajón {cajonApartado.numero} apartado con éxito
          </h2>
          <p className="muted">Usuario: {session.nombre || session.user}</p>
        </div>

        <button className="btn btn-ghost" onClick={handleLogout}>
          Salir
        </button>
      </header>

      <main className="reserved-layout">
        <section className="card info-card">
          <h2>Información</h2>

          <div className="student-info">
            <p><strong>Núm. control:</strong> {session.user}</p>
            <p><strong>Nombre:</strong> {session.nombre}</p>
            <p><strong>Apellido paterno:</strong> {session.apellido_paterno}</p>
            <p><strong>Apellido materno:</strong> {session.apellido_materno}</p>
            <p><strong>Marca auto:</strong> {session.marca_auto}</p>
            <p><strong>Color:</strong> {session.color}</p>
            <p><strong>Placas:</strong> {session.placas}</p>
            <p><strong>Carrera:</strong> {session.carrera}</p>
            <p><strong>Zona:</strong> {cajonApartado.zona}</p>
            <p><strong>Número cajón:</strong> {cajonApartado.numero}</p>
          </div>
        </section>

        <aside className="card release-card">
          <button className="btn release-btn" onClick={handleLiberarEspacio}>
            Liberar espacio
          </button>
        </aside>
      </main>
    </div>
  );
}

  return (
    <div className="page parking-page">
      <header className="topbar">
        <div>
          <h2 className="topbar-title">Consultando disponibilidad</h2>
          <p className="muted">Usuario: {session.nombre || session.user}</p>
        </div>

        <button className="btn btn-ghost" onClick={handleLogout}>
          Salir
        </button>
      </header>

      <main className="layout">
        <section className="card">
  <h1 className="guest-title">INVITADO</h1>

  <p className="selected-door">
    {session.puerta?.replace("puerta", "Puerta ")} seleccionada
  </p>

  <h2>Consultando disponibilidad</h2>
{disponible === false && (
  <p className="full-door-message">
    Esta puerta tiene sus 40 cajones ocupados.
  </p>
)}
          <div className="availability-box">
            <span className="muted">¿Disponible?</span>
            <div className="availability-actions">
              <span className={disponible === true ? "status-pill yes active" : "status-pill yes"}>
                Sí
              </span>
              <span className={disponible === false ? "status-pill no active" : "status-pill no"}>
                No
              </span>
            </div>
          </div>

          <p className="muted">
            Verde = disponible, rojo = ocupado, amarillo = seleccionado
          </p>

          <div className="parking-grid" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
            {cajones.map((cajon) => {
              const isSelected = selectedId === cajon.id;

              let className = "spot free";
              if (cajon.ocupado === 1 || cajon.ocupado === true) className = "spot occupied";
              if (isSelected) className = "spot selected";

              return (
                <button
                  key={cajon.id}
                  className={className}
                  onClick={() => handleSpotClick(cajon)}
                  title={`Cajón ${cajon.numero}`}
                >
                  {cajon.numero}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="card sidebar">
          <h2>Acciones</h2>

          <div className="summary">
            <p>
              <span className="muted">Puerta:</span>{" "}
<strong>{session.puerta?.replace("puerta", "Puerta ")}</strong>
            </p>

            <p>
              <span className="muted">Seleccionado:</span>{" "}
              <strong>
                {selectedId
                  ? `Cajón ${cajones.find((c) => c.id === selectedId)?.numero || selectedId}`
                  : "Ninguno"}
              </strong>
            </p>
          </div>

          <div className="actions">
            <button
  className={disponible === false ? "btn btn-disabled-red" : "btn"}
  onClick={handleReserve}
  disabled={disponible === false}
>
  {disponible === false ? "Puerta llena" : "Apartar"}
</button>
          </div>
        </aside>
      </main>
    </div>
  );
}

//salida
function Salida() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [entrada, setEntrada] = useState(null);

  async function buscarEntrada() {
    if (!busqueda.trim()) {
      alert("Escribe clave, placas o nombre");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/buscar-salida/${busqueda.trim()}`);
      const data = await res.json();

      if (!data.success) {
        alert("No se encontró una entrada activa");
        setEntrada(null);
        return;
      }

      setEntrada(data.entrada);
    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor");
    }
  }

  async function registrarSalida() {
    if (!entrada) return;

    const confirmar = window.confirm(
      "¿Confirmas registrar la salida y liberar el cajón si aplica?"
    );

    if (!confirmar) return;

    try {
      const res = await fetch("http://localhost:3000/registrar-salida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_entrada: entrada.id,
          id_cajon: entrada.id_cajon
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Salida registrada correctamente.");

        setBusqueda("");
        setEntrada(null);
        navigate("/login");
      } else {
        alert("No se pudo registrar la salida");
      }
    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor");
    }
  }

  return (
    <div className="page center-page">
      <div className="card salida-card">
        <h1 className="guest-title">REGISTRAR SALIDA</h1>

        <p className="muted">
          Busca por folio, número de control, número de empleado o placas.
        </p>

        <label>
          Clave o placas
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Ej. INV-000001, 10953 o EG156F"
          />
        </label>

        <div className="student-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/login")}>
            Volver
          </button>

          <button className="btn" onClick={buscarEntrada}>
            Buscar
          </button>
        </div>

        {entrada && (
          <div className="salida-result">
            <h2>Entrada activa encontrada</h2>

            <p><strong>Tipo:</strong> {entrada.tipo}</p>
            <p><strong>Clave:</strong> {entrada.clave}</p>
            <p><strong>Nombre:</strong> {entrada.nombre} {entrada.apellido}</p>
            <p><strong>Puerta:</strong> {entrada.puerta}</p>
            <p><strong>Propósito:</strong> {entrada.proposito}</p>
            <p><strong>Vehículo:</strong> {entrada.entra_vehiculo ? "Sí" : "No"}</p>
            <p><strong>Placas:</strong> {entrada.placas || "-"}</p>
            <p><strong>Marca:</strong> {entrada.marca || "-"}</p>
            <p><strong>Color:</strong> {entrada.color || "-"}</p>
            <p><strong>Cajón:</strong> {entrada.numero_cajon || "Sin cajón"}</p>
            <p><strong>Entrada:</strong> {entrada.fecha_hora}</p>

            <button className="btn release-btn" onClick={registrarSalida}>
              Registrar salida y liberar cajón
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

//bitacora
function Bitacora() {
  const navigate = useNavigate();
  const [entradas, setEntradas] = useState([]);

  useEffect(() => {
    async function cargarBitacora() {
      try {
        const res = await fetch("http://localhost:3000/entradas-dia");
        const data = await res.json();
        setEntradas(data);
      } catch (error) {
        console.error(error);
        alert("Error cargando la bitácora");
      }
    }

    cargarBitacora();
  }, []);

  return (
    <div className="page bitacora-page">
      <header className="topbar">
        <div>
          <h2 className="topbar-title">Bitácora del día</h2>
          <p className="muted">Registros guardados en entradas_del_dia</p>
        </div>

        <button className="btn btn-ghost" onClick={() => navigate("/login")}>
          Volver
        </button>
      </header>

      <main className="bitacora-container">
        <section className="card bitacora-card">
          <h2>Entradas registradas</h2>

          <div className="table-wrapper">
            <table className="bitacora-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Clave</th>
                  <th>Puerta</th>
                  <th>Propósito</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Vehículo</th>
                  <th>Placas</th>
                  <th>Marca</th>
                  <th>Color</th>
                  <th>Fecha/Hora</th>
                </tr>
              </thead>

              <tbody>
                {entradas.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="empty-table">
                      No hay registros todavía
                    </td>
                  </tr>
                ) : (
                  entradas.map((entrada) => (
                    <tr key={entrada.id}>
                      <td>{entrada.id}</td>
                      <td>{entrada.tipo}</td>
                      <td>{entrada.clave || "-"}</td>
                      <td>{entrada.puerta}</td>
                      <td>{entrada.proposito}</td>
                      <td>{entrada.nombre}</td>
                      <td>{entrada.apellido}</td>
                      <td>{entrada.entra_vehiculo ? "Sí" : "No"}</td>
                      <td>{entrada.placas || "-"}</td>
                      <td>{entrada.marca || "-"}</td>
                      <td>{entrada.color || "-"}</td>
                      <td>{entrada.fecha_hora}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

//registros
function RegistrosActivos() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    async function cargarRegistrosActivos() {
      try {
        const res = await fetch("http://localhost:3000/registros-activos");
        const data = await res.json();
        setRegistros(data);
      } catch (error) {
        console.error(error);
        alert("Error cargando registros activos");
      }
    }

    cargarRegistrosActivos();
  }, []);

  return (
    <div className="page bitacora-page">
      <header className="topbar">
        <div>
          <h2 className="topbar-title">Registros activos</h2>
          <p className="muted">Personas que siguen dentro del sistema</p>
        </div>

        <button className="btn btn-ghost" onClick={() => navigate("/login")}>
          Volver
        </button>
      </header>

      <main className="bitacora-container">
        <section className="card bitacora-card">
          <h2>Personas dentro</h2>

          <div className="table-wrapper">
            <table className="bitacora-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Clave</th>
                  <th>Puerta</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Vehículo</th>
                  <th>Placas</th>
                  <th>Cajón</th>
                  <th>Entrada</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="empty-table">
                      No hay personas dentro actualmente
                    </td>
                  </tr>
                ) : (
                  registros.map((registro) => (
                    <tr key={registro.id}>
                      <td>{registro.id}</td>
                      <td>{registro.tipo}</td>
                      <td>{registro.clave || "-"}</td>
                      <td>{registro.puerta}</td>
                      <td>{registro.nombre}</td>
                      <td>{registro.apellido}</td>
                      <td>{registro.entra_vehiculo ? "Sí" : "No"}</td>
                      <td>{registro.placas || "-"}</td>
                      <td>{registro.numero_cajon || "Sin cajón"}</td>
                      <td>{registro.fecha_hora}</td>
                      <td>
                        <span className="estado-activo">
                          {registro.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={session ? "/parking" : "/login"} replace />}
      />
      <Route path="/login" element={<Login onLogin={setSession} />} />
      <Route path="/bitacora" element={<Bitacora />} />
      <Route path="/salida" element={<Salida />} />
      <Route path="/registros-activos" element={<RegistrosActivos />} />
      <Route
        path="/parking"
        element={
          session ? (
            <Parking session={session} onLogout={() => setSession(null)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}