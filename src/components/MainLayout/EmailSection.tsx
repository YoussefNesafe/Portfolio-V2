import { motion } from "framer-motion";
const EmailSection = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 1.5 }}
			className="fixed bottom-0 right-0 hidden w-32 h-full xl:inline-flex"
		>
			<div className="flex flex-col items-center justify-end w-full h-full gap-6 text-textLight dark:text-bodyColor">
				<a href="mailto:ynessafe@gmail.com">
					<p className="text-sm tracking-wide rotate-90 w-72 text-textGreen dark:text-textDark">
						ynessafe@gmail.com
					</p>
				</a>
				<span className="w-[2px] h-32 bg-textDark"></span>
			</div>
		</motion.div>
	);
};

export default EmailSection;
