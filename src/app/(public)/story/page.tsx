export const revalidate = 3600;

import { getDictionary } from "@/get-dictionary";
import StoryCanvas from "./components/StoryCanvas";

export const metadata = {
  title: "My Story",
  description:
    "Follow my Dragon Ball-inspired career journey as a developer — from early coding adventures to becoming a Senior Frontend Engineer building trading platforms in Dubai.",
  alternates: {
    canonical: "/story",
  },
};

export default async function StoryRoute() {
  const dict = await getDictionary();
  return <StoryCanvas story={dict.story} />;
}
