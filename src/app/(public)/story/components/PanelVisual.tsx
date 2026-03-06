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

function CodeEditorVisual({ color }: { color: string }) {
  return (
    <div className="w-full max-w-[80vw] tablet:max-w-[40vw] desktop:max-w-[20.833vw]">
      <div
        className="rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] overflow-hidden border"
        style={{ borderColor: `${color}30` }}
      >
        <div
          className="flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] px-[2.667vw] tablet:px-[1.25vw] desktop:px-[0.521vw] py-[1.333vw] tablet:py-[0.625vw] desktop:py-[0.26vw]"
          style={{ background: `${color}10` }}
        >
          <div className="w-[2.133vw] h-[2.133vw] tablet:w-[1vw] tablet:h-[1vw] desktop:w-[0.417vw] desktop:h-[0.417vw] rounded-full bg-red-500/60" />
          <div className="w-[2.133vw] h-[2.133vw] tablet:w-[1vw] tablet:h-[1vw] desktop:w-[0.417vw] desktop:h-[0.417vw] rounded-full bg-yellow-500/60" />
          <div className="w-[2.133vw] h-[2.133vw] tablet:w-[1vw] tablet:h-[1vw] desktop:w-[0.417vw] desktop:h-[0.417vw] rounded-full bg-green-500/60" />
        </div>
        <div className="p-[2.667vw] tablet:p-[1.25vw] desktop:p-[0.521vw] space-y-[1.333vw] tablet:space-y-[0.625vw] desktop:space-y-[0.26vw] bg-bg-secondary">
          {[75, 55, 85, 40, 65, 50, 70].map((w, i) => (
            <div
              key={i}
              className="h-[1.6vw] tablet:h-[0.75vw] desktop:h-[0.313vw] rounded-full"
              style={{
                width: `${w}%`,
                background: i % 3 === 0 ? `${color}40` : `${color}18`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TechOrbitVisual({ color }: { color: string }) {
  const techs = ["React", "TS", "Next", "Node", "SQL", "CSS"];
  return (
    <div className="relative w-[40vw] h-[40vw] tablet:w-[20vw] tablet:h-[20vw] desktop:w-[10.417vw] desktop:h-[10.417vw]">
      <div
        className="absolute inset-[30%] rounded-full border-2 animate-pulse"
        style={{ borderColor: `${color}60`, background: `${color}10` }}
      />
      {techs.map((tech, i) => {
        const angle = (i * 360) / techs.length;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + 40 * Math.cos(rad);
        const y = 50 + 40 * Math.sin(rad);
        return (
          <div
            key={tech}
            className="absolute text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] font-mono px-[1.333vw] tablet:px-[0.625vw] desktop:px-[0.26vw] py-[0.533vw] tablet:py-[0.25vw] desktop:py-[0.104vw] rounded-full border"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              borderColor: `${color}40`,
              background: `${color}10`,
              color: color,
            }}
          >
            {tech}
          </div>
        );
      })}
    </div>
  );
}

function SkillCardsVisual({ color }: { color: string }) {
  const skills = ["Frontend", "Backend", "DevOps"];
  return (
    <div className="flex gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw] flex-wrap justify-center">
      {skills.map((skill) => (
        <div
          key={skill}
          className="px-[4.267vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.25vw] desktop:py-[0.521vw] rounded-[1.6vw] tablet:rounded-[0.75vw] desktop:rounded-[0.313vw] border text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-medium"
          style={{
            borderColor: `${color}30`,
            background: `${color}08`,
            color: color,
          }}
        >
          {skill}
        </div>
      ))}
    </div>
  );
}

function DashboardSketchVisual({ color }: { color: string }) {
  return (
    <div
      className="w-full max-w-[80vw] tablet:max-w-[40vw] desktop:max-w-[20.833vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] border p-[2.667vw] tablet:p-[1.25vw] desktop:p-[0.521vw]"
      style={{ borderColor: `${color}30`, background: `${color}05` }}
    >
      <div className="flex gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
        {[30, 30, 30].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[10.667vw] tablet:h-[5vw] desktop:h-[2.083vw] rounded-[1.067vw] tablet:rounded-[0.5vw] desktop:rounded-[0.208vw]"
            style={{ background: `${color}${15 + i * 5}` }}
          />
        ))}
      </div>
      <div
        className="h-[16vw] tablet:h-[7.5vw] desktop:h-[3.125vw] rounded-[1.067vw] tablet:rounded-[0.5vw] desktop:rounded-[0.208vw]"
        style={{ background: `${color}10` }}
      />
    </div>
  );
}

function BrowserSketchVisual({ color }: { color: string }) {
  return (
    <div
      className="w-full max-w-[80vw] tablet:max-w-[40vw] desktop:max-w-[20.833vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] border overflow-hidden"
      style={{ borderColor: `${color}30` }}
    >
      <div
        className="h-[4.267vw] tablet:h-[2vw] desktop:h-[0.833vw] flex items-center px-[2.133vw] tablet:px-[1vw] desktop:px-[0.417vw]"
        style={{ background: `${color}10` }}
      >
        <div
          className="h-[1.6vw] tablet:h-[0.75vw] desktop:h-[0.313vw] w-[40%] rounded-full"
          style={{ background: `${color}20` }}
        />
      </div>
      <div className="p-[2.667vw] tablet:p-[1.25vw] desktop:p-[0.521vw] bg-bg-secondary space-y-[1.6vw] tablet:space-y-[0.75vw] desktop:space-y-[0.313vw]">
        <div
          className="h-[5.333vw] tablet:h-[2.5vw] desktop:h-[1.042vw] w-[60%] rounded-[0.533vw] tablet:rounded-[0.25vw] desktop:rounded-[0.104vw]"
          style={{ background: `${color}20` }}
        />
        <div
          className="h-[2.667vw] tablet:h-[1.25vw] desktop:h-[0.521vw] w-[90%] rounded-[0.533vw] tablet:rounded-[0.25vw] desktop:rounded-[0.104vw]"
          style={{ background: `${color}10` }}
        />
        <div
          className="h-[2.667vw] tablet:h-[1.25vw] desktop:h-[0.521vw] w-[75%] rounded-[0.533vw] tablet:rounded-[0.25vw] desktop:rounded-[0.104vw]"
          style={{ background: `${color}10` }}
        />
      </div>
    </div>
  );
}

function ProjectMontageVisual({ color }: { color: string }) {
  return (
    <div className="grid grid-cols-2 gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] w-full max-w-[80vw] tablet:max-w-[40vw] desktop:max-w-[20.833vw]">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="aspect-[4/3] rounded-[1.6vw] tablet:rounded-[0.75vw] desktop:rounded-[0.313vw] border"
          style={{
            borderColor: `${color}30`,
            background: `${color}${8 + i * 4}`,
          }}
        />
      ))}
    </div>
  );
}

function HorizonVisual({ color }: { color: string }) {
  return (
    <div className="w-full max-w-[80vw] tablet:max-w-[40vw] desktop:max-w-[20.833vw] h-[26.667vw] tablet:h-[12.5vw] desktop:h-[5.208vw] relative rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${color}08 0%, ${color}25 60%, ${color}08 100%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: `${color}60` }}
      />
      <div
        className="absolute w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-full"
        style={{
          background: color,
          top: "30%",
          left: "70%",
          boxShadow: `0 0 20px ${color}60`,
        }}
      />
    </div>
  );
}

function CtaVisual({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
      <div
        className="w-[13.333vw] h-[13.333vw] tablet:w-[6.25vw] tablet:h-[6.25vw] desktop:w-[2.604vw] desktop:h-[2.604vw] rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: `${color}60`, background: `${color}10` }}
      >
        <svg
          className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]"
          fill="none"
          stroke={color}
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <span
        className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-medium"
        style={{ color }}
      >
        Let&apos;s connect
      </span>
    </div>
  );
}
