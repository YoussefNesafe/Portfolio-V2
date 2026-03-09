"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiExternalLink,
} from "react-icons/fi";
import {
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IContactSection } from "@/app/models/Contact";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import type { IconType } from "react-icons";

const iconMap: Record<string, IconType> = {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
};

// Rest positions for floating cards (percentage-based within container)
const REST_POSITIONS = [
  { x: 12, y: 15 },
  { x: 62, y: 8 },
  { x: 8, y: 60 },
  { x: 58, y: 55 },
];

const SINE_PHASES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
const SINE_AMPLITUDE = 8;
const SINE_SPEED = 0.002;
const ATTRACTION_STRENGTH = 0.06;
const COLLISION_DISTANCE = 140;
const COLLISION_FORCE = 0.4;

interface RippleState {
  x: number;
  y: number;
  id: number;
}

function FloatingCard({
  item,
  index,
  cursorX,
  cursorY,
  containerRef,
  isContainerHovered,
}: {
  item: IContactSection["items"][number];
  index: number;
  cursorX: ReturnType<typeof useMotionValue<number>>;
  cursorY: ReturnType<typeof useMotionValue<number>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isContainerHovered: boolean;
}) {
  const Icon = iconMap[item.icon];
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const rippleIdRef = useRef(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 60, damping: 20, mass: 1.2 });
  const springY = useSpring(y, { stiffness: 60, damping: 20, mass: 1.2 });

  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }
    const animate = () => {
      const container = containerRef.current;
      if (!container) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const sineOffset =
        Math.sin(elapsed * SINE_SPEED + SINE_PHASES[index]) * SINE_AMPLITUDE;

      const rect = container.getBoundingClientRect();
      const restPx = {
        x: (REST_POSITIONS[index].x / 100) * rect.width,
        y: (REST_POSITIONS[index].y / 100) * rect.height,
      };

      let targetX = restPx.x;
      let targetY = restPx.y + sineOffset;

      if (isContainerHovered && !isHovered) {
        const cx = cursorX.get() - rect.left;
        const cy = cursorY.get() - rect.top;

        const dx = cx - targetX;
        const dy = cy - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 10) {
          targetX += dx * ATTRACTION_STRENGTH;
          targetY += dy * ATTRACTION_STRENGTH;
        }

        // Collision avoidance with other cards
        REST_POSITIONS.forEach((otherPos, otherIdx) => {
          if (otherIdx === index) return;
          const otherPx = {
            x: (otherPos.x / 100) * rect.width,
            y: (otherPos.y / 100) * rect.height,
          };
          const cdx = targetX - otherPx.x;
          const cdy = targetY - otherPx.y;
          const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cDist < COLLISION_DISTANCE && cDist > 0) {
            const pushForce =
              ((COLLISION_DISTANCE - cDist) / COLLISION_DISTANCE) *
              COLLISION_FORCE;
            targetX += (cdx / cDist) * pushForce * COLLISION_DISTANCE;
            targetY += (cdy / cDist) * pushForce * COLLISION_DISTANCE;
          }
        });
      }

      if (isHovered) {
        // Keep card at current position when hovered
      } else {
        x.set(targetX);
        y.set(targetY);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    isContainerHovered,
    isHovered,
    index,
    cursorX,
    cursorY,
    containerRef,
    x,
    y,
  ]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;
      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev, { x: rippleX, y: rippleY, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    },
    []
  );

  const cardContent = (
    <>
      <div
        className={`
          relative
          p-[2.667vw] tablet:p-[1.25vw] desktop:p-[0.521vw]
          rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw]
          bg-accent-cyan/10 text-accent-cyan
          transition-all duration-300
          ${isHovered ? "animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.4)]" : ""}
        `}
      >
        {Icon && (
          <Icon className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
        )}
        {isHovered && (
          <span className="absolute inset-0 rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.052vw] border-accent-cyan/50 animate-ping" />
        )}
      </div>
      <div>
        <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted mb-[0.533vw] tablet:mb-[0.25vw] desktop:mb-[0.104vw]">
          {item.type}
        </p>
        <p className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-foreground group-hover:text-accent-cyan transition-colors flex items-center gap-[1.067vw] tablet:gap-[0.5vw] desktop:gap-[0.208vw]">
          {item.value}
          {item.href !== "#" && (
            <FiExternalLink className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </p>
      </div>
    </>
  );

  const linkClassName =
    "flex items-start gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw] group";

  const cardInner = item.href.startsWith("http") ? (
    <Link
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClassName}
    >
      {cardContent}
    </Link>
  ) : (
    <a href={item.href} className={linkClassName}>
      {cardContent}
    </a>
  );

  return (
    <motion.div
      ref={cardRef}
      style={{ x: springX, y: springY }}
      className="absolute top-0 left-0 w-[40vw] tablet:w-[22vw] desktop:w-[12.5vw] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      animate={{
        scale: isHovered ? 1.05 : 1,
        boxShadow: isHovered
          ? "0 20px 40px rgba(6, 182, 212, 0.15), 0 0 30px rgba(6, 182, 212, 0.1)"
          : "0 4px 12px rgba(0, 0, 0, 0.2)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="relative overflow-hidden rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] border border-white/10 bg-white/5 backdrop-blur-[16px] p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] transition-all duration-300">
        {cardInner}
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-accent-cyan/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              transform: "translate(-50%, -50%)",
              animation: "contact-ripple 600ms ease-out forwards",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function MobileCard({
  item,
}: {
  item: IContactSection["items"][number];
}) {
  const Icon = iconMap[item.icon];
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const rippleIdRef = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev, { x: rippleX, y: rippleY, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  const cardContent = (
    <>
      <div className="p-[2.667vw] tablet:p-[1.25vw] rounded-[2.133vw] tablet:rounded-[1vw] bg-accent-cyan/10 text-accent-cyan group-hover:bg-accent-cyan/20 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 shrink-0">
        {Icon && (
          <Icon className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw]" />
        )}
      </div>
      <div>
        <p className="text-[3.2vw] tablet:text-[1.5vw] text-text-muted mb-[0.533vw] tablet:mb-[0.25vw]">
          {item.type}
        </p>
        <p className="text-[3.733vw] tablet:text-[1.75vw] text-foreground group-hover:text-accent-cyan transition-colors flex items-center gap-[1.067vw] tablet:gap-[0.5vw]">
          {item.value}
          {item.href !== "#" && (
            <FiExternalLink className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </p>
      </div>
    </>
  );

  const linkClassName =
    "flex items-start gap-[3.2vw] tablet:gap-[1.5vw] group";

  return (
    <motion.div variants={fadeUp} onClick={handleClick}>
      <div className="relative overflow-hidden rounded-[2.667vw] tablet:rounded-[1.25vw] border border-white/10 bg-white/5 backdrop-blur-[16px] p-[5.333vw] tablet:p-[2.5vw] transition-all duration-300 hover:border-accent-cyan/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        {item.href.startsWith("http") ? (
          <Link
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {cardContent}
          </Link>
        ) : (
          <a href={item.href} className={linkClassName}>
            {cardContent}
          </a>
        )}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-accent-cyan/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              transform: "translate(-50%, -50%)",
              animation: "contact-ripple 600ms ease-out forwards",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function ContactSection(props: IContactSection) {
  const isMobile = useIsMobile(480);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    },
    [cursorX, cursorY]
  );

  return (
    <Section id="contact">
      <div ref={sectionRef}>
        <SectionHeading label={props.sectionLabel} title={props.title} />

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] text-text-muted mb-[8.533vw] tablet:mb-[4vw] desktop:mb-[1.667vw] max-w-[160vw] tablet:max-w-[75vw] desktop:max-w-[31.25vw]"
        >
          {props.description}
        </motion.p>

        {/* Desktop: Floating cards with gravity physics */}
        {!isMobile ? (
          <motion.div
            ref={containerRef}
            className="relative w-full h-[50vw] tablet:h-[30vw] desktop:h-[20.833vw] mb-[8.533vw] tablet:mb-[4vw] desktop:mb-[1.667vw]"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsContainerHovered(true)}
            onMouseLeave={() => setIsContainerHovered(false)}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {props.items.map((item, index) => (
              <FloatingCard
                key={item.type}
                item={item}
                index={index}
                cursorX={cursorX}
                cursorY={cursorY}
                containerRef={containerRef}
                isContainerHovered={isContainerHovered}
              />
            ))}
          </motion.div>
        ) : (
          /* Mobile: 2x2 grid */
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-[4.267vw] tablet:gap-[2vw] mb-[8.533vw] tablet:mb-[4vw]"
          >
            {props.items.map((item) => (
              <MobileCard key={item.type} item={item} />
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="text-center"
        >
          <p className="text-[5.333vw] tablet:text-[2.5vw] desktop:text-[1.25vw] text-foreground mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw] font-medium">
            Let&apos;s work together
          </p>
          <a
            href={props.ctaHref}
            className="group relative inline-block text-[4.267vw] tablet:text-[2vw] desktop:text-[0.938vw] text-accent-cyan font-medium transition-colors hover:text-accent-purple"
          >
            {props.ctaLabel}
            <span className="absolute bottom-[-0.267vw] tablet:bottom-[-0.125vw] desktop:bottom-[-0.052vw] left-0 h-[0.533vw] tablet:h-[0.25vw] desktop:h-[0.104vw] w-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
          </a>
        </motion.div>
      </div>

    </Section>
  );
}
