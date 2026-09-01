import React from 'react';
import type { PluginDefinition } from './plugin.interface';

export class PluginRegistry {
  private map = new Map<string, PluginDefinition>();

  register(def: PluginDefinition): void {
    def.mimeTypes.forEach(mt => {
      this.map.set(mt.toLowerCase(), def);
    });
  }

  resolve(mimeType: string): PluginDefinition | undefined {
    return this.map.get(mimeType.toLowerCase());
  }

  get registeredTypes(): string[] {
    return Array.from(this.map.keys());
  }
}

export const defaultRegistry = new PluginRegistry();

export const PluginRegistryContext = React.createContext<PluginRegistry>(defaultRegistry);

export function usePluginRegistry(): PluginRegistry {
  return React.useContext(PluginRegistryContext);
}
