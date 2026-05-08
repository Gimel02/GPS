import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [tipo, setTipo] = useState("");
  const [puerta, setPuerta] = useState("");
  const [pantalla, setPantalla] = useState("seleccion");

  const [proposito, setProposito] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [entraVehiculo, setEntraVehiculo] = useState(null);

  const [numeroEmpleado, setNumeroEmpleado] = useState("");
const [buscaEstacionamiento, setBuscaEstacionamiento] = useState(null);

  const [numeroControl, setNumeroControl]= useState("");
  const [buscaEstudianteEst, setBuscaEstudianteEst] = useState(null);

  const [placas, setPlacas] = useState("");
  const [marca, setMarca] = useState("");
  const [color, setColor] = useState("");

  function seleccionarInvitado() {
    setTipo("invitado");
  }

  function continuarSeleccion() {
   if (!tipo) {
    alert("Selecciona Estudiante, Trabajador o Invitado");
    return;
  }

  if (!puerta) {
    alert("Selecciona la puerta donde te encuentras");
    return;
  }

  if (tipo === "invitado") {
    setPantalla("invitado");
  } else if (tipo === "trabajador") {
    setPantalla("trabajador");
  } else if(tipo === "estudiante"){
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

      onLogin({
        user: `INV-${Date.now()}`,
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

      navigate("/parking");
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
  clave: `INV-${Date.now()}`,
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
  //Pantalla de estudiante
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
                  buscaEstudianteEst === true
                    ? "status-pill yes active"
                    : "status-pill yes"
                }
                onClick={() => setBuscaEstudianteEst(true)}
              >
                Sí
              </button>

              <button
                type="button"
                className={
                  buscaEstudianteEst === false
                    ? "status-pill no active"
                    : "status-pill no"
                }
                onClick={() => setBuscaEstudianteEst(false)}
              >
                No
              </button>
            </div>
          </div>

          <label>
            Número de control
            <input
              type="text"
              value={numeroControl}
              onChange={(e) => setNumeroControl(e.target.value)}
              placeholder="Ej. 22100000"
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
              onClick={async () => {

                if (!numeroControl.trim()) {
                  alert("Ingresa número de control");
                  return;
                }

                if (buscaEstudianteEst === null) {
                  alert("Selecciona si busca estacionamiento");
                  return;
                }

                try {

                  const resEstudiante = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      numero_control: numeroControl
                      
                    })
                  });

                  const dataEstudiante = await resEstudiante.json();

                  if (!dataEstudiante.success) {
                    alert("Número de control no registrado");
                    return;
                  }

                  const estudiante = dataEstudiante.user;

                  if (buscaEstudianteEst === true) {

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
                      entra_vehiculo: false
                    })
                  });

                  const data = await res.json();

                  if (data.success) {

                    alert("Acceso permitido. Registrado en bitácora.");

                    setNumeroControl("");
                    setBuscaEstudianteEst(null);
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

              }}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
  

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
            <div style={{
              width: "200px",
              height: "120px",
              border: "2px dashed #555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              borderRadius: "10px"
            }}>
              📷 Escanear QR
            </div>
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
              onClick={async () => {
                if (!numeroEmpleado.trim()) {
                  alert("Ingresa número de empleado");
                  return;
                }

                if (buscaEstacionamiento === null) {
                  alert("Selecciona si busca estacionamiento");
                  return;
                }

               
    const resTrabajador = await fetch("http://localhost:3000/trabajador", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        numero_empleado: numeroEmpleado
      })
    });

    const dataTrabajador = await resTrabajador.json();

    if (!dataTrabajador.success) {
      alert("Número de empleado no registrado");
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

      navigate("/parking");
      return;
    }

    try {
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
  entra_vehiculo: false
})
      });

      const data = await res.json();

      if (data.success) {
        alert("Acceso permitido. Registrado en bitácora.");

        // reset
        setNumeroEmpleado("");
        setBuscaEstacionamiento(null);
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
  }}
>
  Continuar

                
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div className="page center-page">
      <div className="card login-card">
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
          {["puerta1", "puerta2", "puerta3", "puerta4"].map((p, index) => (
            <button
              key={p}
              className={puerta === p ? "btn active-btn" : "btn btn-ghost"}
              onClick={() => setPuerta(p)}
            >
              Puerta {index + 1}
            </button>
          ))}
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
    clave: session.user
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
            <button className="btn" onClick={handleReserve}>
              Apartar
            </button>
          </div>
        </aside>
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