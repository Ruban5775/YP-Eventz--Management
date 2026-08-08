import { useMemo, useState, useEffect } from "react";
import { FiEye, FiSearch, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Btn, Modal, PageActions, StatusPill, Table, inputCls } from "@/components/admin/ui";


const API_BASE = import.meta.env.VITE_API_BASE;


type Status = "New" | "Contacted" | "Won" | "Lost";
type Lead = { id: string; name: string; email: string; phone: string; type: string; location: string; message: string; date: string; status: Status };



export default function Leads() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [view, setView] = useState<Lead | null>(null);

  useEffect(() => {

    loadLeads();

  }, []);

  const loadLeads = async () => {

    try {

      const response = await fetch(
        `${API_BASE}/admin/get_leads.php`
      );

      const result = await response.json();

      if (result.success) {

        setRows(result.data);

      } else {

        toast.error(result.message);

      }

    } catch (error) {

      console.error(error);

      toast.error("Unable to load leads.");

    }

  };

  const list = useMemo(() => rows.filter((l) =>
    (filter === "All" || l.status === filter) &&
    (q === "" || [l.name, l.email, l.type, l.location].some((s) => s.toLowerCase().includes(q.toLowerCase())))
  ), [rows, q, filter]);


 const remove = async (id: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this lead? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE}/admin/delete_lead.php`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      setRows((currentRows) =>
        currentRows.filter((row) => row.id !== id)
      );

      // If deleted lead is currently opened
      if (view?.id === id) {
        setView(null);
      }

      toast.success(
        result.message || "Lead deleted successfully."
      );
    } else {
      toast.error(
        result.message || "Unable to delete lead."
      );
    }
  } catch (error) {
    console.error("Delete lead error:", error);

    toast.error(
      "Unable to delete lead. Please try again."
    );
  }
};

  const setStatus = async (id: string, status: Status) => {

    try {

      const response = await fetch(
        `${API_BASE}/admin/update_lead_status.php`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            id,
            status
          })
        }
      );

      const result = await response.json();

      if (result.success) {

        setRows(rows =>
          rows.map(row =>
            row.id === id
              ? { ...row, status }
              : row
          )
        );

        toast.success(result.message);

      } else {

        toast.error(result.message);

      }

    } catch (err) {

      console.error(err);

      toast.error("Unable to update status.");

    }

  };

  return (
    <AdminLayout title="Leads">
      <PageActions>
        <div className="flex flex-wrap items-center gap-2">

          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className={`${inputCls} w-40`}>
            {(["All", "New", "Contacted", "Won", "Lost"] as const).map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">{list.length} of {rows.length} leads</div>
      </PageActions>
      <Table headers={["Name", "Phone", "Email", "Event Type", "Location", "Date", "Status", "Actions"]}>
        {list.map((l) => (
          <tr key={l.id} className="hover:bg-surface">
            <td className="px-4 py-3 font-semibold text-ink">{l.name}</td>
            <td className="px-4 py-3 text-muted-foreground">{l.phone}</td>
            <td className="px-4 py-3 text-muted-foreground">{l.email}</td>
            <td className="px-4 py-3 text-muted-foreground">{l.type}</td>
            <td className="px-4 py-3 text-muted-foreground">{l.location}</td>
            <td className="px-4 py-3 text-muted-foreground">{l.date}</td>
            <td className="px-4 py-3">
              <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value as Status)} className="rounded-full border border-border bg-white px-2 py-1 text-xs">
                {(["New", "Contacted", "Won", "Lost"] as const).map((s) => <option key={s}>{s}</option>)}
              </select>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button onClick={() => setView(l)} className="rounded-full border border-border p-2 hover:border-brand hover:text-brand"><FiEye /></button>
               <button
                  onClick={() => remove(l.id)}
                  className="rounded-full border border-border p-2 hover:border-brand hover:text-brand"
                >
                  <FiTrash2 />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <Modal open={!!view} onClose={() => setView(null)} title={view?.name || ""}
        footer={<Btn onClick={() => setView(null)}>Close</Btn>}>
        {view && (
          <div className="space-y-3 text-sm">
            <Row label="Email" value={view.email} />
            <Row label="Phone" value={view.phone} />
            <Row label="Event Type" value={view.type} />
            <Row label="Location" value={view.location} />
            <Row label="Date" value={view.date} />
            <Row label="Status" value={<StatusPill status={view.status} />} />
            <div><div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Message</div><div className="mt-1 rounded-xl bg-surface p-4 text-ink">{view.message}</div></div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}