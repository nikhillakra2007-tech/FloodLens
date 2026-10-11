export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#E8DFD3] bg-[#FAF7F2] py-8 text-xs text-[#756350]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="font-serif font-bold text-[#221B15] text-sm">FloodLens Chennai</span>
          <span className="text-[#D5C6B3]">·</span>
          <span>Differential Urban Hydrological Intelligence</span>
        </div>
        <div className="flex items-center gap-4 text-[#756350]">
          <span>Greater Chennai Corporation GIS Grid</span>
          <span className="text-[#D5C6B3]">·</span>
          <span className="font-mono text-[11px]">2023 Cyclone Michaung &amp; Multi-Event Series</span>
        </div>
      </div>
    </footer>
  );
}
