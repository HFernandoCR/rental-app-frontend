import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';

function AddPropertyPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'house',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    latitude: '',
    longitude: '',
    num_bedrooms: '',
    num_bathrooms: '',
    max_guests: '',
    base_price: '',
    currency: 'USD',
    amenities: [],
    status: 'active'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const propertyTypes = ['house', 'apartment', 'room', 'condo', 'villa'];
  const amenitiesOptions = ['WiFi', 'Air Conditioning', 'Pool', 'Parking', 'Kitchen', 'TV', 'Washer', 'Dryer'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAmenitiesChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const newAmenities = checked
        ? [...prevData.amenities, value]
        : prevData.amenities.filter((amenity) => amenity !== value);
      return { ...prevData, amenities: newAmenities };
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/images/upload', {
        method: 'POST',
        body: formData,
      } );
      const data = await response.json();
      if (response.ok) {
        return data.url;
      } else {
        throw new Error(data.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.user_type !== 'owner') {
      setMessage('Debes ser propietario para publicar una propiedad.');
      setMessageType('danger');
      return;
    }

    try {
      // Upload images first
      const imageUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }

      const propertyData = {
        ...formData,
        owner_id: user.id,
        amenities: formData.amenities, // Ensure amenities is an array
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        num_bedrooms: formData.num_bedrooms ? parseInt(formData.num_bedrooms) : null,
        num_bathrooms: formData.num_bathrooms ? parseFloat(formData.num_bathrooms) : null,
        max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
        base_price: formData.base_price ? parseFloat(formData.base_price) : null,
      };

      const response = await fetch('http://localhost:5000/properties/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token' )}`
        },
        body: JSON.stringify(propertyData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Propiedad publicada exitosamente!');
        setMessageType('success');
        // Optionally, reset form or redirect
        setFormData({
          title: '', description: '', property_type: 'house', address: '', city: '',
          state: '', country: '', zip_code: '', latitude: '', longitude: '',
          num_bedrooms: '', num_bathrooms: '', max_guests: '', base_price: '',
          currency: 'USD', amenities: [], status: 'active'
        });
        setSelectedFiles([]);
      } else {
        setMessage(data.message || 'Error al publicar la propiedad.');
        setMessageType('danger');
      }
    } catch (error) {
      setMessage(`Error: ${error.message || 'Error de conexión.'}`);
      setMessageType('danger');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="my-4">
            <Card.Header>
              <h2 className="text-center">Publicar Nueva Propiedad</h2>
            </Card.Header>
            <Card.Body>
              {message && <Alert variant={messageType}>{message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Título de la Propiedad</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Propiedad</Form.Label>
                  <Form.Select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    required
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ciudad</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado/Provincia</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>País</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Código Postal</Form.Label>
                      <Form.Control
                        type="text"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Habitaciones</Form.Label>
                      <Form.Control
                        type="number"
                        name="num_bedrooms"
                        value={formData.num_bedrooms}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Baños</Form.Label>
                      <Form.Control
                        type="number"
                        name="num_bathrooms"
                        value={formData.num_bathrooms}
                        onChange={handleChange}
                        step="0.5"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Máximo de Huéspedes</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_guests"
                        value={formData.max_guests}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio Base</Form.Label>
                      <Form.Control
                        type="number"
                        name="base_price"
                        value={formData.base_price}
                        onChange={handleChange}
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Moneda</Form.Label>
                      <Form.Control
                        type="text"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Amenidades</Form.Label>
                  <div className="d-flex flex-wrap">
                    {amenitiesOptions.map((amenity) => (
                      <Form.Check
                        key={amenity}
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        label={amenity}
                        value={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={handleAmenitiesChange}
                        className="me-3 mb-2"
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group controlId="formFileMultiple" className="mb-3">
                  <Form.Label>Imágenes de la Propiedad</Form.Label>
                  <Form.Control type="file" multiple onChange={handleFileChange} />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Publicar Propiedad
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AddPropertyPage;
