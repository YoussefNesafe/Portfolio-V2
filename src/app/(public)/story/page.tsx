import { getDictionary } from "@/get-dictionary";
import StoryCanvas from "./components/StoryCanvas";

export const metadata = {
  title: "My Story | Youssef Nesafe",
  description:
    "A Dragon Ball-inspired journey through my career as a developer",
};

export default async function StoryRoute() {
  const dict = await getDictionary();
  return <StoryCanvas story={dict.story} />;
}
