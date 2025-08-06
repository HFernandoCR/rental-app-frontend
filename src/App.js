import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import PropertyListPage from './pages/PropertyListPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AddPropertyPage from './pages/AddPropertyPage';
import MyPropertiesPage from './pages/MyPropertiesPage';
import BookingListPage from './pages/BookingListPage';

function App() {
  return (
    <Router>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Rental App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Inicio</Nav.Link>
              <Nav.Link as={Link} to="/properties">Propiedades</Nav.Link>
              <Nav.Link as={Link} to="/add-property">Publicar Propiedad</Nav.Link>
              <Nav.Link as={Link} to="/my-properties">Mis Propiedades</Nav.Link>
              <Nav.Link as={Link} to="/bookings">Mis Reservas</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
              <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
              <Nav.Link as={Link} to="/profile">Perfil</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/properties" element={<PropertyListPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/add-property" element={<AddPropertyPage />} />
          <Route path="/my-properties" element={<MyPropertiesPage />} />
          <Route path="/bookings" element={<BookingListPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
