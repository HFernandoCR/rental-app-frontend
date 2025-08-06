import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';

function BookingListPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchBookings(userData);
    } else {
      setLoading(false);
      setError('Debes iniciar sesión para ver tus reservas.');
    }
  }, []);

  const fetchBookings = async (userData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = userData.user_type === 'tenant' 
        ? `http://localhost:5000/bookings/tenant/${userData.id}`
        : `http://localhost:5000/bookings/property/${userData.id}`; // This would need to be modified for owners

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } );
      const data = await response.json();

      if (response.ok) {
        setBookings(data);
        setError('');
      } else {
        setError(data.message || 'Error al cargar las reservas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus } ),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the booking in the local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ));
      } else {
        setError(data.message || 'Error al actualizar la reserva');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pendiente' },
      approved: { variant: 'success', text: 'Aprobada' },
      rejected: { variant: 'danger', text: 'Rechazada' },
      cancelled: { variant: 'secondary', text: 'Cancelada' },
      completed: { variant: 'primary', text: 'Completada' }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center">
          <p>Cargando reservas...</p>
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
          Debes iniciar sesión para ver tus reservas.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">
        {user.user_type === 'tenant' ? 'Mis Reservas' : 'Reservas de Mis Propiedades'}
      </h2>

      {bookings.length === 0 && (
        <Alert variant="info">
          {user.user_type === 'tenant' 
            ? 'Aún no has hecho ninguna reserva.' 
            : 'Aún no tienes reservas en tus propiedades.'
          }
        </Alert>
      )}

      <Row>
        {bookings.map((booking) => (
          <Col md={6} lg={4} key={booking.id} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="mb-0">Reserva #{booking.id.slice(-8)}</Card.Title>
                  {getStatusBadge(booking.status)}
                </div>
                
                <Card.Text>
                  <strong>Check-in:</strong> {formatDate(booking.check_in_date)}  

                  <strong>Check-out:</strong> {formatDate(booking.check_out_date)}  

                  <strong>Huéspedes:</strong> {booking.num_guests}  

                  <strong>Total:</strong> {formatPrice(booking.total_price, booking.currency)}
                </Card.Text>

                {user.user_type === 'owner' && booking.status === 'pending' && (
                  <div className="d-grid gap-2">
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'approved')}
                    >
                      Aprobar
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'rejected')}
                    >
                      Rechazar
                    </Button>
                  </div>
                )}

                {user.user_type === 'tenant' && booking.status === 'pending' && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                  >
                    Cancelar Reserva
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default BookingListPage;
