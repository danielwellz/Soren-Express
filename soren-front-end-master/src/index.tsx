import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { ToastProvider } from './context/ToastContext';
import './i18n';
import { createApolloClient } from './lib/apolloClient';
import './index.css';

const client = createApolloClient();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <LocaleProvider>
        <ThemeModeProvider>
          <ToastProvider>
            <BrowserRouter>
              <AuthProvider>
                <App />
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ThemeModeProvider>
      </LocaleProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
