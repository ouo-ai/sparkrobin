"use client"

import { Twitter, Youtube } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function FooterSection() {
  return (
    <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0 py-10 md:py-[70px]">
      {/* Left Section: Logo, Description, Social Links */}
      <div className="flex flex-col justify-start items-start gap-8 p-4 md:p-8">
        <div className="flex gap-2 items-center justify-center">
          <Image src="/brand/logo-mark-64.png" alt="" width={24} height={24} className="rounded-lg" />
          <div className="text-center text-foreground text-xl font-semibold leading-4">Spark Robin</div>
        </div>
        <p className="text-foreground/90 text-sm font-medium leading-[18px] text-left">AI Video Generator</p>
        <div className="flex justify-start items-start gap-3">
          <a href="#" aria-label="Twitter" className="w-4 h-4 flex items-center justify-center">
            <Twitter className="w-full h-full text-muted-foreground hover:text-foreground transition-colors" />
          </a>
          <a href="#" aria-label="YouTube" className="w-4 h-4 flex items-center justify-center">
            <Youtube className="w-full h-full text-muted-foreground hover:text-foreground transition-colors" />
          </a>
        </div>
      </div>
      {/* Right Section: Product, Resources, Legal */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 p-4 md:p-8 w-full md:w-auto">
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">Product</h3>
          <div className="flex flex-col justify-end items-start gap-2">
            <Link href="/#features-section" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Features
            </Link>
            <Link href="/#use-cases-section" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Use Cases
            </Link>
            <Link href="/pricing" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Pricing
            </Link>
            <Link href="/generator" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Video Generator
            </Link>
            <Link href="/#faq-section" className="text-foreground text-sm font-normal leading-5 hover:underline">
              FAQ
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">Video Styles</h3>
          <div className="flex flex-col justify-center items-start gap-2">
            <span className="text-foreground/70 text-sm font-normal leading-5">Cinematic</span>
            <span className="text-foreground/70 text-sm font-normal leading-5">Anime</span>
            <span className="text-foreground/70 text-sm font-normal leading-5">Realistic</span>
            <span className="text-foreground/70 text-sm font-normal leading-5">Artistic</span>
            <span className="text-foreground/70 text-sm font-normal leading-5">Minimalist</span>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">Legal</h3>
          <div className="flex flex-col justify-center items-start gap-2">
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Terms of Service
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
