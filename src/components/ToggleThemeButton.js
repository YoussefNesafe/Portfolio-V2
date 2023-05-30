import { useTheme } from "next-themes";
import { RxMoon } from "react-icons/rx";
import { TbSunHigh } from "react-icons/tb";

function ToggleThemeButton() {
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark";
	const RenderIcon = () =>
		isDark ? (
			<RxMoon size={40} className="text-yellow-100" />
		) : (
			<TbSunHigh size={40} className="text-yellow-600" />
		);
	return (
		<div onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
			<RenderIcon />
		</div>
	);
}

export default ToggleThemeButton;
