import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Btn, Card, Field, inputCls } from "@/components/admin/ui";


export default function Content() {
  const save = (e: React.FormEvent) => { e.preventDefault(); toast.success("Content saved (demo)"); };
  return (
    <AdminLayout title="Website Content">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card> 
          <h3 className="mb-4 text-base font-bold text-ink">Hero Section</h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Heading"><input className={inputCls} defaultValue="Events That Elevate Your Brand." /></Field>
            <Field label="Subtitle"><input className={inputCls} defaultValue="From boardroom conferences to global product launches." /></Field>
            <Field label="Primary Button Text"><input className={inputCls} defaultValue="View Services" /></Field>
            <Field label="Secondary Button Text"><input className={inputCls} defaultValue="Contact Us" /></Field>
            <Btn>Save Hero</Btn>
          </form>
        </Card>
        <Card>
          <h3 className="mb-4 text-base font-bold text-ink">About Section</h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Heading"><input className={inputCls} defaultValue="A decade of flawless event execution." /></Field>
            <Field label="Description"><textarea rows={5} className={inputCls} defaultValue="Salem's most trusted event production house..." /></Field>
            <Btn>Save About</Btn>
          </form>
        </Card>
        <Card>
          <h3 className="mb-4 text-base font-bold text-ink">Why Choose Us</h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Section Heading"><input className={inputCls} defaultValue="Six reasons India's boldest brands trust us." /></Field>
            <Field label="Section Intro"><textarea rows={3} className={inputCls} defaultValue="You get the pitch of an agency..." /></Field>
            <Btn>Save</Btn>
          </form>
        </Card>
        <Card>
          <h3 className="mb-4 text-base font-bold text-ink">Footer & Contact</h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Footer Tagline"><input className={inputCls} defaultValue="Premium event management from Salem, Tamil Nadu." /></Field>
            <Field label="Contact CTA"><input className={inputCls} defaultValue="Let's design your next event." /></Field>
            <Btn>Save</Btn>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}