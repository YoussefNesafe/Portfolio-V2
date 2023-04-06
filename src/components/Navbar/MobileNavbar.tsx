const MobileNavbar = () => (
	<div className="flex flex-col items-center justify-between w-6 h-5 overflow-hidden text-4xl cursor-pointer mdl:hidden text-textGreen group">
		<span className="w-full h-[2px] bg-textGreen inline-flex transform group-hover:translate-x-2 transition-all ease-in-out duration-300"></span>
		<span className="w-full h-[2px] bg-textGreen inline-flex transform translate-x-3 group-hover:translate-x-0 transition-all ease-in-out duration-300"></span>
		<span className="w-full h-[2px] bg-textGreen inline-flex transform translate-x-1 group-hover:translate-x-3 transition-all ease-in-out duration-300"></span>
	</div>
);
export default MobileNavbar;
