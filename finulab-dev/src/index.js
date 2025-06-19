import App from "./App";
import * as ReactDOMClient from "react-dom/client";

import {HelmetProvider} from 'react-helmet-async';

import {Provider} from 'react-redux';
import store, {persistor} from './reduxStore/store';
import {PersistGate} from 'redux-persist/integration/react';

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);
root.render(
    <HelmetProvider>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </HelmetProvider>
);
