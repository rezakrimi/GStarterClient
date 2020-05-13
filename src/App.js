import React, { useState, useEffect } from 'react';
import './App.css';
import { Container, Col, Row, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';


require('dotenv').config()

function App() {
    const [vendors, setVendors] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        var res = [];
        var promises = [];
        console.log(suppliers);
        for (var i = 0; i < suppliers.length; i++) {
            console.log(process.env.REACT_APP_VENDOR + suppliers[i]);
            promises.push(axios.get(process.env.REACT_APP_VENDOR + suppliers[i], {
                params: {
                    ingredient: document.getElementById("searchbar").value
                }
            }).then(response => {
                console.log("data", response)
                if (Object.keys(response.data).length > 1){
                    res.push(response.data);
                }
            }));
        }
        axios.all(promises).then((results) => {
            setVendors(res);
            console.log(res);
        });
    }, [suppliers]);

    const handleSubmit = (event) => {
        event.preventDefault()
        console.log(document.getElementById("searchbar").value)
        axios.get(process.env.REACT_APP_SUPPLIER, {
            params: {
                ingredient: document.getElementById("searchbar").value
            }
        }).then(response => {
            setSuppliers(response.data);
        });
    }

    return (
        <Container fluid={true} style={{ backgroundColor: "#ffd300" }}>
            <Form style={{ width: "100%" }} onSubmit={handleSubmit}>
                <Row>
                    <Col xs={10}>
                        <Form.Control id="searchbar" type="text" placeholder="Search for an ingredient i.e. yeast, flour" />
                    </Col>
                    <Col xs={1}>
                        <Button variant="primary" type="submit">
                            Search
                        </Button>
                    </Col>
                </Row>
            </Form>
            <Row style={{ paddingTop: "50px" }}>
                {vendors.map((product, index) => <Col xs={4}  key={index}>
                    <Card>
                        <Card.Body>
                            <Card.Title>{product.vendor}</Card.Title>
                            <Card.Text>
                                Quantity: {product.quantity}<br/>
                                Price: {product.price}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>)}
            </Row>
        </Container>
    );
}

export default App;
