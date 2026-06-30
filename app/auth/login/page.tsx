"use client";

import { useState } from "react";
import { useAuth, type UserRole } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const borrowerProfiles = [
  "Raju Sharma",
  "Priya Patel",
  "Arjun Mehta",
  "Sunita Verma",
];

const roleOptions: { value: UserRole; label: string; description: string; icon: string; afterLogin: string }[] = [
  { value: "borrower", label: "Borrower", description: "Build your Trust Score, unlock nano-loans, and grow your business.", icon: "👤", afterLogin: "→ Trust Dashboard with score, signals, and loan offers" },
  { value: "lender",   label: "Lender",   description: "Access verified alternate-data profiles and deploy capital safely.", icon: "🏦", afterLogin: "→ Borrower portfolio with risk reports and fraud alerts" },
  { value: "admin",    label: "Admin",    description: "Monitor system health, default rates, and platform governance.", icon: "🛡️", afterLogin: "→ Admin console with metrics, alerts, and data source health" },
];

/* ── Dynamic Visuals ─────────────────────────────────────────── */
const BorrowerVisual = () => (
  <div className="relative flex items-center justify-center w-full h-full">
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute w-72 h-72 rounded-full border border-dashed border-blue-400/40"
    />
    <motion.div 
      animate={{ rotate: -360 }} 
      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      className="absolute w-96 h-96 rounded-full border border-dotted border-cyan-400/30"
    />
    <div className="absolute w-56 h-56 rounded-full bg-blue-500/20 blur-2xl" />
    <motion.div 
       animate={{ scale: [1, 1.05, 1] }} 
       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
       className="relative z-10 flex flex-col items-center justify-center w-48 h-48 rounded-full bg-blue-900/60 border border-blue-400/50 shadow-[0_0_60px_rgba(59,130,246,0.4)] backdrop-blur-xl"
    >
      <span className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-200 to-cyan-400">742</span>
      <span className="text-xs text-blue-300 uppercase tracking-widest mt-2 font-bold">Trust Score</span>
    </motion.div>
  </div>
);

