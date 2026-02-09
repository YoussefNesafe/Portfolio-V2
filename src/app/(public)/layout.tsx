import { getDictionary } from "@/get-dictionary";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import ScrollProgress from "@/app/components/ui/ScrollProgress";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();

  return (
    <>
      <ScrollProgress />
      <Header {...dict.layout.header} />
      {children}
      <Footer {...dict.layout.footer} />
    </>
  );
}
