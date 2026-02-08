"use client"

import { Collapsible } from "@base-ui/react/collapsible"
import { ChevronDown } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { type TocEntry } from "@/components/mdx-content"

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [isOpen, setIsOpen] = useState(false)
  if (toc.length === 0) return null

  return (
    <nav aria-label="Table of Contents" className="mb-8">
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <Collapsible.Trigger className="group flex w-full items-center justify-between rounded-lg border border-foreground-10 bg-foreground-5 px-4 py-2.5 transition-colors duration-200 hover:bg-foreground-10">
          <span className="text-sm font-medium text-foreground-70">
            Table of Contents
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChevronDown size={16} />
          </motion.span>
        </Collapsible.Trigger>

        <Collapsible.Panel
          keepMounted
          className="h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-250 ease-in-out data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0"
        >
          <div className="mt-2">
            {toc.map((entry, index) => (
              <motion.a
                key={entry.id}
                href={`#${entry.id}`}
                initial={false}
                animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                transition={{
                  duration: 0.2,
                  delay: isOpen ? index * 0.03 : 0,
                  ease: "easeOut",
                }}
                className="block rounded px-4 py-1.5 text-sm text-foreground-60 transition-colors duration-200 hover:bg-foreground-5 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                style={{ paddingLeft: `${(entry.level - 1) * 0.75}rem` }}
              >
                {entry.title}
              </motion.a>
            ))}
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </nav>
  )
}
