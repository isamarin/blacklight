import { Navbar } from "@/components/navbar";
import Authentication from "@/components/authentication";
import { Outlet } from "react-router-dom";

// export default function DefaultLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
export default function DefaultLayout(){
  return (
    <div className="greenlight bg-background text-foreground">
      <div className="relative flex flex-col h-screen">
        <Authentication>
          <Navbar />
          <main className="container mx-auto max-w-full px-6 flex-grow pt-4">
            <Outlet />
          </main>
        </Authentication>
      </div>
    </div>
  );
}
