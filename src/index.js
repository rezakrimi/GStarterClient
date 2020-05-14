import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { startTracing } from '@opencensus/web-instrumentation-zone';
require('dotenv').config()

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

console.log('oc agent', process.env.REACT_APP_OC_AGENT);
window.ocAgent = process.env.REACT_APP_OC_AGENT;
// For the purpose of this example, send trace header to all hosts.
window.ocTraceHeaderHostRegex = /.*/;
window.ocSampleRate = 1.0; // Sample at 100% for test only. Default is 1/10000.

startTracing();