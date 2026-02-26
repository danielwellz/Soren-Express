import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AnalyticsProvider } from '../context/AnalyticsContext';
import { AuthProvider } from '../context/AuthContext';
import { CompareProvider } from '../context/CompareContext';
import { LocaleProvider } from '../context/LocaleContext';
import { ThemeModeProvider } from '../context/ThemeModeContext';
import { ToastProvider } from '../context/ToastContext';
import { WishlistProvider } from '../context/WishlistContext';

type RenderWithProvidersOptions = {
  route?: string;
  path?: string;
  mocks?: ReadonlyArray<MockedResponse>;
  withAuthProvider?: boolean;
};

export function renderWithProviders(
  ui: React.ReactElement,
  {
    route = '/',
    path,
    mocks = [],
    withAuthProvider: _withAuthProvider = true,
  }: RenderWithProvidersOptions = {},
) {
  const content = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  );

  const wrapped = (
    <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
      <LocaleProvider>
        <ThemeModeProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={[route]}>
              <AuthProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <AnalyticsProvider>{content}</AnalyticsProvider>
                  </CompareProvider>
                </WishlistProvider>
              </AuthProvider>
            </MemoryRouter>
          </ToastProvider>
        </ThemeModeProvider>
      </LocaleProvider>
    </MockedProvider>
  );

  return render(wrapped);
}
