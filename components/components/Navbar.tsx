"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSession, clearSession, type Session } from "@/lib/auth";

const borrowerLinks = [
  { href: "/",          label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/journey",   label: "Journey" },
  { href: "/simulator", label: "Simulator" },
  { href: "/consent",   label: "Consent Vault" },
];

const lenderLinks = [
  { href: "/",       label: "Home" },
  { href: "/lender", label: "Lender Dashboard" },
];

const guestLinks = [
  { href: "/",          label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/journey",   label: "Journey" },
  { href: "/simulator", label: "Simulator" },
  { href: "/consent",   label: "Consent Vault" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Re-read session whenever pathname changes (post-login)
  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  const navLinks = session?.role === "lender"
    ? lenderLinks
    : session?.role === "borrower"
    ? borrowerLinks
    : guestLinks;

  const roleLabel = session?.role === "lender" ? "Lender" : session?.role === "borrower" ? "Borrower" : null;
  const roleColor = session?.role === "lender" ? "#22c55e" : "#3b96f2";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080c18]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          : "bg-transparent"
      }`}
    >
      <div className="page-container !py-0 max-w-[76rem]">
        <div className="flex items-center justify-between h-20 min-h-[80px] max-h-[80px] shrink-0">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-[0_2px_12px_rgba(59,150,242,0.2)] transition-shadow group-hover:shadow-[0_4px_20px_rgba(59,150,242,0.28)]">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-display font-semibold text-lg tracking-tight text-white">
              Udaan<span className="text-primary-400">Score</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group ${
                    isActive ? "text-white" : "text-slate-400/70 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-primary-500/20 border border-primary-400/30 rounded-full shadow-[0_0_16px_rgba(59,150,242,0.3)] -z-10" />
                  )}
                  {!isActive && (
                    <span className="absolute inset-0 bg-white/[0.04] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 scale-95 group-hover:scale-100" />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Right — Auth area */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  id="navbar-user-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl glass border border-white/10 hover:border-white/20 transition-all group"
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${roleColor}88, ${roleColor}44)`, border: `1px solid ${roleColor}55` }}
                  >
                    {session.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-semibold leading-none">{session.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: roleColor }}>{roleLabel}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-white text-xs font-semibold">{session.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{roleLabel}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={session.role === "lender" ? "/lender" : "/dashboard"}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.05] text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      {session.role === "borrower" && (
                        <Link
                          href="/consent"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.05] text-sm transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          Consent Vault
                        </Link>
                      )}
                      <Link
                        href="/login"
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors"
                        id="navbar-logout"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        Sign Out
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" id="navbar-signin" className="btn-outline text-sm !py-2.5 !px-4">
                  Sign In
                </Link>
                <Link href="/login" id="navbar-getstarted" className="btn-primary text-sm !py-2.5 !px-5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="navbar-mobile-toggle"
            className="lg:hidden p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        } border-t border-white/[0.06] bg-[#080c18]/95 backdrop-blur-xl`}
      >
        <div className="page-container !pt-4 !pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-white bg-primary-500/15 border border-primary-500/20 shadow-[inset_0_0_20px_rgba(59,150,242,0.15)]"
                    : "text-slate-400/70 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-4 flex flex-col gap-3">
            {session ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/10">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${roleColor}88, ${roleColor}44)` }}
                  >
                    {session.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{session.name}</p>
                    <p className="text-xs" style={{ color: roleColor }}>{roleLabel}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm text-center text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline text-sm text-center" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/login" className="btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
