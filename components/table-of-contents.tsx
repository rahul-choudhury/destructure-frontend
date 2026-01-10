import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import { TocEntry } from "@/lib/process-html";

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  if (toc.length === 0) return null;

  return (
    <nav aria-label="Table of Contents" className="mb-8">
      <Collapsible.Root defaultOpen={false}>
        <Collapsible.Trigger className="group flex w-full items-center justify-between rounded-lg border border-foreground-10 bg-foreground-5 px-4 py-2.5 transition-colors duration-200 hover:bg-foreground-10">
          <span className="text-sm font-medium text-foreground-70">
            Table of Contents
          </span>
          <ChevronDown
            size={16}
            className="transition-transform duration-200 group-data-panel-open:rotate-180"
          />
        </Collapsible.Trigger>

        <Collapsible.Panel className="data-ending-style:opacity-0 data-starting-style:opacity-0">
          <div className="mt-2">
            {toc.map((entry) => (
              <a
                key={entry.id}
                href={`#${entry.id}`}
                className="block rounded px-4 py-1.5 text-sm text-foreground-60 transition-colors duration-200 hover:bg-foreground-5 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                style={{ paddingLeft: `${(entry.level - 1) * 0.75}rem` }}
              >
                {entry.title}
              </a>
            ))}
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </nav>
  );
}
