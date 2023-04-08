import React from "react";
import { SOCIAL_MEDIA_LINKS } from "./MainLayout/MainLayoutContent";

const Footer = () => {
	return (
		<div className="inline-flex items-center justify-center w-full gap-4 py-6 xl:hidden">
			{SOCIAL_MEDIA_LINKS.map((link) => (
				<a href={link?.url} target="_blank" key={link.url}>
					<span className="inline-flex items-center justify-center w-10 h-10 text-xl transition-all duration-300 rounded-full cursor-pointer bg-hoverColor hover:text-textGreen hover:-translate-y-2">
						{link.icon}
					</span>
				</a>
			))}
		</div>
	);
};

export default Footer;