const LenderVisual = () => (
  <div className="relative flex items-end justify-center w-full h-64 gap-4 px-10">
    <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
    {[40, 70, 45, 95, 65, 80, 55].map((h, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${h}%` }}
        transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
        className="flex-1 bg-gradient-to-t from-emerald-900/80 to-emerald-400/90 border border-emerald-400/40 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      >
        <motion.div 
          animate={{ y: ["200%", "-100%"] }} 
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
          className="absolute inset-0 bg-white/30 blur-[2px] h-1/3" 
        />
      </motion.div>
    ))}
  </div>
);

const AdminVisual = () => (
  <div className="relative flex items-center justify-center w-full h-full">
    <div className="absolute inset-0 bg-violet-600/10 blur-3xl rounded-full" />
    <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      <motion.circle cx="50" cy="50" r="35" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.5" fill="none" animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity }} />
      <motion.circle cx="50" cy="50" r="20" stroke="rgba(217, 70, 239, 0.4)" strokeWidth="0.5" fill="none" animate={{ scale: [1, 0.8, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity }} />
      
      <motion.path d="M 50 50 L 20 20 M 50 50 L 80 30 M 50 50 L 70 80 M 50 50 L 30 70 M 20 20 L 80 30" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
      
      <motion.circle animate={{ r: [2, 3, 2] }} transition={{ duration: 2, repeat: Infinity }} cx="20" cy="20" r="2" fill="#d946ef" className="shadow-[0_0_10px_#d946ef]" />
      <motion.circle animate={{ r: [3, 4, 3] }} transition={{ duration: 3, repeat: Infinity }} cx="80" cy="30" r="3" fill="#8b5cf6" className="shadow-[0_0_10px_#8b5cf6]" />
      <motion.circle animate={{ r: [2, 3, 2] }} transition={{ duration: 2.5, repeat: Infinity }} cx="70" cy="80" r="2" fill="#d946ef" className="shadow-[0_0_10px_#d946ef]" />
      <motion.circle animate={{ r: [2.5, 3.5, 2.5] }} transition={{ duration: 2.2, repeat: Infinity }} cx="30" cy="70" r="2.5" fill="#8b5cf6" className="shadow-[0_0_10px_#8b5cf6]" />
      
      <circle cx="50" cy="50" r="6" fill="#fff" className="shadow-[0_0_30px_#fff]" />
      <circle cx="50" cy="50" r="3" fill="#8b5cf6" />
    </motion.svg>
  </div>
);

const themes = {
  borrower: {
    hex: "#3b82f6",
    gradient: "from-blue-600 to-cyan-400",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-400",
    title: "Unlock Financial Access",
    visual: <BorrowerVisual />
  },
  lender: {
    hex: "#10b981",
    gradient: "from-emerald-600 to-teal-400",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-400",
    title: "Deploy Capital Safely",
    visual: <LenderVisual />
  },
  admin: {
    hex: "#8b5cf6",
    gradient: "from-violet-600 to-fuchsia-500",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-400",
    title: "Monitor Platform Health",
    visual: <AdminVisual />
  }
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("borrower");
  const [borrowerName, setBorrowerName] = useState<string>(borrowerProfiles[0]);
  const [guestName, setGuestName] = useState("Demo User");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = {
      role,
      name: role === "borrower" ? borrowerName : role === "lender" ? "Lender Partner" : "Udaan Admin",
      borrowerName: role === "borrower" ? borrowerName : undefined,
    };
    login(session);
    router.refresh();
  };

  const theme = themes[role];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-white overflow-hidden selection:bg-white/10 relative font-sans">
      
      {/* ── Left Side: Form ────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10">
        
        {/* Logo */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 flex items-center justify-center transition-all duration-500" style={{ background: `linear-gradient(135deg, ${theme.hex}, #000)`, boxShadow: `0 4px 20px ${theme.hex}40` }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Udaan<span style={{ color: theme.hex }} className="transition-colors duration-500">Score</span>
            </span>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-3 tracking-tight">Role-Based Demo Login</h1>
          <p className="text-slate-400 text-lg mb-10">Select a persona below to explore how UdaanScore serves different users.</p>
        </motion.div>

        {/* Role Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {roleOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setRole(option.value)}
              className={`relative px-12 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                role === option.value 
                  ? "border-transparent text-white" 
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {role === option.value && (
                <motion.div 
                  layoutId="role-tab" 
                  className="absolute inset-0 rounded-xl" 
                  style={{ backgroundColor: theme.hex, boxShadow: `0 4px 20px ${theme.hex}40` }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">{option.icon}</span>
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {/* Login Form Box */}
        <motion.div 
          layout
          className="bg-white/[0.02] border border-white/5 p-8 sm:p-10 relative transition-shadow duration-500"
          style={{ boxShadow: `0 0 50px ${theme.hex}15` }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {role === "borrower" ? (
                <motion.div key="borrower-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                  <label className="text-base font-bold text-white">Select Demo Profile</label>
                  <div className="relative">
                    <select
                      value={borrowerName}
                      onChange={(event) => setBorrowerName(event.target.value)}
                      className="w-full appearance-none rounded-xl border-2 border-white/20 bg-white/10 px-5 py-4 text-white font-medium outline-none focus:border-white/40 transition-colors cursor-pointer"
                    >
                      {borrowerProfiles.map((name) => (
                        <option key={name} value={name} className="bg-slate-900">{name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="other-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                  <label className="text-base font-bold text-white">Display Name</label>
                  <input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-5 py-4 text-white font-medium outline-none focus:border-white/40 transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 rounded-2xl font-bold text-lg text-white transition-all duration-500 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
              style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue to Dashboard
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* ── Right Side: Dynamic Visual Portal ──────────────────────── */}
      <div className="hidden lg:flex w-1/2 p-6 relative">
        <motion.div 
           className="w-full h-full relative overflow-hidden flex flex-col justify-between p-16 transition-colors duration-700 border border-white/[0.05]"
           style={{ backgroundColor: `${theme.hex}10` }}
        >
          {/* Huge ambient glow */}
          <div className="absolute inset-0 opacity-20 blur-[120px] mix-blend-screen transition-colors duration-700" style={{ backgroundColor: theme.hex }} />
          
          {/* Top text content */}
          <div className="relative z-10 max-w-md">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={role}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="text-5xl xl:text-6xl font-display font-bold leading-[1.1] mb-5 tracking-tight"
              >
                {theme.title}
              </motion.h2>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={role + 'desc'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-lg text-white/60 leading-relaxed"
              >
                {roleOptions.find(o => o.value === role)?.description}
              </motion.p>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={role + 'after'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-sm text-white/40 mt-3 font-medium"
              >
                {roleOptions.find(o => o.value === role)?.afterLogin}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Centered Abstract Visual */}
          <div className="flex-1 flex items-center justify-center relative z-10 mt-10">
             <AnimatePresence mode="wait">
               <motion.div
                 key={role}
                 initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                 animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                 exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                 transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                 className="w-full h-full flex items-center justify-center"
               >
                 {theme.visual}
               </motion.div>
             </AnimatePresence>
          </div>
          

        </motion.div>
      </div>
      
    </div>
  );
}
