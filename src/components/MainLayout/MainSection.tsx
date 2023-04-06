import { FC, ReactNode } from "react";
interface MainSectionProps {
	children?: ReactNode;
}
const MainSection: FC<MainSectionProps> = ({ children }) => {
	return <div className=" h-[88vh] mx-auto p-4 ">{children}</div>;
};

export default MainSection;
