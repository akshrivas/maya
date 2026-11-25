// Pages that need login (login, onboarding, dashboard) share this wrapper.
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
