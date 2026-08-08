import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Btn,
  Field,
  Modal,
  PageActions,
  Table,
  inputCls,
} from "@/components/admin/ui";

const API_BASE = import.meta.env.VITE_API_BASE;

type Row = {
  id: number;
  name: string;
  role: string;
  date: string;
  rating: number;
  review: string;
};

type FormData = {
  id?: number;
  name: string;
  role: string;
  date: string;
  rating: number;
  review: string;
};

const emptyForm: FormData = {
  name: "",
  role: "",
  date: "",
  rating: 5,
  review: "",
};

export default function Testimonials() {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Testimonials
  |--------------------------------------------------------------------------
  */

  const loadTestimonials = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/admin/get_reviews.php`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load testimonials."
        );
      }

      setRows(data.data || []);

    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load testimonials."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Open Add
  |--------------------------------------------------------------------------
  */

  const openNew = () => {
    setEdit({
      ...emptyForm,
      date: new Date().toISOString().split("T")[0],
    });

    setOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Open Edit
  |--------------------------------------------------------------------------
  */

  const openEdit = (row: Row) => {
    setEdit({
      ...row,
    });

    setOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Save Add / Update
  |--------------------------------------------------------------------------
  */

  const save = async () => {
    if (!edit) return;

    if (!edit.name.trim()) {
      toast.error("Client name is required.");
      return;
    }

    if (!edit.date) {
      toast.error("Date is required.");
      return;
    }

    if (!edit.review.trim()) {
      toast.error("Review is required.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(edit.id);

      const endpoint = isEditing
        ? `${API_BASE}/admin/update_reviews.php`
        : `${API_BASE}/admin/add_reviews.php`;

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(edit),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save testimonial."
        );
      }

      toast.success(
        isEditing
          ? "Testimonial updated successfully."
          : "Testimonial added successfully."
      );

      setOpen(false);
      setEdit(null);

      // Reload latest data from DB
      await loadTestimonials();

    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save testimonial."
      );

    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const remove = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this testimonial?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE}/admin/delete_reviews.php`,
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete testimonial."
        );
      }

      /*
       * Update UI immediately without another request
       */
      setRows((current) =>
        current.filter((row) => row.id !== id)
      );

      toast.success("Testimonial deleted successfully.");

    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete testimonial."
      );
    }
  };

  return (
    <AdminLayout title="Testimonials">

      {/* Page Header */}

      <PageActions>
        <div className="text-sm text-muted-foreground">
          {loading
            ? "Loading testimonials..."
            : `${rows.length} testimonials`}
        </div>

        <Btn onClick={openNew}>
          <FiPlus />
          Add Testimonial
        </Btn>
      </PageActions>


      {/* Testimonials Table */}

      <Table
        headers={[
          "Client",
          "Role / Company",
          "Date",
          "Rating",
          "Review",
          "Actions",
        ]}
      >
        {!loading && rows.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="px-4 py-10 text-center text-sm text-muted-foreground"
            >
              No testimonials found.
            </td>
          </tr>
        )}

        {rows.map((row) => (
          <tr
            key={row.id}
            className="transition-colors hover:bg-surface"
          >

            {/* Client */}

            <td className="px-4 py-3">
              <div className="flex items-center gap-3">

                {/* Initial Avatar */}

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold uppercase text-white">
                  {row.name
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <span className="font-semibold text-ink">
                  {row.name}
                </span>
              </div>
            </td>


            {/* Role */}

            <td className="px-4 py-3 text-muted-foreground">
              {row.role || "—"}
            </td>


            {/* Date */}

            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
              {row.date}
            </td>


            {/* Rating */}

            <td className="px-4 py-3">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FaStar
                    key={index}
                    className={
                      index < row.rating
                        ? "text-amber-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            </td>


            {/* Review */}

            <td className="max-w-md px-4 py-3">
              <p
                className="truncate text-muted-foreground"
                title={row.review}
              >
                {row.review}
              </p>
            </td>


            {/* Actions */}

            <td className="px-4 py-3">
              <div className="flex gap-2">

                <button
                  onClick={() => openEdit(row)}
                  aria-label={`Edit ${row.name}`}
                  className="rounded-full border border-border p-2 transition hover:border-brand hover:text-brand"
                >
                  <FiEdit2 />
                </button>

                <button
                  onClick={() => remove(row.id)}
                  aria-label={`Delete ${row.name}`}
                  className="rounded-full border border-border p-2 transition hover:border-red-500 hover:text-red-500"
                >
                  <FiTrash2 />
                </button>

              </div>
            </td>
          </tr>
        ))}
      </Table>


      {/* Add / Edit Modal */}

      <Modal
        open={open}
        onClose={() => {
          if (!saving) {
            setOpen(false);
            setEdit(null);
          }
        }}
        title={
          edit?.id
            ? "Edit Testimonial"
            : "Add Testimonial"
        }
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setEdit(null);
              }}
            >
              Cancel
            </Btn>

            <Btn
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Btn>
          </>
        }
      >

        {edit && (
          <div className="space-y-4">

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Name */}

              <Field label="Name">
                <input
                  className={inputCls}
                  value={edit.name}
                  placeholder="Client name"
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      name: e.target.value,
                    })
                  }
                />
              </Field>


              {/* Role */}

              <Field label="Role / Company">
                <input
                  className={inputCls}
                  value={edit.role}
                  placeholder="CEO, Company Name"
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      role: e.target.value,
                    })
                  }
                />
              </Field>


              {/* Date */}

              <Field label="Date">
                <input
                  type="date"
                  className={inputCls}
                  value={edit.date}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      date: e.target.value,
                    })
                  }
                />
              </Field>


              {/* Rating */}

              <Field label="Rating">
                <select
                  className={inputCls}
                  value={edit.rating}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      rating: Number(e.target.value),
                    })
                  }
                >
                  {[5, 4, 3, 2, 1].map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number} {number === 1 ? "Star" : "Stars"}
                    </option>
                  ))}
                </select>
              </Field>

            </div>


            {/* Review */}

            <Field label="Review">
              <textarea
                rows={5}
                className={inputCls}
                value={edit.review}
                placeholder="Enter client testimonial..."
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    review: e.target.value,
                  })
                }
              />
            </Field>

          </div>
        )}

      </Modal>

    </AdminLayout>
  );
}