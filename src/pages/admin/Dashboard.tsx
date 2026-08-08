import { motion } from "framer-motion";
import {
  FiCalendar,
  FiEdit3,
  FiUsers,
} from "react-icons/fi";
import { useEffect, useState } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Card,
  StatusPill,
  Table,
} from "@/components/admin/ui";

import {
  loadDashboard,
  DashboardData,
} from "@/data/site";

export default function Dashboard() {

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | Load Dashboard
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    fetchDashboard();

  }, []);


  const fetchDashboard = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await loadDashboard();

      setDashboard(data);

    } catch (error) {

      console.error(
        "Dashboard loading error:",
        error
      );

      setError(
        "Unable to load dashboard data."
      );

    } finally {

      setLoading(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (
      <AdminLayout title="Dashboard">

        <div className="rounded-2xl bg-white p-10 text-center text-sm text-muted-foreground">
          Loading dashboard...
        </div>

      </AdminLayout>
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !dashboard) {

    return (
      <AdminLayout title="Dashboard">

        <div className="rounded-2xl bg-white p-10 text-center">

          <p className="text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>

        </div>

      </AdminLayout>
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  const stats = [

    {
      label: "Total Leads",
      value: dashboard.stats.total_leads,
      icon: FiUsers,
    },

    {
      label: "Total Events",
      value: dashboard.stats.total_events,
      icon: FiCalendar,
    },

    {
      label: "Total Services",
      value: dashboard.stats.total_services,
      icon: FiEdit3,
    },

  ];


  return (

    <AdminLayout title="Dashboard">


      {/* Dashboard Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {stats.map((s, i) => (

          <motion.div
            key={s.label}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: i * 0.08,
            }}
          >

            <Card>

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">

                  <s.icon />

                </div>

              </div>


              <div className="mt-4 text-3xl font-black text-ink">

                {s.value}

              </div>


              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">

                {s.label}

              </div>

            </Card>

          </motion.div>

        ))}

      </div>


      {/* Recent Leads */}

      <div className="mt-6">

        <h3 className="mb-3 text-base font-bold text-ink">

          Recent Leads

        </h3>


        <Table
          headers={[
            "Name",
            "Event Type",
            "Date",
            "Status",
          ]}
        >

          {dashboard.recent_leads.length > 0 ? (

            dashboard.recent_leads.map((lead) => (

              <tr
                key={lead.id}
                className="hover:bg-surface"
              >

                <td className="px-4 py-3 font-semibold text-ink">

                  {lead.name}

                </td>


                <td className="px-4 py-3 text-muted-foreground">

                  {lead.type}

                </td>


                <td className="px-4 py-3 text-muted-foreground">

                  {new Date(
                    lead.date
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}

                </td>


                <td className="px-4 py-3">

                  <StatusPill
                    status={
                      lead.status as any
                    }
                  />

                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >

                No leads found.

              </td>

            </tr>

          )}

        </Table>

      </div>

    </AdminLayout>

  );

}