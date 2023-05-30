import { SOCIAL_MEDIA_LINKS } from "../../ContentData/MainLayoutContent";
import { motion } from "framer-motion";
const SocialMediaSection = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 1.5 }}
			className="fixed bottom-0 left-0 hidden w-32 h-full xl:inline-flex"
		>
			<div className="flex flex-col items-center justify-end w-full h-full gap-4">
				<div className="flex flex-col gap-4">
					{SOCIAL_MEDIA_LINKS.map((link) => (
						<a href={link?.url} target="_blank" key={link.url}>
							<span className="inline-flex items-center justify-center w-10 h-10 text-xl transition-all duration-300 rounded-full cursor-pointer dark:text-textDark/50 bg-hoverColor dark:bg-textDark/10 hover:text-textGreen hover:dark:text-textDark hover:-translate-y-2">
								{link.icon}
							</span>
						</a>
					))}
				</div>
				<span className="w-[2px] h-32 bg-textDark"></span>
			</div>
		</motion.div>
	);
};

export default SocialMediaSection;
