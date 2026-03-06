import { getDictionary } from "@/get-dictionary";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import ScrollProgress from "@/app/components/ui/ScrollProgress";
import EasterEggsProvider from "@/app/components/easter-eggs/EasterEggsProvider";
import ViewModeProvider from "@/app/components/view-mode/ViewModeProvider";
import ViewModeToggle from "@/app/components/view-mode/ViewModeToggle";
import ViewTransitionHandler from "@/app/components/view-transitions/ViewTransitionLink";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();

  return (
    <EasterEggsProvider>
      <ViewModeProvider>
        <main className="overflow-x-clip">
          <ViewTransitionHandler />
          <ScrollProgress />
          <Header {...dict.layout.header} />
          {children}
          <Footer {...dict.layout.footer} />
        </main>
        <ViewModeToggle />
      </ViewModeProvider>
    </EasterEggsProvider>
  );
}
