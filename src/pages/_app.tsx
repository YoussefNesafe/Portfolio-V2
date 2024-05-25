import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider enableSystem={false} attribute="class" defaultTheme="light">
			<Component {...pageProps} />
			<Analytics />{" "}
		</ThemeProvider>
	);
}
