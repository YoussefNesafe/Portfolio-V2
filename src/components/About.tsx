import SectionTitle from "./SectionTitle";
import { SKILLS } from "@/ContentData/aboutMeContent";
import Image from "next/image";
import { AiFillThunderbolt } from "react-icons/ai";
import myImage from "../../public/assets/my_image.jpg";
const About = () => (
	<section id="about" className="flex flex-col gap-8 py-10 mx-auto max-w-containerSmall lgl:py-32">
		<SectionTitle number={"01"} title={"About"} />
		<div className="flex flex-col gap-16 lgl:flex-row">
			<div className="flex flex-col w-full gap-4 text-base font-medium lgl:w-2/3 text-textDark">
				<p>
					Hello! My name is Youssef Nesafe and I enjoy creating things that live on the
					internet. My interest in web development started back in 2018 when I create first
					test page.
				</p>
				<p>
					I`m a <span className="text-textGreen">software engineer</span> with +3 years of
					experience in <span className="text-textGreen">frontend</span> development for web
					with a passion for building and maintaining responsive, accessible, and performant
					websites.
				</p>
				<p>Here are a few technologies I have been working with recently:</p>
				<ul className="max-w-[450px] text-sm font-titleFont grid grid-cols-2 gap-2 mt-6">
					{SKILLS.map((skill, index) => (
						<li key={index} className="flex items-center gap-2">
							<span className="text-textGreen">
								<AiFillThunderbolt />
							</span>{" "}
							{skill}
						</li>
					))}
				</ul>
			</div>
			<div className="relative w-full lgl:w-1/3 h-90 group">
				<div className="absolute w-full rounded-lg h-80 -left-6 -top-6 ">
					<div className="relative z-20 flex sm:max-w-[300px] xl:max-w-[1000px] h-full pl-6 lgl:pl-0">
						<Image className="object-cover h-full rounded-lg " src={myImage} alt="" />
						<div className="absolute top-0 left-0 hidden w-full duration-300 rounded-md lgl:inline-block h-80 bg-textGreen/20 group-hover:bg-transparent"></div>
					</div>
				</div>
				<div className="hidden w-full transition-transform duration-300 border-2 rounded-md lgl:inline-flex h-80 border-textGreen group-hover:-translate-x-2 group-hover:-translate-y-2"></div>
			</div>
		</div>
	</section>
);

export default About;
