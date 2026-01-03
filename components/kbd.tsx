export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-foreground-20 bg-foreground-10 px-1.5 py-0.5 font-mono text-xs">
      {children}
    </kbd>
  );
}
