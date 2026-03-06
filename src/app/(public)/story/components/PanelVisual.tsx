"use client";

interface PanelVisualProps {
  visual: string;
  accentColor: string;
}

export default function PanelVisual({ visual, accentColor }: PanelVisualProps) {
  switch (visual) {
    case "code-editor":
      return <CodeEditorVisual color={accentColor} />;
    case "tech-orbit":
      return <TechOrbitVisual color={accentColor} />;
    case "skill-cards":
      return <SkillCardsVisual color={accentColor} />;
    case "dashboard-sketch":
      return <DashboardSketchVisual color={accentColor} />;
    case "browser-sketch":
      return <BrowserSketchVisual color={accentColor} />;
    case "project-montage":
      return <ProjectMontageVisual color={accentColor} />;
    case "horizon":
      return <HorizonVisual color={accentColor} />;
    case "cta":
      return <CtaVisual color={accentColor} />;
    default:
      return null;
  }
}

/* Developer character sitting at desk with glowing monitor */
function CodeEditorVisual({ color }: { color: string }) {
  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox="0 0 400 280"
        fill="none"
        className="w-[70vw] tablet:w-[35vw] desktop:w-[18.229vw]"
        style={{ filter: `drop-shadow(0 0 20px ${color}30)` }}
      >
        {/* Desk */}
        <path d="M60 220 L340 220 L350 240 L50 240 Z" fill={`${color}15`} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="80" y1="240" x2="70" y2="270" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="320" y1="240" x2="330" y2="270" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

        {/* Monitor */}
        <rect x="120" y="100" width="160" height="110" rx="6" fill="#12121a" stroke={color} strokeWidth="2" />
        <rect x="130" y="108" width="140" height="90" rx="3" fill={`${color}08`} />
        {/* Monitor stand */}
        <path d="M185 210 L215 210 L210 220 L190 220 Z" fill={`${color}20`} stroke={color} strokeWidth="1" />

        {/* Code lines on screen */}
        <line x1="140" y1="120" x2="195" y2="120" stroke={`${color}80`} strokeWidth="2" strokeLinecap="round" />
        <line x1="148" y1="132" x2="220" y2="132" stroke={`${color}50`} strokeWidth="2" strokeLinecap="round" />
        <line x1="148" y1="144" x2="200" y2="144" stroke={`${color}35`} strokeWidth="2" strokeLinecap="round" />
        <line x1="156" y1="156" x2="235" y2="156" stroke={`${color}50`} strokeWidth="2" strokeLinecap="round" />
        <line x1="148" y1="168" x2="180" y2="168" stroke={`${color}35`} strokeWidth="2" strokeLinecap="round" />
        <line x1="140" y1="180" x2="175" y2="180" stroke={`${color}80`} strokeWidth="2" strokeLinecap="round" />

        {/* Blinking cursor */}
        <rect x="180" y="176" width="2" height="10" fill={color} opacity="0.9">
          <animate attributeName="opacity" values="0.9;0;0.9" dur="1.2s" repeatCount="indefinite" />
        </rect>

        {/* Screen glow */}
        <rect x="130" y="108" width="140" height="90" rx="3" fill={color} opacity="0.03" />

        {/* Developer character — head */}
        <circle cx="80" cy="145" r="18" fill="#1A1A2E" stroke={color} strokeWidth="1.5" />
        {/* Hair */}
        <path d="M62 140 Q65 120 80 118 Q95 120 98 140" fill={`${color}25`} stroke={color} strokeWidth="1" />
        {/* Glasses */}
        <circle cx="74" cy="147" r="5" fill="none" stroke={color} strokeWidth="1.2" />
        <circle cx="86" cy="147" r="5" fill="none" stroke={color} strokeWidth="1.2" />
        <line x1="79" y1="147" x2="81" y2="147" stroke={color} strokeWidth="1" />
        {/* Eyes behind glasses */}
        <circle cx="74" cy="147" r="1.5" fill={color} />
        <circle cx="86" cy="147" r="1.5" fill={color} />
        {/* Smile */}
        <path d="M74 155 Q80 159 86 155" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" />

        {/* Body */}
        <path d="M62 163 Q60 185 55 210 L105 210 Q100 185 98 163" fill={`${color}12`} stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        {/* Hoodie detail */}
        <path d="M72 168 L80 178 L88 168" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

        {/* Arms reaching to keyboard */}
        <path d="M62 180 Q50 195 55 210 L145 220" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M98 180 Q110 195 105 210 L255 220" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

        {/* Keyboard on desk */}
        <rect x="130" y="220" width="140" height="8" rx="2" fill={`${color}10`} stroke={color} strokeWidth="0.8" />
        {/* Keys */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect key={i} x={138 + i * 14} y={222} width="10" height="4" rx="0.5" fill={`${color}20`} />
        ))}

        {/* Coffee mug */}
        <rect x="310" y="205" width="18" height="15" rx="2" fill="none" stroke={color} strokeWidth="1" />
        <path d="M328 210 Q335 210 335 215 Q335 220 328 220" fill="none" stroke={color} strokeWidth="0.8" />
        {/* Steam */}
        <path d="M316 200 Q314 193 318 188" fill="none" stroke={`${color}40`} strokeWidth="0.8" strokeLinecap="round">
          <animate attributeName="d" values="M316 200 Q314 193 318 188;M316 200 Q318 193 314 186;M316 200 Q314 193 318 188" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M322 200 Q320 194 323 190" fill="none" stroke={`${color}30`} strokeWidth="0.8" strokeLinecap="round">
          <animate attributeName="d" values="M322 200 Q320 194 323 190;M322 200 Q324 194 321 188;M322 200 Q320 194 323 190" dur="2.5s" repeatCount="indefinite" />
        </path>

        {/* Thought bubbles */}
        <circle cx="55" cy="115" r="4" fill={`${color}15`} stroke={color} strokeWidth="0.6" />
        <circle cx="45" cy="100" r="6" fill={`${color}15`} stroke={color} strokeWidth="0.6" />
        <ellipse cx="35" cy="80" rx="22" ry="14" fill={`${color}10`} stroke={color} strokeWidth="0.8" />
        <text x="35" y="84" textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace">&lt;/&gt;</text>
      </svg>
    </div>
  );
}

