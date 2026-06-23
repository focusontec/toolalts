import { cookies } from "next/headers";
import { AdminShell } from "./admin-shell";

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

  // Logged in → render with responsive sidebar
  return <AdminShell>{children}</AdminShell>;
}
