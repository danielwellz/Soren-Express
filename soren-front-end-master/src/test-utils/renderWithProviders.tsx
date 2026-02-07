import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LocaleProvider } from '../context/LocaleContext';
import { ThemeModeProvider } from '../context/ThemeModeContext';
import { ToastProvider } from '../context/ToastContext';

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
    withAuthProvider = false,
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
    <MockedProvider mocks={mocks}>
      <LocaleProvider>
        <ThemeModeProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={[route]}>
              {withAuthProvider ? <AuthProvider>{content}</AuthProvider> : content}
            </MemoryRouter>
          </ToastProvider>
        </ThemeModeProvider>
      </LocaleProvider>
    </MockedProvider>
  );

  return render(wrapped);
}
