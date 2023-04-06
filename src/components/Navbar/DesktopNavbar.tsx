import { fillNumberWithZeros } from "@/utils";
import { NAVBAR_CONTENT } from "./navbarContent";
import { motion } from "framer-motion";
import Link from "next/link";

const DesktopNavbar = () => (
	<div className="items-center hidden mdl:inline-flex gap-7">
		<ul className="flex text-[14px] gap-7">
			{NAVBAR_CONTENT.map((item, index) => (
				<Link
					key={`nav-item-${index}`}
					href={item?.url}
					className="flex items-center gap-1 font-medium duration-300 cursor-pointer text-textDark hover:text-textGreen nav-link"
				>
					{index !== 0 ? (
						<motion.span
							initial={{ y: -10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.2, delay: +`0.${index + 2}` }}
						>
							{fillNumberWithZeros({ number: index, length: 2 })}.
						</motion.span>
					) : (
						<></>
					)}
					<motion.li
						initial={{ y: -10, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.2, delay: +`0.${index + 2}` }}
					>
						{item?.title}
					</motion.li>
				</Link>
			))}
		</ul>
		<a href="/assets/Resume.pdf" target="_blank">
			<motion.button
				initial={{ y: -10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.2, delay: +`0.${NAVBAR_CONTENT.length + 2}` }}
				className="px-4 py-2 rounded-md text-textGreen text-[14px] border border-textGreen hover:bg-hoverColor duration-300"
			>
				Resume
			</motion.button>
		</a>
	</div>
);

export default DesktopNavbar;
