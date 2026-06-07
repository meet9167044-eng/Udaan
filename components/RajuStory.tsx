"use client";

import { useEffect, useState } from "react";
import { getRajuStory } from "@/lib/api";

export default function RajuStory() {
  const [story, setStory] = useState<any>(null);
  const [activeScene, setActiveScene] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRajuStory().then((res) => {
      if (!cancelled) setStory(res);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    const el = document.getElementById("raju-story-section");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!story) return null;

  const scenes = [
    { num: 1, id: "scene_1", icon: "🚫", color: "#ef4444" },
    { num: 2, id: "scene_2", icon: "📱", color: "#3b96f2" },
    { num: 3, id: "scene_3", icon: "🧠", color: "#8b5cf6" },
    { num: 4, id: "scene_4", icon: "🗺️", color: "#f59e0b" },
    { num: 5, id: "scene_5", icon: "🤝", color: "#10b981" },
    { num: 6, id: "scene_6", icon: "🔮", color: "#6366f1" },
    { num: 7, id: "scene_7", icon: "🎉", color: "#22c55e" },
  ];

  const currentScene = story[`scene_${activeScene}`];

  return (
    <section id="raju-story-section" className={`section-spacing ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="page-container">
        <div className="text-center section-header max-w-2xl mx-auto">
          <p className="section-label">Demo Story</p>
          <h2 className="heading-section text-white">
            {story.demo_title}
          </h2>
          <p className="text-slate-400 mt-2">{story.tagline}</p>
        </div>

        <div className="glass-card glass-card-static relative overflow-hidden max-w-5xl mx-auto">
          {/* Progress Timeline */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/10 -z-10 -translate-y-1/2" />
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-primary-500 to-green-400 -z-10 -translate-y-1/2 transition-all duration-700"
              style={{ width: `${((activeScene - 1) / (scenes.length - 1)) * 100}%` }}
            />
            {scenes.map((s) => (
              <button
                key={s.num}
                onClick={() => setActiveScene(s.num)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                  activeScene === s.num
                    ? "scale-125 border-2 z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    : activeScene > s.num
                    ? "opacity-100 border-2"
                    : "opacity-40 hover:opacity-80 border-2 border-white/20 bg-navy-800"
                }`}
                style={{
                  backgroundColor: activeScene >= s.num ? `${s.color}20` : undefined,
                  borderColor: activeScene >= s.num ? s.color : undefined,
                  color: activeScene >= s.num ? s.color : "white"
                }}
              >
                {s.icon}
              </button>
            ))}
          </div>

          {/* Scene Content */}
          <div
            key={activeScene} // triggers re-animation on change
            className="min-h-[280px] flex flex-col justify-center items-center text-center animate-story-step"
          >
            <h3 className="heading-card text-2xl text-white mb-6">
              {currentScene.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto text-left">
              {Object.entries(currentScene).map(([k, v]) => {
                if (k === "title") return null;
                if (Array.isArray(v)) {
                  return (
                    <div key={k} className="glass rounded-xl p-4 border border-white/10">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">{k.replace(/_/g, " ")}</p>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-slate-200">
                        {v.map((item: any, i: number) => <li key={i}>{typeof item === 'object' ? item.factor || item.detail : item}</li>)}
                      </ul>
                    </div>
                  );
                }
                if (typeof v === "object" && v !== null) {
                  return (
                    <div key={k} className="glass rounded-xl p-4 border border-white/10 md:col-span-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">{k.replace(/_/g, " ")}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(v).map(([sk, sv]) => (
                          <span key={sk} className="px-2 py-1 rounded bg-white/5 text-xs text-slate-300">
                            {sk.replace(/_/g, " ")}: {String(sv)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={k} className="glass rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">{k.replace(/_/g, " ")}</p>
                    <p className="text-lg text-white font-medium">{String(v)}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setActiveScene(prev => Math.max(1, prev - 1))}
                disabled={activeScene === 1}
                className="btn-outline text-sm py-2 px-4 disabled:opacity-50"
              >
                ← Previous
              </button>
              <button
                onClick={() => setActiveScene(prev => Math.min(scenes.length, prev + 1))}
                disabled={activeScene === scenes.length}
                className="btn-primary text-sm py-2 px-6 disabled:opacity-50"
              >
                {activeScene === scenes.length ? "End of Journey" : "Next Step →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
