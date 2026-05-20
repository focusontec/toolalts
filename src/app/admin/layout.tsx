import { cookies } from "next/headers";
import Link from "next/link";
import { AdminSidebar } from "./sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  // Not logged in → render children (login page) without sidebar
  if (!session) {
    return <>{children}</>;
  }

  // Logged in → render with sidebar
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  );
}
