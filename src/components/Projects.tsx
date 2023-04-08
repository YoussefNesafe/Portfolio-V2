import SectionTitle from "./SectionTitle";
import { PROJECTS_CONTENT } from "@/ContentData/projectsContent";
const Projects = () => {
	const {
		titleSection: { title, number },
		soon,
	} = PROJECTS_CONTENT;
	return (
		<section
			id="projects"
			className="flex flex-col gap-8 py-10 mx-auto max-w-containerSmall lgl:py-32"
		>
			<SectionTitle number={number} title={title} />
			<h1 className="py-8 text-4xl text-center rounded-lg text-textGreen bg-hoverColor">
				{soon}
			</h1>
		</section>
	);
};

export default Projects;
