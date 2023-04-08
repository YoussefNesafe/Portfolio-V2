import { FC } from "react";
import { motion } from "framer-motion";
import { TiArrowForward } from "react-icons/ti";
interface Iprops {
	tabData: {
		title: string;
		workTitle: string;
		city: string;
		date: string;
		companyURL: string;
		content: string[];
	};
}
const TabsContentSection: FC<Iprops> = ({ tabData }) => {
	const { title, workTitle, city, date, companyURL, content } = tabData || {};
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.1 }}
			className="w-full"
		>
			<h3 className="flex gap-1 text-xl font-medium font-titleFont">
				{workTitle}{" "}
				<a href={companyURL} target="_blank" className="tracking-wide text-textGreen">
					@{title}
				</a>
			</h3>
			<div className="flex justify-between mt-1 text-sm font-medium text-textDark">
				<p>{date}</p>
				<p>{city}</p>
			</div>
			<ul className="flex flex-col gap-3 mt-6">
				{content.map((item, index) => (
					<li key={`content-${index}`} className="flex gap-2 text-base text-textDark">
						<span className="mt-1 text-textGreen">
							<TiArrowForward />
						</span>
						{item}
					</li>
				))}
			</ul>
		</motion.div>
	);
};

export default TabsContentSection;
