import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  // getSession() baca dari cookie (no network call) — middleware sudah verify auth
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  let adminName = session.user.email ?? "Admin";
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session.user.id)
    .maybeSingle();
  if (profile?.full_name) adminName = profile.full_name;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="sticky top-0 h-screen shrink-0">
        <AdminSidebar adminName={adminName} />
      </div>
      <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
    </div>
  );
}