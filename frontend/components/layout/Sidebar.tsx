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
                "w-full rounded px-3 py-2 text-left text-sm transition-colors",
                activeSection === section.id
                  ? "bg-flood-100 font-medium text-flood-800"
                  : "text-gray-600 hover:bg-gray-100"
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
