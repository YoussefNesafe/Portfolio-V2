import { useState } from "react";
import SectionTitle from "./SectionTitle";
import { EXPERIENCE_CONTENT } from "@/ContentData/experienceContent";
import TabsContentSection from "./TabsContentSection";
const Experience = () => {
	const {
		titleSection: { title, number },
		tabSection,
	} = EXPERIENCE_CONTENT || {};
	const [activeTabIndex, setActiveTabIndex] = useState(0);
	return (
		<section id="experience" className="px-4 py-10 mx-auto max-w-containerxs lgl:py-24">
			<SectionTitle number={number} title={title} />
			<div className="flex flex-col w-full gap-16 mt-10 md:flex-row">
				<div className="flex flex-wrap w-full md:hidden">
					{tabSection.map((tab, index) => (
						<span
							key={`exp-${index}`}
							className={` ${
								activeTabIndex === index
									? "bg-[#8892b0] rounded-md text-textGreen dark:text-textDark"
									: " text-textDark"
							}   bg-transparent hover:bg-[#112240] py-3 text-sm  cursor-pointer duration-300 px-8 font-medium`}
							onClick={() => setActiveTabIndex(index)}
						>
							{tab.title}
						</span>
					))}
				</div>
				<ul className="flex-col hidden md:block md:w-50">
					{tabSection.map((tab, index) => (
						<li
							key={`exp-${index}`}
							className={` ${
								activeTabIndex === index
									? "border-l-textGreen text-textGreen dark:text-textDark dark:border-l-textDark"
									: "border-l-hoverColor text-textDark"
							}   border-l-2 bg-transparent hover:bg-[#112240] py-3 text-sm  cursor-pointer duration-300 px-8 font-medium`}
							onClick={() => setActiveTabIndex(index)}
						>
							{tab.title}
						</li>
					))}
				</ul>
				<TabsContentSection tabData={tabSection[activeTabIndex]} />
			</div>
		</section>
	);
};

export default Experience;
