
import { useState, useEffect } from 'react';

export interface VatConfig {
  enabled: boolean;
  rate: number;
}

const DEFAULT_CONFIG: VatConfig = {
  enabled: true,
  rate: 13
};

export const useVat = () => {
  const [config, setConfig] = useState<VatConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const loadConfig = () => {
      try {
        const stored = localStorage.getItem('nepnola_vat_config');
        if (stored) {
          setConfig(JSON.parse(stored));
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      } catch (e) {
        setConfig(DEFAULT_CONFIG);
      }
    };

    loadConfig();

    const handleStorageChange = () => loadConfig();
    
    // Listen for custom event for same-tab updates
    window.addEventListener('vat_updated', handleStorageChange);
    // Listen for storage event for cross-tab updates
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('vat_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateConfig = (newConfig: VatConfig) => {
    setConfig(newConfig);
    localStorage.setItem('nepnola_vat_config', JSON.stringify(newConfig));
    // Dispatch custom event to notify other components in the same window
    window.dispatchEvent(new Event('vat_updated'));
  };

  return { config, updateConfig };
};
