import { getDictionary } from "@/get-dictionary";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import ScrollProgress from "@/app/components/ui/ScrollProgress";
import EasterEggsProvider from "@/app/components/easter-eggs/EasterEggsProvider";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();

  return (
    <EasterEggsProvider>
      <main className="overflow-x-clip">
        <ScrollProgress />
        <Header {...dict.layout.header} />
        {children}
        <Footer {...dict.layout.footer} />
      </main>
    </EasterEggsProvider>
  );
}
