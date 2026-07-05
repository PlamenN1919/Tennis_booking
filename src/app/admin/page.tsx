import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLogin from "@/components/admin/AdminLogin";
import { getServerUserProfile, isSupabaseConfigured } from "@/lib/supabase-server";

export default async function AdminPage() {
  // Local mock mode (no Supabase) — dev only, there is no auth infrastructure
  if (!isSupabaseConfigured()) {
    return <AdminDashboard />;
  }

  const profile = await getServerUserProfile();
  if (profile?.role !== "admin") {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
