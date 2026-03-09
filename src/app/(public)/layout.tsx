import { getDictionary } from "@/get-dictionary";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import ScrollProgress from "@/app/components/ui/ScrollProgress";
import ViewModeProvider from "@/app/components/view-mode/ViewModeProvider";
import ViewModeToggle from "@/app/components/view-mode/ViewModeToggle";
import ViewTransitionHandler from "@/app/components/view-transitions/ViewTransitionLink";
import StoryButton from "@/app/components/story/StoryButton";
import CanvasLayers from "@/app/components/canvas/CanvasLayers";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();

  return (
    <ViewModeProvider>
      <CanvasLayers />
      <main className="overflow-x-clip relative z-[2]">
        <ViewTransitionHandler />
        <ScrollProgress />
        <Header {...dict.layout.header} />
        {children}
        <Footer {...dict.layout.footer} />
      </main>
      <ViewModeToggle />
      <StoryButton />
    </ViewModeProvider>
  );
}
