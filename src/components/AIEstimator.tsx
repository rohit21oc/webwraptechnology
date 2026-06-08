import { useState, useEffect } from "react";
import { ProjectType } from "../types";

interface AIEstimatorProps {
  user: any;
  onOpenAuth: (mode: "login" | "register") => void;
  onChangeTab: (tab: string) => void;
}

export default function AIEstimator({ user, onOpenAuth, onChangeTab }: AIEstimatorProps) {
  const [estType, setEstType] = useState<ProjectType>(ProjectType.WEBSITE);
  const [estScope, setEstScope] = useState<string>("Standard SaaS Interface");
  const [estDuration, setEstDuration] = useState<string>("2-3 months");
  const [estCost, setEstCost] = useState<string>("$15,000 - $25,000");

  // Sync estimate calculator logic
  useEffect(() => {
    let price = "$10,000 - $15,000";
    let estime = "6-8 weeks";
    if (estType === ProjectType.MOBILE_APP) {
      price = "$25,000 - $45,000";
      estime = "10-12 weeks";
    } else if (estType === ProjectType.CRM) {
      price = "$40,000 - $65,000";
      estime = "3-4 Months";
    } else if (estType === ProjectType.ERP) {
      price = "$75,000 - $120,000";
      estime = "4-6 Months";
    } else if (estType === ProjectType.CUSTOM_SOFTWARE) {
      price = "$50,000+ Scalable Metric";
      estime = "Dynamic Sprints";
    }
    setEstCost(price);
    setEstDuration(estime);
  }, [estType]);

  return (
    <section id="pricing-section" className="max-w-7xl mx-auto px-6">
      <div className="p-8 md:p-12 rounded-3xl glass-panel relative border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase bg-emerald-500/10 text-emerald-400 font-bold font-mono px-3 py-1 rounded border border-emerald-500/20">
              Transparent Cost Estimator
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-2">Project Matrix Budget Tool</h2>
            <p className="text-slate-400 font-light text-sm md:text-base leading-relaxed mb-6">
              Estimate your custom system constraints instantly. Our local simulator computes standard regional estimates. Submit a real ticket to trigger automated AI solutions engineering blueprints!
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-2">1. Select Target Product Frame</label>
                <select
                  id="est-type-select"
                  value={estType}
                  onChange={(e) => setEstType(e.target.value as ProjectType)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 text-sm focus:border-cyan-400 outline-none"
                >
                  <option value={ProjectType.WEBSITE}>Global Website Architecture</option>
                  <option value={ProjectType.MOBILE_APP}>Mobile iOS & Android Hybrid</option>
                  <option value={ProjectType.CRM}>Ecosystem CRM & Pipelines</option>
                  <option value={ProjectType.ERP}>Multimodule Logistic ERP</option>
                  <option value={ProjectType.CUSTOM_SOFTWARE}>Premium Scalable Custom Engine</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-2">2. Scope / Size Expectation</label>
                <ul className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    "Standard MVP Startup",
                    "Premium Modern Integration",
                    "Global Multi-region Scale",
                    "High-Compliance Enterprise"
                  ].map((item) => (
                    <li
                      id={`item-${item.replace(/ /g, "-")}`}
                      key={item}
                      onClick={() => setEstScope(item)}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${estScope === item ? "bg-violet-500/20 border-violet-400 text-slate-100 font-semibold" : "bg-slate-900/30 border-white/5 text-slate-400 hover:border-white/10"}`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col justify-between text-left relative shadow-2xl">
            <div className="absolute top-2 right-2 text-[10px] text-cyan-500 font-mono tracking-widest">WEBWARP MOCKUP ESTIMATE</div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Product Profile</p>
              <h4 className="text-xl font-bold text-white mt-1 mb-6 flex items-center gap-2">
                {estType}
                <span className="text-xs bg-slate-800 text-slate-300 border border-white/5 py-0.5 px-2 rounded-full font-normal">
                  {estScope}
                </span>
              </h4>

              <div className="border-t border-b border-white/5 py-4 my-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Duration</span>
                  <span className="font-mono text-cyan-400 font-bold">{estDuration}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Dev & Architect Sprints</span>
                  <span className="font-mono text-slate-200">Continuous CI/CD Pipelines</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Compliance & Security Group</span>
                  <span className="font-mono text-slate-200">JWT + SHA-256 standard included</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <span className="text-xs text-slate-400">Pricing Estimate (Regional Standard)</span>
                <div className="text-3xl font-extrabold text-white tracking-tight mt-1">{estCost}</div>
              </div>

              <button
                id="est-lodge-specs-btn"
                onClick={() => {
                  if (user) {
                    onChangeTab("user-dashboard");
                  } else {
                    onOpenAuth("register");
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-xs uppercase tracking-wide cursor-pointer hover:opacity-95"
              >
                Lodge Specifications and Generate real AI Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
