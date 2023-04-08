import About from "@/components/About";
import Banner from "@/components/Banner";
import EmailSection from "@/components/MainLayout/EmailSection";
import MainSection from "@/components/MainLayout/MainSection";
import SocialMediaSection from "@/components/MainLayout/SocialMediaSection";
import Navbar from "@/components/Navbar";
import Experience from "@/components/Experience";
import Head from "next/head";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
	return (
		<>
			<Head>
				<title>Youssef Nessafe</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/logo.png" />
			</Head>
			<main className="w-full h-screen overflow-x-hidden overflow-y-scroll font-bodyFont bg-bodyColor text-textLight scrollbar scrollbar-track-textDark/20 scrollbar-thumb-textDark/60">
				<Navbar />
				<div className="w-full h-[88vh] xl:flex items-center gap-20 justify-between">
					<SocialMediaSection />
					<MainSection>
						<Banner />
						<About />
						<Experience />
						<Projects />
						<Contact />
						<Footer />
					</MainSection>
					<EmailSection />
				</div>
			</main>
		</>
	);
}
