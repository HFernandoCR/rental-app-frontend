import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    check_in_date: '',
    check_out_date: '',
    num_guests: 1
  });
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingMessageType, setBookingMessageType] = useState('');

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/properties/${id}` );
      const data = await response.json();

      if (response.ok) {
        setProperty(data);
        setError('');
      } else {
        setError(data.message || 'Error al cargar la propiedad');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotalPrice = () => {
    if (!bookingData.check_in_date || !bookingData.check_out_date || !property) {
      return 0;
    }

    const checkIn = new Date(bookingData.check_in_date);
    const checkOut = new Date(bookingData.check_out_date);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff > 0 ? daysDiff * property.base_price : 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage('');
    setBookingMessageType('');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setBookingMessage('Debes iniciar sesión para hacer una reserva.');
      setBookingMessageType('danger');
      return;
    }

    if (user.user_type !== 'tenant') {
      setBookingMessage('Solo los inquilinos pueden hacer reservas.');
      setBookingMessageType('danger');
      return;
    }

    const totalPrice = calculateTotalPrice();
    if (totalPrice <= 0) {
      setBookingMessage('Por favor, selecciona fechas válidas.');
      setBookingMessageType('danger');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token' )}`
        },
        body: JSON.stringify({
          property_id: property.id,
          tenant_id: user.id,
          check_in_date: bookingData.check_in_date,
          check_out_date: bookingData.check_out_date,
          num_guests: parseInt(bookingData.num_guests),
          total_price: totalPrice,
          currency: property.currency
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingMessage('¡Solicitud de reserva enviada exitosamente! El propietario la revisará pronto.');
        setBookingMessageType('success');
        setBookingData({
          check_in_date: '',
          check_out_date: '',
          num_guests: 1
        });
      } else {
        setBookingMessage(data.message || 'Error al crear la reserva');
        setBookingMessageType('danger');
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setBookingMessage('Error de conexión');
      setBookingMessageType('danger');
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
          <p>Cargando propiedad...</p>
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

  if (!property) {
    return (
      <Container>
        <Alert variant="warning">Propiedad no encontrada.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title as="h1">{property.title}</Card.Title>
              <Card.Subtitle className="mb-3 text-muted">
                {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)} en {property.city}, {property.state && `${property.state}, `}{property.country}
              </Card.Subtitle>
              
              <div className="mb-3">
                <Badge bg="primary" className="me-2">
                  Huéspedes: {property.max_guests}
                </Badge>
                {property.num_bedrooms && (
                  <Badge bg="secondary" className="me-2">
                    Habitaciones: {property.num_bedrooms}
                  </Badge>
                )}
                {property.num_bathrooms && (
                  <Badge bg="secondary" className="me-2">
                    Baños: {property.num_bathrooms}
                  </Badge>
                )}
                <Badge bg="success">
                  {formatPrice(property.base_price, property.currency)} / noche
                </Badge>
              </div>

              <Card.Text>
                {property.description}
              </Card.Text>

              <div className="mb-3">
                <h5>Dirección</h5>
                <p className="text-muted">
                  {property.address}  

                  {property.city}, {property.state && `${property.state}, `}{property.country} {property.zip_code}
                </p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-3">
                  <h5>Amenidades</h5>
                  <div className="d-flex flex-wrap">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity} bg="light" text="dark" className="me-2 mb-2">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top">
            <Card.Header>
              <h5 className="mb-0">Hacer una Reserva</h5>
            </Card.Header>
            <Card.Body>
              {bookingMessage && (
                <Alert variant={bookingMessageType}>{bookingMessage}</Alert>
              )}
              
              <Form onSubmit={handleBookingSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Check-in</Form.Label>
                  <Form.Control
                    type="date"
                    name="check_in_date"
                    value={bookingData.check_in_date}
                    onChange={handleBookingChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Check-out</Form.Label>
                  <Form.Control
                    type="date"
                    name="check_out_date"
                    value={bookingData.check_out_date}
                    onChange={handleBookingChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Número de Huéspedes</Form.Label>
                  <Form.Control
                    type="number"
                    name="num_guests"
                    value={bookingData.num_guests}
                    onChange={handleBookingChange}
                    min="1"
                    max={property.max_guests}
                    required
                  />
                  <Form.Text className="text-muted">
                    Máximo: {property.max_guests} huéspedes
                  </Form.Text>
                </Form.Group>

                {calculateTotalPrice() > 0 && (
                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between">
                      <span>Precio total:</span>
                      <strong>{formatPrice(calculateTotalPrice(), property.currency)}</strong>
                    </div>
                    <small className="text-muted">
                      {Math.ceil((new Date(bookingData.check_out_date) - new Date(bookingData.check_in_date)) / (1000 * 3600 * 24))} noches
                    </small>
                  </div>
                )}

                <Button variant="primary" type="submit" className="w-100">
                  Solicitar Reserva
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PropertyDetailPage;
