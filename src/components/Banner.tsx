import { motion } from "framer-motion";
import { BANNER_CONTENT } from "@/ContentData/bannerContent";
import { SOCIAL_MEDIA_LINKS } from "@/ContentData/MainLayoutContent";
function Banner() {
	const { hiMsg, myName, myWork, description, learnMore, checkOut } = BANNER_CONTENT || {};
	return (
		<section
			id="home"
			className="flex flex-col gap-4 py-10 mx-auto max-w-contentContainer mdl:py-24 lgl:gap-8 mdl:px-10 xl:px-4"
		>
			<motion.h3
				initial={{ y: 10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.6 }}
				className="text-lg tracking-wide font-titleFont text-textGreen dark:text-textDark"
			>
				{hiMsg}
			</motion.h3>
			<motion.h1
				initial={{ y: 10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.7 }}
				className="flex flex-col text-4xl font-semibold lgl:text-6xl font-titleFont"
			>
				{myName}
				<span className="mt-2 text-textDark lgl:mt-4">{myWork}</span>
			</motion.h1>
			<motion.p
				initial={{ y: 10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.8 }}
				className="text-base md:max-w-[650px] text-textDark font-medium flex flex-col"
			>
				{description}
				<a href="#Portfolio" target="_blank">
					<span className="relative inline-flex overflow-x-hidden cursor-pointer text-textGreen dark:text-textDark h-7 group">
						<span className="absolute w-full h-[1px] bg-textGreen dark:bg-textDark left-0 bottom-1 -translate-x-[110%] group-hover:translate-x-0 transition-transform duration-500"></span>
						{learnMore}
					</span>
				</a>
			</motion.p>
			<motion.button
				initial={{ y: 10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.9 }}
				className="text-sm tracking-wide duration-300 border rounded-md w-52 h-14 font-titleFont border-textGreen dark:border-textDark text-textGreen dark:text-textDark hover:bg-hoverColor hover:dark:bg-textLight"
				onClick={() => window.open("https://github.com/YoussefNesafe", "_balnk")}
			>
				{checkOut}
			</motion.button>
		</section>
	);
}

export default Banner;
