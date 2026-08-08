import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Btn, Field, Modal, PageActions, Table, inputCls } from "@/components/admin/ui";
import { FAQS } from "@/data/site";


type Row = { id: string; q: string; a: string };
const initial: Row[] = FAQS.map((f, i) => ({ id: String(i), ...f }));

export default function Faq() {
  const [rows, setRows] = useState<Row[]>(initial);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Row | null>(null);

  const openNew = () => { setEdit({ id: crypto.randomUUID(), q: "", a: "" }); setOpen(true); };
  const openEdit = (r: Row) => { setEdit({ ...r }); setOpen(true); };
  const remove = (id: string) => { setRows((r) => r.filter((x) => x.id !== id)); toast.success("Removed"); };
  const save = () => {
    if (!edit) return;
    setRows((r) => (r.some((x) => x.id === edit.id) ? r.map((x) => (x.id === edit.id ? edit : x)) : [...r, edit]));
    setOpen(false); toast.success("Saved");
  };
  return (
    <AdminLayout title="FAQ">
      <PageActions>
        <div className="text-sm text-muted-foreground">{rows.length} questions</div>
        <Btn onClick={openNew}><FiPlus /> Add FAQ</Btn>
      </PageActions>
      <Table headers={["Question", "Answer", "Actions"]}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-surface">
            <td className="px-4 py-3 font-semibold text-ink">{r.q}</td>
            <td className="px-4 py-3 max-w-lg truncate text-muted-foreground">{r.a}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button onClick={() => openEdit(r)} className="rounded-full border border-border p-2 hover:border-brand hover:text-brand"><FiEdit2 /></button>
                <button onClick={() => remove(r.id)} className="rounded-full border border-border p-2 hover:border-brand hover:text-brand"><FiTrash2 /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <Modal open={open} onClose={() => setOpen(false)} title={edit && rows.some((x) => x.id === edit.id) ? "Edit FAQ" : "Add FAQ"}
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {edit && (
          <div className="space-y-4">
            <Field label="Question"><input className={inputCls} value={edit.q} onChange={(e) => setEdit({ ...edit, q: e.target.value })} /></Field>
            <Field label="Answer"><textarea rows={5} className={inputCls} value={edit.a} onChange={(e) => setEdit({ ...edit, a: e.target.value })} /></Field>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}