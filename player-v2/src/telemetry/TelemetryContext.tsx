import React from 'react';
import { TelemetryService } from './TelemetryService';

const TelemetryContext = React.createContext<TelemetryService | null>(null);

export const TelemetryProvider: React.FC<{
  service: TelemetryService;
  children: React.ReactNode;
}> = ({ service, children }) => (
  <TelemetryContext.Provider value={service}>
    {children}
  </TelemetryContext.Provider>
);

export function useTelemetry(): TelemetryService | null {
  return React.useContext(TelemetryContext);
}
