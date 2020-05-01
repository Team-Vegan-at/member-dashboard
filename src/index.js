import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import 'primereact/resources/themes/rhea/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import * as serviceWorker from './serviceWorker';
import { Dashboard } from './components/Dashboard';

ReactDOM.render(
  <React.StrictMode>
    {/* <App /> */}
    <Dashboard />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
