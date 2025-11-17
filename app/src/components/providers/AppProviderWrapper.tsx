'use client';

import { AppProvider } from '../../context/AppContext';
import { StoreProvider } from '../../../redux/StoreProvider';

export default function AppProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <AppProvider>{children}</AppProvider>
    </StoreProvider>
  );
}

