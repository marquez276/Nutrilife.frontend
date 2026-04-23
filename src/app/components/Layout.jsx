import { Sidebar } from "./Sidebar";

export function Layout({ children, userType = "patient" }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType={userType} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
