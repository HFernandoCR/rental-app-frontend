import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function MyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.user_type === 'owner') {
      setUser(userData);
      fetchMyProperties(userData.id);
    } else {
      setLoading(false);
      setError('Debes iniciar sesión como propietario para ver tus propiedades.');
    }
  }, []);

  const fetchMyProperties = async (ownerId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/properties/owner/${ownerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } );
      const data = await response.json();

      if (response.ok) {
        setProperties(data);
        setError('');
      } else {
        setError(data.message || 'Error al cargar tus propiedades');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center">
          <p>Cargando tus propiedades...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Alert variant="warning">
          Debes iniciar sesión como propietario para ver tus propiedades.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Mis Propiedades Publicadas</h2>
      <Link to="/add-property" className="btn btn-primary mb-3">
        Publicar Nueva Propiedad
      </Link>

      {properties.length === 0 && (
        <Alert variant="info">
          Aún no has publicado ninguna propiedad. ¡Anímate a publicar la primera!
        </Alert>
      )}

      <Row>
        {properties.map((property) => (
          <Col md={6} lg={4} key={property.id} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{property.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)} en {property.city}, {property.country}
                </Card.Subtitle>
                <Card.Text>
                  {property.description && property.description.length > 100
                    ? `${property.description.substring(0, 100)}...`
                    : property.description
                  }
                </Card.Text>
                <div className="mb-2">
                  <small className="text-muted">
                    <strong>Huéspedes:</strong> {property.max_guests} | 
                    {property.num_bedrooms && ` Habitaciones: ${property.num_bedrooms} |`}
                    {property.num_bathrooms && ` Baños: ${property.num_bathrooms}`}
                  </small>
                </div>
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Amenidades:</strong> {property.amenities.slice(0, 3).join(', ')}
                      {property.amenities.length > 3 && '...'}
                    </small>
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="text-primary">
                    {formatPrice(property.base_price, property.currency)} / noche
                  </strong>
                  <Button 
                    as={Link} 
                    to={`/properties/${property.id}`} 
                    variant="outline-primary"
                    size="sm"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default MyPropertiesPage;
