import React from "react";
import { QuantityInput } from "./QuantityInput";

const SKILLS = [
  { name: "Endurance" },
  { name: "Attention" },
  { name: "Health" },
  { name: "Vitality" },
  { name: "Metabolism" },
  { name: "Strength" },
];

const SKILL_IMAGES: Record<string, string> = {
  Endurance:
    "https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/6/63/Skill_physical_endurance.png",
  Attention:
    "https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/5/57/Skill_mental_attention.png",
  Health:
    "https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/1/12/Skill_physical_health.png",
  Vitality:
    "https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/6/67/Skill_physical_vitality.png",
  Metabolism:
    "https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/7/7e/Skill_physical_metabolism.png",
  Strength:
    "https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/c/ca/Skill_physical_strength.png",
};

interface SkillCardProps {
  progress: Record<string, number>;
  setProgress: (value: Record<string, number>) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  progress,
  setProgress,
}) => {
  function setSkillLevel(skill: string, level: number) {
    setProgress({ ...progress, [`skill-${skill}`]: level });
  }

  return (
    <div className="shadow-lg border-0 overflow-hidden mb-4 h-full min-h-[220px] bg-white dark:bg-zinc-900 rounded p-4">
      <h2 className="text-lg font-bold mb-4 dark:text-gray-100">Skills</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {SKILLS.map((skill) => (
          <div
            key={skill.name}
            className="flex flex-col items-center bg-gray-50 dark:bg-zinc-800 rounded p-3 shadow"
          >
            <img
              src={SKILL_IMAGES[skill.name] || "/images/placeholder.png"}
              alt={skill.name}
              className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-300 dark:border-zinc-700"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="font-semibold mb-1 dark:text-gray-100">
              {skill.name}
            </span>
            <label className="text-xs mb-1 dark:text-gray-300">Nível:</label>
            <QuantityInput
              value={progress[`skill-${skill.name}`] ?? 0}
              onChange={(val) => setSkillLevel(skill.name, val)}
              min={0}
              max={51}
              className="w-14 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