/* Developer surrounded by orbiting tech logos */
function TechOrbitVisual({ color }: { color: string }) {
  const techs = [
    { label: "React", angle: 0 },
    { label: "TS", angle: 60 },
    { label: "Next", angle: 120 },
    { label: "Node", angle: 180 },
    { label: "SQL", angle: 240 },
    { label: "CSS", angle: 300 },
  ];

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox="0 0 300 300"
        fill="none"
        className="w-[60vw] tablet:w-[30vw] desktop:w-[15.625vw]"
        style={{ filter: `drop-shadow(0 0 15px ${color}20)` }}
      >
        {/* Orbit rings */}
        <circle cx="150" cy="150" r="110" fill="none" stroke={`${color}15`} strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="150" cy="150" r="80" fill="none" stroke={`${color}10`} strokeWidth="1" strokeDasharray="3 5" />

        {/* Center character — developer bust */}
        <circle cx="150" cy="140" r="30" fill="#1A1A2E" stroke={color} strokeWidth="1.5" />
        {/* Hair */}
        <path d="M120 133 Q125 108 150 105 Q175 108 180 133" fill={`${color}20`} stroke={color} strokeWidth="1" />
        {/* Glasses */}
        <circle cx="141" cy="142" r="7" fill="none" stroke={color} strokeWidth="1.2" />
        <circle cx="159" cy="142" r="7" fill="none" stroke={color} strokeWidth="1.2" />
        <line x1="148" y1="142" x2="152" y2="142" stroke={color} strokeWidth="1" />
        {/* Eyes */}
        <circle cx="141" cy="142" r="2" fill={color} />
        <circle cx="159" cy="142" r="2" fill={color} />
        {/* Smile */}
        <path d="M142 152 Q150 158 158 152" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" />

        {/* Body/shoulders */}
        <path d="M120 170 Q115 190 110 200 L190 200 Q185 190 180 170" fill={`${color}12`} stroke={color} strokeWidth="1.2" />

        {/* Orbiting tech labels */}
        {techs.map((tech) => {
          const rad = (tech.angle * Math.PI) / 180;
          const x = 150 + 110 * Math.cos(rad);
          const y = 150 + 110 * Math.sin(rad);
          return (
            <g key={tech.label}>
              <circle cx={x} cy={y} r="18" fill={`${color}12`} stroke={color} strokeWidth="1">
                <animate attributeName="r" values="18;20;18" dur="3s" begin={`${tech.angle / 60 * 0.5}s`} repeatCount="indefinite" />
              </circle>
              <text x={x} y={y + 4} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">
                {tech.label}
              </text>
            </g>
          );
        })}

        {/* Connection lines from center */}
        {techs.map((tech) => {
          const rad = (tech.angle * Math.PI) / 180;
          const x = 150 + 110 * Math.cos(rad);
          const y = 150 + 110 * Math.sin(rad);
          return (
            <line
              key={`line-${tech.label}`}
              x1="150" y1="150"
              x2={x} y2={y}
              stroke={`${color}10`}
              strokeWidth="0.5"
              strokeDasharray="3 4"
            />
          );
        })}
      </svg>
    </div>
  );
}

