import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="md:pl-[240px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8 md:py-10">
          {children}
        </div>
      </main>
    </>
  );
}
