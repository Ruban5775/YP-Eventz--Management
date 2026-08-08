export interface WebsiteSettings {
  id: number;

  company_name: string;

  phone: string;

  whatsapp: string;

  email: string;

  business_hours: string;

  address: string;

  map_embed: string;

  facebook: string;

  instagram: string;

  youtube: string;

  linkedin: string;

  logo: string;
}

const API_BASE = import.meta.env.VITE_API_BASE;

export async function loadWebsiteSettings(): Promise<WebsiteSettings> {
  const response = await fetch(
    `${API_BASE}/admin/get_settings.php`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to connect to server.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data as WebsiteSettings;
}