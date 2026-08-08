import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminContent from "./pages/admin/Content";
import AdminServices from "./pages/admin/Services";
import AdminWork from "./pages/admin/Work";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminFaq from "./pages/admin/Faq";
import AdminLeads from "./pages/admin/Leads";
import AdminSettings from "./pages/admin/Settings";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ypeventz" element={<AdminLogin />} />
      <Route path="/ypeventz/dashboard" element={<AdminDashboard />} />
      <Route path="/ypeventz/content" element={<AdminContent />} />
      <Route path="/ypeventz/services" element={<AdminServices />} />
      <Route path="/ypeventz/work" element={<AdminWork />} />
      <Route path="/ypeventz/testimonials" element={<AdminTestimonials />} />
      <Route path="/ypeventz/faq" element={<AdminFaq />} />
      <Route path="/ypeventz/leads" element={<AdminLeads />} />
      <Route path="/ypeventz/settings" element={<AdminSettings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}