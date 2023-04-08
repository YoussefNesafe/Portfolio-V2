import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MdOutlineClose } from "react-icons/md";
import { NAVBAR_CONTENT } from "@/ContentData/navbarContent";
import { fillNumberWithZeros } from "@/utils";
import Link from "next/link";
import { SOCIAL_MEDIA_LINKS } from "@/ContentData/MainLayoutContent";
const MobileNavbar = () => {
	const ref = useRef<string | any>("");
	const [showMenu, setShowMenu] = useState(false);
	const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		e.preventDefault();
		const href = e.currentTarget.href;
		const targetId = href.replace(/.*\#/, "");
		const elem = document.getElementById(targetId);
		elem?.scrollIntoView({
			behavior: "smooth",
		});
		// Update the class name of the clicked link
		const links = document.querySelectorAll(".nav-link");
		links.forEach((link) => {
			link.classList.remove("active");
		});
		e.currentTarget.classList.add("active");
	};
	return (
		<>
			<div
				onClick={() => setShowMenu((prev) => !prev)}
				className="flex flex-col items-center justify-between w-6 h-5 overflow-hidden text-4xl cursor-pointer mdl:hidden text-textGreen group"
			>
				<span className="w-full h-[2px] bg-textGreen inline-flex transform group-hover:translate-x-2 transition-all ease-in-out duration-300"></span>
				<span className="w-full h-[2px] bg-textGreen inline-flex transform translate-x-3 group-hover:translate-x-0 transition-all ease-in-out duration-300"></span>
				<span className="w-full h-[2px] bg-textGreen inline-flex transform translate-x-1 group-hover:translate-x-3 transition-all ease-in-out duration-300"></span>
			</div>
			{showMenu ? (
				<div
					ref={(node) => (ref.current = node)}
					onClick={() => setShowMenu((prev) => !prev)}
					className="absolute top-0 right-0 flex flex-col items-end w-full h-screen bg-black bg-opacity-50 mdl:hidden"
				>
					<motion.div
						initial={{ x: 500, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="w-[80%] h-full overflow-y-scroll scrollbarHide bg-[#112240] flex flex-col items-center px-4 py-10 relative"
					>
						<MdOutlineClose
							onClick={(e) => {
								e.stopPropagation();
								setShowMenu((prev) => !prev);
							}}
							className="absolute text-3xl cursor-pointer text-textGreen hover:text-red-500 top-4 right-4"
						/>
						<div className="flex flex-col items-center gap-7">
							<ul className="flex flex-col text-base gap-7">
								{NAVBAR_CONTENT.map((item, index) => (
									<Link
										key={`nav-item-${index}`}
										href={item?.url}
										className="flex items-center gap-1 font-medium duration-300 cursor-pointer text-textDark hover:text-textGreen nav-link"
										onClick={handleScroll}
									>
										{index !== 0 ? (
											<motion.span
												initial={{ x: 30, opacity: 0 }}
												animate={{ x: 0, opacity: 1 }}
												transition={{
													duration: 0.3,
													delay: +`0.${index + 1}`,
													ease: "easeIn",
												}}
												className="text-textGreen"
											>
												{fillNumberWithZeros({ number: index, length: 2 })}.
											</motion.span>
										) : (
											<></>
										)}
										<motion.li
											initial={{ x: 30, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											transition={{
												duration: 0.3,
												delay: +`0.${index + 1}`,
												ease: "easeIn",
											}}
										>
											{item?.title}
										</motion.li>
									</Link>
								))}
							</ul>
							<a href="/assets/Resume.pdf" target="_blank">
								<motion.button
									initial={{ y: -20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration: 0.3,
										delay: +`0.${NAVBAR_CONTENT.length + 1}`,
										ease: "easeIn",
									}}
									className="px-4 py-2 rounded-md text-textGreen text-[14px] border border-textGreen hover:bg-hoverColor duration-300"
								>
									Resume
								</motion.button>
							</a>
							<div className="inline-flex items-center justify-center w-full gap-4 ">
								{SOCIAL_MEDIA_LINKS.map((link, index) => {
									return (
										<motion.a
											initial={{ y: -20, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{
												duration: 0.3,
												delay: +`0.${NAVBAR_CONTENT.length + 1 + index}`,
												ease: "easeIn",
											}}
											href={link?.url}
											target="_blank"
											key={link.url}
										>
											<span className="inline-flex items-center justify-center w-10 h-10 text-xl transition-all duration-300 rounded-full cursor-pointer bg-hoverColor hover:text-textGreen hover:-translate-y-2">
												{link.icon}
											</span>
										</motion.a>
									);
								})}
							</div>
							<motion.a
								initial={{ y: -20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{
									duration: 0.3,
									delay: 1.1,
									ease: "easeIn",
								}}
								href="mailto:ynessafe@gmail.com"
								className="text-sm tracking-widest text-center w-72 text-textGreen"
							>
								<p>ynessafe@gmail.com</p>
							</motion.a>
						</div>
					</motion.div>
				</div>
			) : (
				<></>
			)}
		</>
	);
};
export default MobileNavbar;
