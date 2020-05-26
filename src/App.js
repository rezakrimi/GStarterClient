import React, { useState, useEffect } from 'react';
import './App.css';
import { Container, Col, Row, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { tracing } from '@opencensus/web-instrumentation-zone';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { CollectorExporter } from '@opentelemetry/exporter-collector';
const opentelemetry = require('@opentelemetry/api');



require('dotenv').config()


// Edit this to point to the app to the OpenTelemetry Collector address:
// If running locally use http://localhost:55678/v1/trace
const collectorURL = `http://34.69.255.184:55678/v1/trace`;
// const collectorURL = 'http://35.188.162.236/v1/trace';

const webTracer = new WebTracerProvider({
  plugins: [
    new DocumentLoad(),
  ],
});
const collectorOptions = {
  url: collectorURL,
};
const exporter = new CollectorExporter(collectorOptions);
webTracer.addSpanProcessor(new SimpleSpanProcessor(exporter));



// Minimum required setup for the tracer - supports only synchronous operations
const provider = new WebTracerProvider({
    plugins: [
        new DocumentLoad()
    ]
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

opentelemetry.trace.setGlobalTracerProvider(webTracer);
const tracer = opentelemetry.trace.getTracer('basic');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function App() {
    const [vendors, setVendors] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(document.getElementById("searchbar").value);
        // opentelemetry: starting span to trace the whole process of getting quantity and price for an ingredient
        const searchSpan = tracer.startSpan('Opentelemetry: finding vendors selling the ingredient');

        // opencensus: starting the span to trace time for receiving possible vendors from the supplier server
        const supplierCallSpan = tracing.tracer.startChildSpan({ name: 'Opencensus: retrieving possible vendors from the supplier server' });

        // opentelemetry: starting span
        const supplierSpan = tracer.startSpan('Opentelemetry: retrieving possible vendors from the supplier server', {parent:searchSpan});
        // supplierSpan.setAttribute('key', 'value');
        // supplierSpan.addEvent('invoking work');

        // sending a get request to the supplier server
        axios.get(process.env.REACT_APP_SUPPLIER, {
            params: {
                ingredient: document.getElementById("searchbar").value
            }
        }).then(response => {
            // ending the span for receiving possible vendors from the supplier server
            supplierCallSpan.end();
            supplierSpan.end();
            var res = [];
            var promises = [];
            console.log(response.data);
            // Opencesus: starting the span for tracing the time for receiving the quantity and price from all the possible vendors
            const vendorsCallSpan = tracing.tracer.startChildSpan({ name: 'Opencesus: getting data from vendors'});

            // Opentelemetry: 
            const vendorSpan = tracer.startSpan('Opentelemetry: getting data from vendors', {parent:searchSpan});

            // sending a request to all the possible vendors
            for (var i = 0; i < response.data.length; i++) {
                console.log(process.env.REACT_APP_VENDOR + response.data[i]);
                // pushing into a list to be able to update the page once all the requests are finihsed
                promises.push(axios.get(process.env.REACT_APP_VENDOR + response.data[i], {
                    params: {
                        ingredient: document.getElementById("searchbar").value
                    }
                }).then(response => {
                    console.log("data", response)
                    if (Object.keys(response.data).length > 1) {
                        res.push(response.data);
                    }
                }));
            }
            axios.all(promises).then((results) => {
                // once all the requests in promises list are done, finish the span receiving data from all possible vendors
                vendorsCallSpan.end();
                vendorSpan.end();
                searchSpan.end();
                setVendors(res);
                console.log(res);
            });
        });
        console.log('hi');
    }

    return (
        <Container fluid={true} style={{ backgroundColor: "#ffd300" }}>
            <Form style={{ width: "100%" }} onSubmit={handleSubmit}>
                <Row>
                    <Col xs={10}>
                        <Form.Control id="searchbar" type="text" placeholder="Search for an ingredient i.e. yeast, flour" />
                    </Col>
                    <Col xs={1}>
                        <Button data-ocweb-id='Opencensus: Trace user inTrace user interaction' id="searchBtn" onClick={handleSubmit} type="submit">
                            Search
                        </Button>
                    </Col>
                </Row>
            </Form>
            <Row style={{ paddingTop: "50px" }}>
                {vendors.map((product, index) => <Col xs={4} key={index}>
                    <Card>
                        <Card.Body>
                            <Card.Title>{product.vendor}</Card.Title>
                            <Card.Text>
                                Quantity: {product.quantity}<br />
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
