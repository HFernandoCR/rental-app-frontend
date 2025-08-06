import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function HomePage() {
  return (
    <Container className="text-center my-5">
      <Row>
        <Col>
          <h1>Bienvenido a Rental App</h1>
          <p className="lead">Encuentra tu lugar ideal para rentar o publica tu propiedad.</p>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Encuentra tu Propiedad</Card.Title>
              <Card.Text>
                Explora una amplia variedad de casas, apartamentos y habitaciones disponibles para renta por día, mes o año.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Publica tu Propiedad</Card.Title>
              <Card.Text>
                ¿Tienes una propiedad para rentar? Publica fácilmente y llega a miles de inquilinos potenciales.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;