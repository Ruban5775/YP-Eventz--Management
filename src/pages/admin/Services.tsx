import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Btn, Field, Modal, PageActions, StatusPill, Table, inputCls } from "@/components/admin/ui";
import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiBriefcase,
  FiCalendar,
  FiUsers,
  FiHeart,
  FiStar,
  FiCamera,
  FiMusic,
  FiGift,
  FiHome,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";


const API_BASE = import.meta.env.VITE_API_BASE;


const ICONS: Record<string, React.ReactNode> = {
  briefcase: <FiBriefcase className="text-brand text-xl" />,
  sparkles: <HiSparkles className="text-brand text-xl" />,
  calendar: <FiCalendar className="text-brand text-xl" />,
  users: <FiUsers className="text-brand text-xl" />,
  heart: <FiHeart className="text-brand text-xl" />,
  star: <FiStar className="text-brand text-xl" />,
  camera: <FiCamera className="text-brand text-xl" />,
  music: <FiMusic className="text-brand text-xl" />,
  gift: <FiGift className="text-brand text-xl" />,
  building: <FiHome className="text-brand text-xl" />,
};

const ICON_OPTIONS = [
  { value: "briefcase", label: "Briefcase" },
  { value: "sparkles", label: "Sparkles" },
  { value: "calendar", label: "Calendar" },
  { value: "users", label: "Users" },
  { value: "heart", label: "Heart" },
  { value: "star", label: "Star" },
  { value: "camera", label: "Camera" },
  { value: "music", label: "Music" },
  { value: "gift", label: "Gift" },
  { value: "building", label: "Building" },
];

type Row = {
  id: string;
  title: string;
  description: string;
  items: string;
  icon: string;
  status: "Active" | "Inactive";
};


export default function Services() {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);

  useEffect(() => {
    loadServices();
}, []);

const loadServices = async () => {

    try {

        const response = await fetch(
            `${API_BASE}/admin/get_services.php`
        );

        const result = await response.json();

        if (result.success) {
            setRows(result.data);
        }

    } catch (error) {
        console.error(error);
        toast.error("Unable to load services.");
    }

};

const openNew = () => {

    setEdit({
        id: "",
        title: "",
        description: "",
        items: "",
        icon: "briefcase",
        status: "Active"
    });

    setOpen(true);

};
  const openEdit = (r: Row) => { setEdit({ ...r }); setOpen(true); };
  const remove = async (id: string) => {

    if (!confirm("Are you sure you want to delete this service?")) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/admin/delete_service.php`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id })
            }
        );

        const result = await response.json();

        if (result.success) {

            toast.success(result.message);

            loadServices();

        } else {

            toast.error(result.message);

        }

    } catch (error) {

        console.error(error);

        toast.error("Unable to delete service.");

    }

};
 
  const save = async () => {

    if (!edit) return;

    const isEdit = edit.id !== "";

    const api = isEdit
        ? `${API_BASE}/admin/update_service.php` 
        : `${API_BASE}/admin/add_service.php`;

    try {

        const response = await fetch(api, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(edit)

        });

        const result = await response.json();

        if(result.success){

            toast.success(result.message);

            setOpen(false);

            loadServices();

        }else{

            toast.error(result.message);

        }

    }catch(error){

        console.error(error);

        toast.error("Unable to save service.");

    }

};

  return (
    <AdminLayout title="Services">
      <PageActions>
        <div className="text-sm text-muted-foreground">{rows.length} services</div>
        <Btn onClick={openNew}><FiPlus /> Add Service</Btn>
      </PageActions>
      <Table headers={["Icon", "Title", "Description", "Status", "Actions"]}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-surface">
            <td className="px-4 py-3">
    <div className="flex items-center gap-3">
        {ICONS[r.icon]}

        <span className="font-medium text-ink capitalize">
            {r.icon}
        </span>
    </div>
</td>
            <td className="px-4 py-3 font-semibold text-ink">{r.title}</td>
            <td className="px-4 py-3 max-w-md truncate text-muted-foreground">{r.description}</td>
            <td className="px-4 py-3"><StatusPill status={r.status} /></td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button onClick={() => openEdit(r)} className="rounded-full border border-border p-2 text-ink hover:border-brand hover:text-brand"><FiEdit2 /></button>
                <button onClick={() => remove(r.id)} className="rounded-full border border-border p-2 text-ink hover:border-brand hover:text-brand"><FiTrash2 /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={open} onClose={() => setOpen(false)} title={edit?.id ? "Edit Service" : "Add Service"}
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {edit && (
          <div className="space-y-4">
            <Field label="Title"><input className={inputCls} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
            <Field label="Description"><textarea rows={3} className={inputCls} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <Field label="Sub-services (comma separated)"><input className={inputCls} value={edit.items} onChange={(e) => setEdit({ ...edit, items: e.target.value })} /></Field>
            <Field label="Status">
              <select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as Row["status"] })}>
                <option>Active</option><option>Inactive</option>
              </select>
            </Field>
            <Field label="Icon">
    <select
        className={inputCls}
        value={edit.icon}
        onChange={(e) =>
            setEdit({
                ...edit,
                icon: e.target.value,
            })
        }
    >
        {ICON_OPTIONS.map((icon) => (
            <option key={icon.value} value={icon.value}>
                {icon.label}
            </option>
        ))}
    </select>

    <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        {ICONS[edit.icon]}
        <span className="font-medium text-ink">
            {ICON_OPTIONS.find((i) => i.value === edit.icon)?.label}
        </span>
    </div>
</Field>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}