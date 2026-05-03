"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const navItems = [
    { name: "Features", href: "/#features-section", targetId: "features-section" },
    { name: "Use Cases", href: "/#use-cases-section", targetId: "use-cases-section" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/#faq-section", targetId: "faq-section" },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId?: string) => {
    if (!targetId || pathname !== "/") {
      return
    }

    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      e.preventDefault()
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="w-full py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/logo-mark-64.png" alt="" width={28} height={28} className="rounded-lg" priority />
            <span className="text-foreground text-xl font-semibold">Spark Robin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.targetId)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  pathname === item.href ? "text-foreground" : "text-[#888888] hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/#generator" onClick={(e) => handleNavClick(e, "generator")} className="hidden md:block">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm">
              Try Now
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-background border-t border-border text-foreground">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-semibold text-foreground">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.targetId)}
                    className="text-[#888888] hover:text-foreground justify-start text-lg py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href="/#generator" onClick={(e) => handleNavClick(e, "generator")} className="w-full mt-4">
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm">
                    Try Now
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
