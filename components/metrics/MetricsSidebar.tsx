// components/metrics/layout/MetricsSidebar.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Upload,
  BarChart2,
  LineChart,
  Menu,
  X,
  Clock,
  BarChart,
  ChevronDown
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SideNavProps {
  className?: string;
  children: React.ReactNode;
}

const metricsLinks = [
  {
    title: "NPS Diario",
    links: [
      {
        title: "Cargar NPS",
        href: "/metrics/daily/upload",
        icon: Upload,
      },
      {
        title: "Visualizar NPS",
        href: "/metrics/daily/view",
        icon: BarChart2,
      },
      {
        title: "Análisis de NPS",
        href: "/metrics/daily/analytics",
        icon: LineChart,
      },
    ]
  },
  {
    title: "Métricas TMO",
    links: [
      {
        title: "Cargar TMO",
        href: "/metrics/tmo/upload",
        icon: Clock,
      },
      {
        title: "Visualizar TMO",
        href: "/metrics/tmo/view",
        icon: BarChart,
      },
      {
        title: "Análisis TMO",
        href: "/metrics/tmo/analytics",
        icon: LineChart,
      },
    ]
  }
];

export default function MetricsSidebar({ children, className }: SideNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['NPS Diario', 'Métricas TMO']);
  const pathname = usePathname();

  const toggleSection = (section: string) => {
    setOpenSections(current =>
      current.includes(section)
        ? current.filter(s => s !== section)
        : [...current, section]
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out bg-background border-r",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-lg font-semibold">Gestión de Métricas</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {metricsLinks.map((section) => (
              <Collapsible
                key={section.title}
                open={openSections.includes(section.title)}
                onOpenChange={() => toggleSection(section.title)}
                className="space-y-2"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground">
                  <span className="font-medium">{section.title}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openSections.includes(section.title) ? "rotate-180" : ""
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pl-4">
                  {section.links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive ? "bg-accent text-accent-foreground" : "text-foreground"
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        <span>{link.title}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}