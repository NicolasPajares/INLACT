* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

/* HEADER */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.logo {
  height: 42px;
}

.user-name {
  font-weight: 600;
  color: #444;
}

/* LAYOUT */
.layout {
  display: flex;
  min-height: calc(100vh - 70px);
}

/* SIDEBAR */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #4aa3df, #2e7fc2);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu {
  padding: 20px;
}

.menu a {
  display: block;
  padding: 14px;
  margin-bottom: 10px;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
}

.menu a:hover {
  background: rgba(255,255,255,0.25);
}

.sidebar-footer {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  opacity: 0.9;
}

/* CONTENIDO */
.contenido {
  flex: 1;
  padding: 40px;
  background: #f7f7f7;
}

.encabezado-ensayo {
  text-align: center;
  margin-bottom: 80px;
}

.encabezado-ensayo h1 {
  font-size: 36px;
  color: #2e7fc2;
}

.encabezado-ensayo p {
  margin: 10px 0;
  color: #666;
}

.encabezado-ensayo h2 {
  margin-top: 20px;
  font-size: 26px;
  color: #2e7fc2;
}

/* SECCIONES */
.seccion {
  min-height: 85vh;
  padding: 60px 40px;
  margin-bottom: 80px;
  background: #ffffff;
  border-radius: 6px;
  border-top: 1px solid #eaeaea;
}

.seccion h2 {
  margin-bottom: 30px;
  font-size: 26px;
}

.oculto {
  display: none;
}

/* RESPONSIVE → MISMO DISEÑO */
@media (max-width: 768px) {
  .layout {
    flex-direction: row;
  }

  .sidebar {
    width: 220px;
  }

  .contenido {
    padding: 20px;
  }
}
