import { AuthShell } from "@/components/AuthShell";

export default function GovAuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell variant="gov">{children}</AuthShell>;
}
