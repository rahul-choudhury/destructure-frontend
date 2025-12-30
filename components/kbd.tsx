export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-foreground/10 border border-foreground/20 rounded">
      {children}
    </kbd>
  );
}
