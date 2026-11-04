import { AuthShell } from "@/components/AuthShell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell variant="citizen">{children}</AuthShell>;
}
