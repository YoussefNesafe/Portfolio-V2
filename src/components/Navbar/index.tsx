import Image from "next/image";
import React from "react";
import logo from "/public/logo.png";

import Link from "next/link";
import { NAVBAR_CONTENT } from "./navbarContent";
import { fillNumberWithZeros } from "@/utils";
import { motion } from "framer-motion";

function Navbar() {
	return (
		<div className="w-full shadow-navbarShadow h-20 lg:h-[12vh] sticky top-0 z-50 bg-bodyColor px-4">
			<div className="max-w-container h-full mx-auto py-1 font-titleFont flex items-center justify-between">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<Image className="w-14" src={logo} alt="Logo" />
				</motion.div>
				<div className="hidden mdl:inline-flex items-center gap-7">
					<ul className="flex text-[14px] gap-7">
						{NAVBAR_CONTENT.map((item, index) => (
							<Link
								key={`nav-item-${index}`}
								href={item?.url}
								className="flex items-center gap-1 font-medium text-textDark hover:text-textGreen cursor-pointer duration-300 nav-link"
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
			</div>
		</div>
	);
}

export default Navbar;
