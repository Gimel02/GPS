import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [view, setView] = useState("select");
  const [controlNumber, setControlNumber] = useState("");
  const [password, setPassword] = useState("");

  async function handleStudentLogin(e) {
    e.preventDefault();

    if (!controlNumber.trim() || !password.trim()) {
      alert("Escribe número de control y contraseña");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          numero_control: controlNumber,
          password: password
        })
      });

      const data = await res.json();

      if (data.success) {
        onLogin({
          user: data.user.numero_control,
          nombre: data.user.nombre
        });

        navigate("/parking");
      } else {
        alert("Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor");
    }
  }

  function handleExit() {
    setView("select");
    setControlNumber("");
    setPassword("");
  }

  return (
    <div className="page center-page">
      <div className="card login-card">
        <div className="logo-circle">?</div>

        {view === "select" && (
          <>
            <h1>Favor de loggearse</h1>

            <div className="role-buttons">
              <button className="btn role-btn" onClick={() => setView("student")}>
                Estudiante
              </button>

              <button className="btn btn-ghost role-btn">
                Invitado
              </button>
            </div>

            <div className="bottom-actions">
              <button className="btn btn-ghost small-btn" onClick={handleExit}>
                Salir
              </button>
            </div>
          </>
        )}

        {view === "student" && (
          <>
            <h1>Favor de loggearse</h1>

            <form className="form" onSubmit={handleStudentLogin}>
              <label>
                Núm. control
                <input
                  type="text"
                  value={controlNumber}
                  onChange={(e) => setControlNumber(e.target.value)}
                  placeholder="Ej. 22131234"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                />
              </label>

              <div className="qr-block">
                <p className="muted">Opción para escanear código QR</p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => alert("Aquí irá el escaneo QR más adelante")}
                >
                  Escanear QR
                </button>
              </div>

              <div className="student-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setView("select")}
                >
                  Volver
                </button>

                <button type="submit" className="btn">
                  Entrar
                </button>
              </div>
            </form>

            <div className="bottom-actions">
              <button className="btn btn-ghost small-btn" onClick={handleExit}>
                Salir
              </button>
            </div>
          </>
        )}
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
        usuario: session.user
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Cajón apartado correctamente");

      // recargar zona para ver cambios
      cargarZona(zona);
    } else {
      alert("Ese cajón ya fue ocupado");
    }

  } catch (error) {
    console.error(error);
    alert("Error al apartar");
  }
}

  function handleLogout() {
    onLogout();
    navigate("/login");
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
          <h2>Zonas</h2>

          <div className="zone-buttons">
            <button className="btn btn-ghost" onClick={() => cargarZona("puerta1")}>
              Puerta 1
            </button>
            <button className="btn btn-ghost" onClick={() => cargarZona("puerta2")}>
              Puerta 2
            </button>
            <button className="btn btn-ghost" onClick={() => cargarZona("puerta3")}>
              Puerta 3
            </button>
          </div>

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

          <div className="parking-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
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
              <span className="muted">Zona:</span> <strong>{zona || "Ninguna"}</strong>
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