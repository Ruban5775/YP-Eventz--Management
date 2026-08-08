import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Btn, Card, Field, inputCls } from "@/components/admin/ui";
import { useEffect, useState } from "react";
import {
  WebsiteSettings,
  loadWebsiteSettings,
} from "@/data/settings";
import { FiEye, FiEyeOff } from "react-icons/fi";


const API_BASE = import.meta.env.VITE_API_BASE;


export default function Settings() {

  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pw.current || !pw.next || !pw.confirm) {
      toast.error("Please fill all password fields.");
      return;
    }

    if (pw.next.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (pw.next !== pw.confirm) {
      toast.error("New passwords do not match.");
      return;
    }

    if (pw.current === pw.next) {
      toast.error(
        "New password must be different from current password."
      );
      return;
    }

    try {

      setChangingPassword(true);

      const response = await fetch(
        `${API_BASE}/admin/update_password.php`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            current_password: pw.current,
            new_password: pw.next,
            confirm_password: pw.confirm,
          }),
        }
      );


      const result = await response.json();


      if (!result.success) {

        toast.error(
          result.message || "Unable to update password."
        );

        return;
      }


      toast.success(
        "Password updated successfully."
      );


      // Clear fields after successful update
      setPw({
        current: "",
        next: "",
        confirm: "",
      });


    } catch (error) {

      console.error(
        "Password update error:",
        error
      );

      toast.error(
        "Unable to update password."
      );

    } finally {

      setChangingPassword(false);

    }
  };


  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await loadWebsiteSettings();
      setSettings(data);
      console.log("Website settings loaded:", data);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load website settings.");
    }
  };

  if (!settings) {
    return (
      <AdminLayout title="Website Settings">
        <div className="rounded-xl bg-white p-10 text-center">
          Loading...
        </div>
      </AdminLayout>
    );
  }

  const save = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!settings) return;

    try {

      setSaving(true);

      // Update text fields
      const response = await fetch(
        `${API_BASE}/admin/update_settings.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      if (!result.success) {

        toast.error(result.message);
        await fetchSettings();

        return;

      }

      // Upload logo if a new one is selected
      if (logoFile) {

        const formData = new FormData();

        formData.append("logo", logoFile);

        const uploadResponse = await fetch(
          `${API_BASE}/admin/upload_logo.php`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {

          setSettings({
            ...settings,
            logo: uploadResult.logo,
          });

          setLogoFile(null);
          setPreview("");

          await fetchSettings();

        } else {

          toast.error(uploadResult.message);

          return;

        }

      }

      toast.success("Website settings updated successfully.");

      await fetchSettings();

    } catch (error) {

      console.error(error);

      toast.error("Unable to update settings.");

    } finally {

      setSaving(false);

    }

  };



  return (
    <AdminLayout title="Website Settings">
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-base font-bold text-ink">Company Identity</h3>
          <div className="space-y-4">
            <Field label="Company Name"><input
              className={inputCls}
              value={settings.company_name} onChange={(e) =>
                setSettings({
                  ...settings,
                  company_name: e.target.value,
                })

              } /></Field>
            <div className="flex items-center gap-4">
              <img
                src={
                  preview
                    ? preview
                    : `${API_BASE}/uploads/${settings.logo}?t=${Date.now()}`
                }
                alt="Logo"
                className="h-14 w-14 rounded-xl border border-border object-contain p-1"
              />
              <label className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-surface px-4 py-3 text-sm font-semibold text-ink hover:border-brand">
                Replace Logo
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      const file = e.target.files[0];

                      setLogoFile(file);

                      setPreview(URL.createObjectURL(file));

                      toast.success("Logo selected.");
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 text-base font-bold text-ink">Contact</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone"><input className={inputCls} value={settings.phone} onChange={(e) =>
              setSettings({
                ...settings,
                phone: e.target.value,
              })
            } /></Field>
            <Field label="WhatsApp"><input className={inputCls} value={settings.whatsapp} onChange={(e) =>
              setSettings({
                ...settings,
                whatsapp: e.target.value,
              })
            } /></Field>
            <Field label="Email"><input className={inputCls} value={settings.email} onChange={(e) =>
              setSettings({
                ...settings,
                email: e.target.value,
              })
            } /></Field>
            <Field label="Business Hours"><input className={inputCls} value={settings.business_hours} onChange={(e) =>
              setSettings({
                ...settings,
                business_hours: e.target.value,
              })
            } /></Field>
            <div className="sm:col-span-2"><Field label="Address"><textarea rows={2} className={inputCls} value={settings.address} onChange={(e) =>
              setSettings({
                ...settings,
                address: e.target.value,
              })
            } /></Field></div>
            <div className="sm:col-span-2"><Field label="Google Map URL"><input className={inputCls} value={settings.map_embed} onChange={(e) =>
              setSettings({
                ...settings,
                map_embed: e.target.value,
              })
            } /></Field></div>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-ink">Social Media</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Facebook"><input className={inputCls} value={settings.facebook} onChange={(e) =>
              setSettings({
                ...settings,
                facebook: e.target.value,
              })
            } /></Field>
            <Field label="Instagram"><input className={inputCls} value={settings.instagram} onChange={(e) =>
              setSettings({
                ...settings,
                instagram: e.target.value,
              })
            } /></Field>
            <Field label="YouTube"><input className={inputCls} value={settings.youtube} onChange={(e) =>
              setSettings({
                ...settings,
                youtube: e.target.value,
              })
            } /></Field>
            <Field label="LinkedIn"><input className={inputCls} value={settings.linkedin} onChange={(e) =>
              setSettings({
                ...settings,
                linkedin: e.target.value,
              })
            } /></Field>
          </div>
        </Card>
        <div className="lg:col-span-2">
          <Btn disabled={saving}>
            {saving ? "Saving..." : "Save All Settings"}
          </Btn>
        </div>
      </form>


 {/* Update  Password */}
<form onSubmit={changePw} className="mt-8">
  <Card>
    <h3 className="mb-1 text-base font-bold text-ink">
      Change Password
    </h3>

    <p className="mb-5 text-xs text-muted-foreground">
      Update your admin login credentials. Use a strong password (min. 6 characters),  Username = YPeventz.
    </p>

    <div className="grid gap-4 sm:grid-cols-3">

      {/* Current Password */}
      <Field label="Current Password">
        <div className="relative">
          <input
            type={showCurrentPassword ? "text" : "password"}
            className={`${inputCls} pr-11`}
            value={pw.current}
            onChange={(e) =>
              setPw({
                ...pw,
                current: e.target.value,
              })
            }
            placeholder="••••••"
          />

          <button
            type="button"
            onClick={() =>
              setShowCurrentPassword((prev) => !prev)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-ink"
            aria-label={
              showCurrentPassword
                ? "Hide current password"
                : "Show current password"
            }
          >
            {showCurrentPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        </div>
      </Field>


      {/* New Password */}
      <Field label="New Password">
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            className={`${inputCls} pr-11`}
            value={pw.next}
            onChange={(e) =>
              setPw({
                ...pw,
                next: e.target.value,
              })
            }
            placeholder="••••••"
          />

          <button
            type="button"
            onClick={() =>
              setShowNewPassword((prev) => !prev)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-ink"
            aria-label={
              showNewPassword
                ? "Hide new password"
                : "Show new password"
            }
          >
            {showNewPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        </div>
      </Field>


      {/* Confirm New Password */}
      <Field label="Confirm New Password">
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className={`${inputCls} pr-11`}
            value={pw.confirm}
            onChange={(e) =>
              setPw({
                ...pw,
                confirm: e.target.value,
              })
            }
            placeholder="••••••"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword((prev) => !prev)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-ink"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        </div>
      </Field>

    </div>

    <div className="mt-5">
      <Btn disabled={changingPassword}>
        {changingPassword
          ? "Updating..."
          : "Update Password"}
      </Btn>
    </div>
  </Card>
</form>
    </AdminLayout>
  );
}