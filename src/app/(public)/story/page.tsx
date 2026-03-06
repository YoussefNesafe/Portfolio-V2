import { getDictionary } from "@/get-dictionary";
import StoryPage from "./components/StoryPage";

export const metadata = {
  title: "My Story | Youssef Nesafe",
  description: "An interactive journey through my career as a developer",
};

export default async function StoryRoute() {
  const dict = await getDictionary();
  return <StoryPage story={dict.story} />;
}
