import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