/* Three skill cards with icons */
function SkillCardsVisual({ color }: { color: string }) {
  const skills = [
    {
      title: "Frontend",
      icon: (
        <path d="M8 4 L2 12 L8 20 M16 4 L22 12 L16 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ),
      items: ["React", "Next.js", "TypeScript"],
    },
    {
      title: "Backend",
      icon: (
        <g>
          <rect x="4" y="4" width="16" height="5" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
          <rect x="4" y="11" width="16" height="5" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="7" cy="6.5" r="1" fill={color} />
          <circle cx="7" cy="13.5" r="1" fill={color} />
        </g>
      ),
      items: ["Node.js", "PostgreSQL", "Prisma"],
    },
    {
      title: "Design",
      icon: (
        <g>
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M12 4 L12 12 L18 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      ),
      items: ["Tailwind", "Framer", "Responsive"],
    },
  ];

  return (
    <div className="flex gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw] flex-wrap justify-center">
      {skills.map((skill) => (
        <div
          key={skill.title}
          className="flex flex-col items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] px-[4.267vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[3.2vw] tablet:py-[1.5vw] desktop:py-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] border"
          style={{ borderColor: `${color}25`, background: `${color}06` }}
        >
          <svg viewBox="0 0 24 24" className="w-[6.4vw] h-[6.4vw] tablet:w-[3vw] tablet:h-[3vw] desktop:w-[1.25vw] desktop:h-[1.25vw]">
            {skill.icon}
          </svg>
          <span
            className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-semibold"
            style={{ color }}
          >
            {skill.title}
          </span>
          <div className="flex flex-col items-center gap-[0.533vw] tablet:gap-[0.25vw] desktop:gap-[0.104vw]">
            {skill.items.map((item) => (
              <span
                key={item}
                className="text-[2.4vw] tablet:text-[1.125vw] desktop:text-[0.469vw] text-text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Developer presenting a dashboard wireframe */
function DashboardSketchVisual({ color }: { color: string }) {
  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox="0 0 400 240"
        fill="none"
        className="w-[70vw] tablet:w-[35vw] desktop:w-[18.229vw]"
        style={{ filter: `drop-shadow(0 0 15px ${color}20)` }}
      >
        {/* Whiteboard / canvas */}
        <rect x="100" y="20" width="280" height="180" rx="4" fill={`${color}05`} stroke={color} strokeWidth="1.5" />

        {/* Dashboard wireframe on board */}
        {/* Header bar */}
        <rect x="115" y="35" width="250" height="15" rx="2" fill={`${color}12`} />
        <circle cx="125" cy="42.5" r="4" fill={`${color}25`} />
        <line x1="135" y1="42.5" x2="180" y2="42.5" stroke={`${color}30`} strokeWidth="2" strokeLinecap="round" />

        {/* Sidebar */}
        <rect x="115" y="55" width="50" height="130" rx="2" fill={`${color}08`} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="125" y1={70 + i * 22} x2="155" y2={70 + i * 22} stroke={`${color}20`} strokeWidth="2" strokeLinecap="round" />
        ))}

        {/* Cards area */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={175 + i * 65} y={55} width="55" height="35" rx="3" fill={`${color}10`} stroke={`${color}20`} strokeWidth="0.8" />
        ))}

        {/* Chart area */}
        <rect x="175" y="100" width="185" height="85" rx="3" fill={`${color}06`} stroke={`${color}15`} strokeWidth="0.8" />
        {/* Bar chart sketch */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const heights = [40, 55, 30, 65, 45, 70, 50];
          return (
            <rect
              key={i}
              x={190 + i * 22}
              y={185 - heights[i]}
              width="14"
              height={heights[i]}
              rx="1"
              fill={`${color}${15 + i * 3}`}
            />
          );
        })}

        {/* Developer character pointing at board */}
        {/* Head */}
        <circle cx="60" cy="100" r="20" fill="#1A1A2E" stroke={color} strokeWidth="1.5" />
        {/* Hair */}
        <path d="M40 94 Q43 75 60 72 Q77 75 80 94" fill={`${color}20`} stroke={color} strokeWidth="1" />
        {/* Glasses */}
        <circle cx="53" cy="102" r="6" fill="none" stroke={color} strokeWidth="1" />
        <circle cx="67" cy="102" r="6" fill="none" stroke={color} strokeWidth="1" />
        <line x1="59" y1="102" x2="61" y2="102" stroke={color} strokeWidth="1" />
        <circle cx="53" cy="102" r="1.5" fill={color} />
        <circle cx="67" cy="102" r="1.5" fill={color} />
        {/* Confident smile */}
        <path d="M52 112 Q60 117 68 112" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" />

        {/* Body */}
        <path d="M40 120 Q35 150 30 200 L90 200 Q85 150 80 120" fill={`${color}12`} stroke={color} strokeWidth="1.2" />

        {/* Arm pointing at board */}
        <path d="M80 140 Q95 125 110 110 L115 108" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        {/* Pointing hand */}
        <circle cx="116" cy="107" r="3" fill={`${color}25`} stroke={color} strokeWidth="0.8" />

        {/* Other arm relaxed */}
        <path d="M40 140 Q30 160 35 180" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* Developer looking at browser with code */
function BrowserSketchVisual({ color }: { color: string }) {
  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox="0 0 400 260"
        fill="none"
        className="w-[70vw] tablet:w-[35vw] desktop:w-[18.229vw]"
        style={{ filter: `drop-shadow(0 0 15px ${color}20)` }}
      >
        {/* Large browser window */}
        <rect x="80" y="30" width="280" height="190" rx="6" fill="#12121a" stroke={color} strokeWidth="1.5" />
        {/* Browser bar */}
        <rect x="80" y="30" width="280" height="25" rx="6" fill={`${color}10`} />
        <rect x="80" y="48" width="280" height="8" fill={`${color}10`} />
        {/* Dots */}
        <circle cx="95" cy="42.5" r="4" fill="#ef444460" />
        <circle cx="108" cy="42.5" r="4" fill="#eab30860" />
        <circle cx="121" cy="42.5" r="4" fill="#22c55e60" />
        {/* URL bar */}
        <rect x="140" y="37" width="150" height="12" rx="6" fill={`${color}08`} stroke={`${color}20`} strokeWidth="0.5" />
        <text x="165" y="46" fill={`${color}50`} fontSize="7" fontFamily="monospace">localhost:3000</text>

        {/* Website content */}
        {/* Hero section */}
        <rect x="95" y="65" width="120" height="8" rx="2" fill={`${color}30`} />
        <rect x="95" y="78" width="180" height="4" rx="1" fill={`${color}15`} />
        <rect x="95" y="86" width="150" height="4" rx="1" fill={`${color}10`} />
        {/* CTA button */}
        <rect x="95" y="98" width="60" height="14" rx="3" fill={`${color}25`} />
        <text x="110" y="108" fill={color} fontSize="6" fontFamily="monospace">Get Started</text>

        {/* Image placeholder */}
        <rect x="260" y="65" width="85" height="55" rx="3" fill={`${color}08`} stroke={`${color}15`} strokeWidth="0.5" />
        <path d="M285 85 L295 78 L310 95 L320 88 L335 100 L275 100 Z" fill={`${color}15`} />
        <circle cx="285" cy="78" r="5" fill={`${color}20`} />

        {/* Cards row */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={95 + i * 85} y={130} width="75" height="75" rx="3" fill={`${color}06`} stroke={`${color}12`} strokeWidth="0.5" />
            <rect x={100 + i * 85} y={135} width="65" height="30" rx="2" fill={`${color}10`} />
            <rect x={100 + i * 85} y={170} width="45" height="4" rx="1" fill={`${color}15`} />
            <rect x={100 + i * 85} y={178} width="55" height="4" rx="1" fill={`${color}10`} />
            <rect x={100 + i * 85} y={190} width="30" height="8" rx="2" fill={`${color}20`} />
          </g>
        ))}

        {/* Developer character on the side — smaller, looking at screen */}
        {/* Head */}
        <circle cx="40" cy="130" r="16" fill="#1A1A2E" stroke={color} strokeWidth="1.2" />
        <path d="M24 125 Q27 110 40 108 Q53 110 56 125" fill={`${color}20`} stroke={color} strokeWidth="0.8" />
        {/* Glasses looking right */}
        <circle cx="35" cy="132" r="5" fill="none" stroke={color} strokeWidth="1" />
        <circle cx="46" cy="132" r="5" fill="none" stroke={color} strokeWidth="1" />
        <line x1="40" y1="132" x2="41" y2="132" stroke={color} strokeWidth="0.8" />
        {/* Eyes looking right at screen */}
        <circle cx="37" cy="132" r="1.5" fill={color} />
        <circle cx="48" cy="132" r="1.5" fill={color} />
        {/* Thinking expression */}
        <path d="M36 140 Q40 143 45 140" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

        {/* Body */}
        <path d="M24 146 Q20 170 18 210 L62 210 Q60 170 56 146" fill={`${color}12`} stroke={color} strokeWidth="1" />
        {/* Arm */}
        <path d="M56 160 Q65 155 72 150" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* Multiple project screens arranged in a montage */
function ProjectMontageVisual({ color }: { color: string }) {
  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox="0 0 400 260"
        fill="none"
        className="w-[70vw] tablet:w-[35vw] desktop:w-[18.229vw]"
        style={{ filter: `drop-shadow(0 0 15px ${color}20)` }}
      >
        {/* Back screen (tilted left) */}
        <g transform="rotate(-8, 130, 130)">
          <rect x="30" y="40" width="180" height="130" rx="5" fill="#0e0e16" stroke={`${color}40`} strokeWidth="1" />
          <rect x="30" y="40" width="180" height="18" rx="5" fill={`${color}08`} />
          <rect x="30" y="55" width="180" height="3" fill={`${color}08`} />
          <circle cx="42" cy="49" r="3" fill={`${color}25`} />
          <circle cx="52" cy="49" r="3" fill={`${color}20`} />
          <circle cx="62" cy="49" r="3" fill={`${color}15`} />
          <rect x="42" y="68" width="80" height="6" rx="1" fill={`${color}20`} />
          <rect x="42" y="80" width="120" height="3" rx="1" fill={`${color}10`} />
          <rect x="42" y="88" width="100" height="3" rx="1" fill={`${color}08`} />
          <rect x="42" y="100" width="60" height="50" rx="2" fill={`${color}10`} />
          <rect x="110" y="100" width="60" height="50" rx="2" fill={`${color}08`} />
        </g>

        {/* Middle screen (straight) */}
        <g transform="translate(20, 0)">
          <rect x="90" y="50" width="200" height="145" rx="6" fill="#12121a" stroke={color} strokeWidth="1.5" />
          <rect x="90" y="50" width="200" height="20" rx="6" fill={`${color}10`} />
          <rect x="90" y="67" width="200" height="3" fill={`${color}10`} />
          <circle cx="104" cy="60" r="3.5" fill="#ef444450" />
          <circle cx="115" cy="60" r="3.5" fill="#eab30850" />
          <circle cx="126" cy="60" r="3.5" fill="#22c55e50" />
          {/* Main content */}
          <rect x="105" y="80" width="100" height="8" rx="2" fill={`${color}30`} />
          <rect x="105" y="94" width="160" height="4" rx="1" fill={`${color}15`} />
          <rect x="105" y="104" width="140" height="4" rx="1" fill={`${color}10`} />
          {/* Image */}
          <rect x="105" y="118" width="165" height="65" rx="3" fill={`${color}08`} />
          <path d="M140 160 L165 140 L190 155 L210 138 L255 170 L120 170 Z" fill={`${color}15`} />
          <circle cx="145" cy="135" r="8" fill={`${color}15`} />
        </g>

        {/* Front screen (tilted right) */}
        <g transform="rotate(6, 300, 150)">
          <rect x="210" y="80" width="160" height="115" rx="5" fill="#0e0e16" stroke={`${color}50`} strokeWidth="1" />
          <rect x="210" y="80" width="160" height="16" rx="5" fill={`${color}10`} />
          <rect x="210" y="93" width="160" height="3" fill={`${color}10`} />
          <circle cx="222" cy="88" r="3" fill={`${color}25`} />
          <circle cx="232" cy="88" r="3" fill={`${color}20`} />
          <rect x="222" y="104" width="60" height="5" rx="1" fill={`${color}25`} />
          <rect x="222" y="114" width="100" height="3" rx="1" fill={`${color}12`} />
          <rect x="222" y="122" width="80" height="3" rx="1" fill={`${color}08`} />
          <rect x="222" y="134" width="40" height="12" rx="2" fill={`${color}20`} />
          <rect x="270" y="134" width="40" height="12" rx="2" fill={`${color}12`} />
        </g>

        {/* Developer character at bottom, proud pose */}
        <circle cx="200" cy="215" r="14" fill="#1A1A2E" stroke={color} strokeWidth="1.2" />
        <path d="M186 210 Q189 198 200 196 Q211 198 214 210" fill={`${color}20`} stroke={color} strokeWidth="0.8" />
        <circle cx="195" cy="217" r="4" fill="none" stroke={color} strokeWidth="0.8" />
        <circle cx="205" cy="217" r="4" fill="none" stroke={color} strokeWidth="0.8" />
        <line x1="199" y1="217" x2="201" y2="217" stroke={color} strokeWidth="0.8" />
        <circle cx="195" cy="217" r="1.2" fill={color} />
        <circle cx="205" cy="217" r="1.2" fill={color} />
        <path d="M194 225 Q200 229 206 225" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
        {/* Body */}
        <path d="M186 229 Q183 245 180 260 L220 260 Q217 245 214 229" fill={`${color}12`} stroke={color} strokeWidth="1" />
        {/* Arms up presenting */}
        <path d="M186 238 Q170 225 155 215" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M214 238 Q230 225 245 215" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* Developer looking toward a glowing horizon with rising sun */
function HorizonVisual({ color }: { color: string }) {
  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox="0 0 400 220"
        fill="none"
        className="w-[70vw] tablet:w-[35vw] desktop:w-[18.229vw]"
        style={{ filter: `drop-shadow(0 0 20px ${color}25)` }}
      >
        {/* Sky gradient */}
        <defs>
          <radialGradient id="sunGlow" cx="75%" cy="55%" r="40%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`${color}05`} />
            <stop offset="80%" stopColor={`${color}12`} />
            <stop offset="100%" stopColor={`${color}05`} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="220" fill="url(#skyGrad)" />
        <rect x="0" y="0" width="400" height="220" fill="url(#sunGlow)" />

        {/* Horizon line */}
        <line x1="0" y1="160" x2="400" y2="160" stroke={`${color}40`} strokeWidth="1" />

        {/* Sun/star */}
        <circle cx="300" cy="120" r="20" fill={`${color}15`} stroke={color} strokeWidth="1.5">
          <animate attributeName="r" values="20;22;20" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="120" r="12" fill={`${color}25`}>
          <animate attributeName="r" values="12;14;12" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Light rays */}
        {[0, 30, 60, 90, 120, 150, 180].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 300 + 50 * Math.cos(rad);
          const y2 = 120 + 50 * Math.sin(rad);
          return (
            <line
              key={angle}
              x1="300" y1="120"
              x2={x2} y2={y2}
              stroke={`${color}15`}
              strokeWidth="0.5"
            />
          );
        })}

        {/* Ground/terrain hints */}
        <path d="M0 160 Q50 155 100 160 Q200 165 300 158 Q350 155 400 160 L400 220 L0 220 Z" fill={`${color}06`} />

        {/* Path leading to horizon */}
        <path d="M120 210 Q180 180 250 165 Q280 160 310 158" fill="none" stroke={`${color}25`} strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Developer silhouette looking at horizon */}
        {/* Head */}
        <circle cx="100" cy="125" r="18" fill="#1A1A2E" stroke={color} strokeWidth="1.5" />
        <path d="M82 119 Q85 104 100 101 Q115 104 118 119" fill={`${color}20`} stroke={color} strokeWidth="1" />
        {/* Glasses looking right */}
        <circle cx="94" cy="127" r="6" fill="none" stroke={color} strokeWidth="1" />
        <circle cx="107" cy="127" r="6" fill="none" stroke={color} strokeWidth="1" />
        <line x1="100" y1="127" x2="101" y2="127" stroke={color} strokeWidth="1" />
        {/* Eyes looking toward horizon */}
        <circle cx="96" cy="127" r="1.5" fill={color} />
        <circle cx="109" cy="127" r="1.5" fill={color} />
        {/* Determined smile */}
        <path d="M94 136 Q100 140 107 136" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" />

        {/* Body */}
        <path d="M82 143 Q78 165 75 200 L125 200 Q122 165 118 143" fill={`${color}12`} stroke={color} strokeWidth="1.2" />

        {/* Hand shielding eyes, looking far */}
        <path d="M118 155 Q130 140 135 130 L140 128" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        {/* Hand flat */}
        <line x1="132" y1="130" x2="145" y2="126" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

        {/* Other arm relaxed */}
        <path d="M82 155 Q70 170 75 190" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

        {/* Stars in sky */}
        {[
          [50, 30], [150, 50], [220, 25], [350, 45], [380, 80],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill={`${color}40`}>
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

/* Developer waving with "Let's connect" energy */
function CtaVisual({ color }: { color: string }) {
  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox="0 0 300 250"
        fill="none"
        className="w-[50vw] tablet:w-[25vw] desktop:w-[13.021vw]"
        style={{ filter: `drop-shadow(0 0 20px ${color}30)` }}
      >
        {/* Glow behind character */}
        <circle cx="150" cy="120" r="80" fill={`${color}06`} />
        <circle cx="150" cy="120" r="50" fill={`${color}08`}>
          <animate attributeName="r" values="50;55;50" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Character — head */}
        <circle cx="150" cy="85" r="28" fill="#1A1A2E" stroke={color} strokeWidth="2" />
        {/* Hair */}
        <path d="M122 78 Q126 56 150 52 Q174 56 178 78" fill={`${color}22`} stroke={color} strokeWidth="1.2" />
        {/* Glasses */}
        <circle cx="140" cy="87" r="8" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="160" cy="87" r="8" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="148" y1="87" x2="152" y2="87" stroke={color} strokeWidth="1.2" />
        {/* Excited eyes */}
        <circle cx="140" cy="86" r="2.5" fill={color} />
        <circle cx="160" cy="86" r="2.5" fill={color} />
        {/* Big smile */}
        <path d="M137 98 Q150 108 163 98" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

        {/* Body */}
        <path d="M122 113 Q117 145 112 185 L188 185 Q183 145 178 113" fill={`${color}12`} stroke={color} strokeWidth="1.5" />
        {/* Hoodie strings */}
        <path d="M142 118 L145 135" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
        <path d="M158 118 L155 135" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

        {/* Right arm waving! */}
        <path d="M178 130 Q200 110 210 80 L215 70" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Open palm */}
        <circle cx="215" cy="66" r="6" fill={`${color}20`} stroke={color} strokeWidth="1" />
        {/* Fingers */}
        <line x1="213" y1="60" x2="211" y2="54" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <line x1="215" y1="60" x2="215" y2="53" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <line x1="217" y1="60" x2="219" y2="54" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <line x1="220" y1="63" x2="224" y2="59" stroke={color} strokeWidth="1" strokeLinecap="round" />

        {/* Wave motion lines */}
        <path d="M225 60 Q230 55 228 48" fill="none" stroke={`${color}40`} strokeWidth="1" strokeLinecap="round">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1s" repeatCount="indefinite" />
        </path>
        <path d="M230 65 Q236 60 233 52" fill="none" stroke={`${color}30`} strokeWidth="1" strokeLinecap="round">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
        </path>

        {/* Left arm at side */}
        <path d="M122 130 Q105 150 110 180" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

        {/* Legs hinted */}
        <line x1="135" y1="185" x2="130" y2="230" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="165" y1="185" x2="170" y2="230" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

        {/* Energy sparkles */}
        {[
          [80, 50], [230, 40], [70, 130], [240, 130], [90, 180],
        ].map(([x, y], i) => (
          <g key={i}>
            <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke={`${color}50`} strokeWidth="1" strokeLinecap="round">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </line>
            <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke={`${color}50`} strokeWidth="1" strokeLinecap="round">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </line>
          </g>
        ))}
      </svg>
    </div>
  );
}
