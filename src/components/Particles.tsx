import { useCallback, useEffect } from "react";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useTheme } from "next-themes";

const ParticlesBG = () => {
	const { theme } = useTheme();
	const iconsColor = theme === "light" ? "#64ffda" : "#0A192f";
	const particlesInit = useCallback(async (engine: Engine) => {
		console.log(engine);

		// you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
		// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
		// starting from v2 you can add only the features you need reducing the bundle size
		await loadFull(engine);
	}, []);
	const particlesLoaded = useCallback(async (container: Container | undefined) => {
		await console.log(container);
	}, []);
	return (
		<Particles
			id="tsparticles"
			init={particlesInit}
			loaded={particlesLoaded}
			options={{
				interactivity: {
					events: {
						onClick: {
							enable: true,
							mode: "push",
						},
						onHover: {
							enable: true,
							mode: "repulse",
						},
						resize: true,
					},
					modes: {
						push: {
							quantity: 1,
						},
					},
				},
				fpsLimit: 10,
				particles: {
					color: {
						value: iconsColor,
					},

					collisions: {
						enable: true,
					},
					move: {
						direction: "none",
						enable: true,
						outModes: {
							default: "bounce",
						},
						random: true,
						speed: 1,
						straight: false,
					},
					number: {
						density: {
							enable: true,
							area: 600,
						},
						value: 30,
					},
					opacity: {
						value: 0.2,
					},
					shape: {
						type: ["circle", "triangle", "star", "polygon"],
					},
					size: {
						value: { min: 5, max: 8 },
					},
				},
				detectRetina: true,
			}}
		/>
	);
};

export default ParticlesBG;
