"use client";

import clsx from "clsx";

interface SidebarProps {
  sections: { id: string; label: string }[];
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export default function Sidebar({ sections, activeSection, onSectionChange }: SidebarProps) {
  return (
    <nav className="p-2">
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => onSectionChange(section.id)}
              className={clsx(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                activeSection === section.id
                  ? "bg-[#ECF7F5] font-semibold text-[#126D66] border border-[#DDF2EE]"
                  : "text-[#526B79] hover:bg-[#EAF1F3] hover:text-[#172D3A]"
              )}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
