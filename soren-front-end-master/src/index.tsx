import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { LocaleProvider } from './context/LocaleContext';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
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
                <WishlistProvider>
                  <CompareProvider>
                    <AnalyticsProvider>
                      <App />
                    </AnalyticsProvider>
                  </CompareProvider>
                </WishlistProvider>
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ThemeModeProvider>
      </LocaleProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
