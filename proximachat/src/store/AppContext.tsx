/**
 * AppContext - Provides app store to the component tree
 */
import React, {createContext, useContext} from 'react';
import {useAppStore} from './useAppStore';

export const AppStoreProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  // Zustand store is globally available, no Provider needed.
  // This component handles initialization side effects if needed.
  return <>{children}</>;
};

export {useAppStore};
