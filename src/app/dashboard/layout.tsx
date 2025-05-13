import { AppHeader } from "@/components/layout/app-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground border-t">
        TaskMaster &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
