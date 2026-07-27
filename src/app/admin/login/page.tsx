import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in — 101Discoveries",
};

export default async function AdminLoginPage() {
  // Already signed in as an admin? Skip straight to the dashboard.
  const user = await getAdminUser();
  if (user) redirect("/admin");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Admin sign in
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        101Discoveries staff only.
      </p>
      <LoginForm />
    </main>
  );
}
