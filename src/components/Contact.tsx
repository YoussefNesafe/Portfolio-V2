import React from "react";
import { CONTACT_CONTENT } from "@/ContentData/contactContent";

const Contact = () => {
	const {
		titleSection: { title, number },
		describtion,
		mainTitle,
		sayHiBtn,
	} = CONTACT_CONTENT || {};
	return (
		<section
			id="contact"
			className="flex flex-col items-center justify-center gap-4 py-10 mx-auto max-w-contentContainer xl:py-32"
		>
			<p className="flex items-center text-lg font-semibold tracking-wide font-titleFont text-textGreen">
				{number}. {title}
			</p>
			<h2 className="text-5xl font-semibold font-titleFont">{mainTitle}</h2>
			<p className="max-w-[600px] text-center text-textDark">{describtion}</p>
			<a href="mailto:ynessafe@gmail.com">
				<button className="w-40 mt-6 text-sm tracking-wider duration-300 border rounded-md h-14 border-textGreen font-titleFont text-textGreen hover:bg-hoverColor">
					{sayHiBtn}
				</button>
			</a>
		</section>
	);
};

export default Contact;
