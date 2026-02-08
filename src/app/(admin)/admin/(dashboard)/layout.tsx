import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="desktop:ml-[13.542vw] min-h-screen p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] pt-[16vw] tablet:pt-[8vw] desktop:pt-[1.042vw]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
