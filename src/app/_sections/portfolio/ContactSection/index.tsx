"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiExternalLink,
} from "react-icons/fi";
import {
  fadeLeft,
  fadeRight,
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IContactSection } from "@/app/models/Contact";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlowCard from "@/app/components/ui/GlowCard";
import Terminal from "@/app/components/ui/Terminal";
import type { IconType } from "react-icons";

const iconMap: Record<string, IconType> = {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
};

export default function ContactSection(props: IContactSection) {
  return (
    <Section id="contact">
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

      <div className="flex flex-col desktop:flex-row gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[1.667vw] items-center">
        {/* Contact cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          className="desktop:w-[50%] grid grid-cols-1 tablet:grid-cols-2 gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw] h-fit"
        >
          {props.items.map((item) => {
            const Icon = iconMap[item.icon];
            const cardContent = (
              <>
                <div className="p-[2.667vw] tablet:p-[1.25vw] desktop:p-[0.521vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] bg-accent-cyan/10 text-accent-cyan group-hover:bg-accent-cyan/20 transition-colors shrink-0">
                  {Icon && (
                    <Icon className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
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
            const className = "flex items-start gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw] group";
            return (
              <motion.div key={item.type} variants={fadeLeft}>
                <GlowCard>
                  {item.href.startsWith("http") ? (
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <a href={item.href} className={className}>
                      {cardContent}
                    </a>
                  )}
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Terminal CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeRight}
          className="desktop:w-[50%]"
        >
          <Terminal title="contact.ts">
            <p className="text-accent-purple">{props.terminal.command}</p>
            {props.terminal.lines.map((line, i) => (
              <p key={i} className="text-foreground">
                {line}
              </p>
            ))}
          </Terminal>
        </motion.div>
      </div>
    </Section>
  );
}
