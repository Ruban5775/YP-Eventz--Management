import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  WebsiteSettings,
  loadWebsiteSettings,
} from "@/data/settings";

type SettingsContextType = {
  settings: WebsiteSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      setLoading(true);

      const data = await loadWebsiteSettings();

      setSettings(data);
    } catch (error) {
      console.error("Unable to load website settings.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}