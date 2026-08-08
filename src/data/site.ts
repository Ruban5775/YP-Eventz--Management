const API_BASE = import.meta.env.VITE_API_BASE;

/*Event Work Data from DB */
export interface WorkMedia {

    id: number;

    media_type: "image" | "video";

    media_url: string;

}

export interface WorkItem {

    id: number;

    title: string;

    category: string;

    event_date: string;

    cover_image_url: string;

}

export async function loadWork(): Promise<WorkItem[]> {

    const response = await fetch(
        `${API_BASE}/admin/get_work.php`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {

        throw new Error(
            "Unable to load events."
        );

    }

    const result = await response.json();

    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to load events."
        );

    }

    return result.data;

}

export async function loadEventMedia(
    eventId: number
): Promise<WorkMedia[]> {

    const response = await fetch(
        `${API_BASE}/admin/get_event_media.php?event_id=${eventId}`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {

        throw new Error(
            "Unable to load event media."
        );

    }

    const result = await response.json();

    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to load event media."
        );

    }

    return result.data;

}

/*Services Form db */
export interface EventService {
  id: number;
  title: string;
}

export async function loadEventServices(): Promise<EventService[]> {
  const response = await fetch(
    `${API_BASE}/admin/get_public_services.php`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load services.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}


/*for Dashboard datas*/

export interface DashboardLead {
  id: number;
  name: string;
  type: string;
  date: string;
  status: string;
}

export interface DashboardStats {
  total_leads: number;
  total_events: number;
  total_services: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_leads: DashboardLead[];
}

export async function loadDashboard(): Promise<DashboardData> {
  const response = await fetch(
    `${API_BASE}/admin/get_dashboard.php`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load dashboard.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Unable to load dashboard."
    );
  }

  return result.data;
}


/* Testimonials From DB */

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  date: string;
  rating: number;
  review: string;
}

export async function loadTestimonials(): Promise<Testimonial[]> {
  const response = await fetch(
    `${API_BASE}/admin/get_reviews.php`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load testimonials.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Unable to load testimonials."
    );
  }

  return result.data || [];
}