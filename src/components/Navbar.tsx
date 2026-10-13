"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", href: "/" },
    { name: "Play Game", href: "/game" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Health Check", href: "/health" },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-indigo-400">
          🧠 MemoryMatch
        </Link>

        {/* Desktop Links */}
        <div className="hidden gap-6 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-300 hover:text-white transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded p-2 text-zinc-400 hover:bg-zinc-800 sm:hidden"
          aria-label="Toggle Navigation"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="flex flex-col gap-2 border-t border-zinc-800 px-4 py-3 sm:hidden bg-zinc-900">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="py-1 text-sm font-medium text-zinc-300 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
