import Image from "next/image";
import React from "react";
import logo from "/public/logo.png";

import { motion } from "framer-motion";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

const Navbar = () => {
	return (
		<div className="w-full shadow-navbarShadow h-20 lg:h-[12vh] sticky top-0 z-50 bg-bodyColor px-4">
			<div className="flex items-center justify-between h-full py-1 mx-auto max-w-container font-titleFont">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<Image className="w-14" src={logo} alt="Logo" />
				</motion.div>
				<DesktopNavbar />
				<MobileNavbar />
			</div>
		</div>
	);
};

export default Navbar;
