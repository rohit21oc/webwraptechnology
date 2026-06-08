import { useState, FormEvent } from "react";
import { Sparkles, MessageSquare, Briefcase, Layers, Star } from "lucide-react";
import AIEstimator from "./AIEstimator";

interface HomeViewProps {
  user: any;
  onOpenAuth: (mode: "login" | "register") => void;
  onChangeTab: (tab: string) => void;
  setChatOpen: (open: boolean) => void;
  fetchNotifications: () => void;
  apiHeaders: () => any;
}

export default function HomeView({
  user,
  onOpenAuth,
  onChangeTab,
  setChatOpen,
  fetchNotifications,
  apiHeaders,
}: HomeViewProps) {
  // Local contact form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactText, setContactText] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactSuccess("");
    setContactError("");

    if (!contactName || !contactEmail || !contactSubject || !contactText) {
      setContactError("All contact fields are required.");
      return;
    }

    try {
      const r = await fetch("/api/support/message", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactText,
        }),
      });

      const resData = await r.json();
      if (!r.ok) {
        setContactError(resData.error || "Failure sending inquiry");
        return;
      }

      setContactSuccess("Your specifications registered successfully. Our consultants will update your notification board.");
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactText("");
      fetchNotifications();
    } catch (e) {
      setContactError("Unable to securely reach support channels.");
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* Elegant Hero Banner */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-28 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 font-sans">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wider text-slate-300">
            Global-Level Enterprise Software Lab
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-8 text-white">
          We Build <span className="grad-text">Futuristic SaaS Architecture</span> for Industry Leaders.
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto font-light leading-relaxed mb-10">
          WebWarp Technology Pvt Ltd. designs and deploys ultra-fast custom portals, AI-powered ERP modules, responsive CRM ecosystems, and production-ready mobile apps. Secure, compliant, and architected to turn visitors into lifelong clients.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            id="hero-free-consult-btn"
            onClick={() => {
              if (user) {
                onChangeTab("user-dashboard");
              } else {
                onOpenAuth("register");
              }
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 active:scale-95 transition-all text-sm uppercase tracking-wide cursor-pointer"
          >
            Start Project Proposal
          </button>
          <button
            id="hero-explore-chat-btn"
            onClick={() => setChatOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 font-semibold text-slate-300 transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer animate-pulse"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Ask AI Architect Now
          </button>
        </div>

        {/* High-fidelity visual metrics mockup bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl glass-panel text-center max-w-5xl mx-auto mt-12 futuristic-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">99.8%</h3>
            <p className="text-xs text-slate-400 tracking-wider font-mono mt-1">Uptime Guaranteed</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">45+</h3>
            <p className="text-xs text-slate-400 tracking-wider font-mono mt-1">SaaS Verticals Deployed</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">&lt;0.4s</h3>
            <p className="text-xs text-slate-400 tracking-wider font-mono mt-1">Average Page Hydration</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-100">$2.4M+</h3>
            <p className="text-xs text-slate-400 tracking-wider font-mono mt-1">Client Value Generated</p>
          </div>
        </div>
      </section>

      {/* Section: CAPABILITIES / SERVICES */}
      <section id="services-section" className="max-w-7xl mx-auto px-6 pt-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Enterprise Design Capabilities</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
            Tailored high-end components with responsive aesthetics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Capability 1 */}
          <div className="p-8 rounded-2xl glass-panel hover:border-violet-500/30 transition-all duration-300 group hover:-translate-y-1 text-left">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:bg-violet-500/20 transition-all">
              <Briefcase className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors mb-3">Custom Corporate ERP</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Unify logistics patterns, accounting sheets, and employee rosters inside high-fidelity administrative panels with dynamic role permissions.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-2"><span className="text-violet-400">•</span> Multitenant Database Shards</li>
              <li className="flex items-center gap-2"><span className="text-violet-400">•</span> Encrypted Payroll Ledgers</li>
            </ul>
          </div>

          {/* Capability 2 */}
          <div className="p-8 rounded-2xl glass-panel hover:border-cyan-500/30 transition-all duration-300 group hover:-translate-y-1 text-left">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-all">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors mb-3">Web & SaaS Platforms</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Deploy interactive Web Apps on auto-scaling Cloud containers with seamless payment integrations, automated telemetry monitoring, and high-speed delivery.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-2"><span className="text-cyan-400">•</span> SSR/SSG Production Speed</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">•</span> Stripe billing Webhooks ready</li>
            </ul>
          </div>

          {/* Capability 3 */}
          <div className="p-8 rounded-2xl glass-panel hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1 text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-all">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors mb-3">Advanced AI Integration</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Embed generative LLM workflows, instant automated estimation metrics, and predictive CRM logs matching Gemini capabilities directly into your dashboard.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Dynamic context tokens pool</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Multi-modal attachment analysis</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive pricing tool (Customer Conversion Feature) */}
      <AIEstimator user={user} onOpenAuth={onOpenAuth} onChangeTab={onChangeTab} />

      {/* CASE STUDIES & PORTFOLIO (Visual Showcase) */}
      <section id="portfolio-section" className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Case Histories</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-2">Projects Delivered to Global Scale</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2 font-light">Some of our recent customer request products designed and hosted flawlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Case 1 */}
          <div className="rounded-3xl bg-slate-900/35 border border-white/5 hover:border-cyan-500/10 overflow-hidden group transition-all duration-300">
            <div className="h-64 bg-slate-950 p-8 flex flex-col justify-end relative overflow-hidden text-left border-b border-white/5">
              <div className="absolute top-4 left-4 text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                CRM Ecosystem
              </div>
              <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-cyan-400/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform"></div>
              <h3 className="text-2xl font-bold text-white z-10">Ascent Pipeline CRM</h3>
              <p className="text-xs text-slate-400 font-mono mt-1 z-10">React Native • Node Express • Bigtable Core</p>
            </div>
            <div className="p-6 text-left">
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                "WebWarp Technology Pvt Ltd. built our primary marketing intake suite in 6 weeks. The user onboarding friction rate plummeted by 32% instantly after hot-deploying the glassmorphic card modules."
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-xs text-slate-400 font-mono ml-2 font-bold">— Director of Onboarding, Ascent LLC</span>
              </div>
            </div>
          </div>

          {/* Case 2 */}
          <div className="rounded-3xl bg-slate-900/35 border border-white/5 hover:border-violet-500/10 overflow-hidden group transition-all duration-300">
            <div className="h-64 bg-slate-950 p-8 flex flex-col justify-end relative overflow-hidden text-left border-b border-white/5">
              <div className="absolute top-4 left-4 text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
                Logistics Portal
              </div>
              <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-purple-400/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform"></div>
              <h3 className="text-2xl font-bold text-white z-10">Vector Logistical Suite</h3>
              <p className="text-xs text-slate-400 font-mono mt-1 z-10">Tailwind • Docker containers • Redis memory caching</p>
            </div>
            <div className="p-6 text-left">
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                "We requested automatic PDF shipping manifests generation and live container latency diagnostics. Spring Boot with simple PostgreSQL indexing was deployed seamlessly without interrupting legacy lines!"
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-xs text-slate-400 font-mono ml-2 font-bold">— VP Logistics, Vector Freight</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <span className="text-xs uppercase font-mono text-cyan-400 tracking-wider bg-white/5 px-3 py-1.5 rounded-full border border-white/10">Interactive Validation</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-10">Client Satisfactions Desk</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                RK
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Rohit Kumar</h4>
                <p className="text-[10px] text-slate-400">Chief Officer • Enterprise Tech</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Setting up client accounts utilizing simulated Google Login OAuth tokens makes validation exceptionally smooth. High end SaaS layouts!"
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                AV
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Alice Vance</h4>
                <p className="text-[10px] text-slate-400">Chief Product Officer</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "The automatic solution blueprint generated by their AI Consultant has structural budgets mapped beautifully. Complete turnarounds in record times!"
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                MS
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Markus Sterling</h4>
                <p className="text-[10px] text-slate-400">Architect Director</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Absolute global software agency product. Beautiful design language using glassmorphic tables, elegant notifications, and real-time backend updates."
            </p>
          </div>
        </div>
      </section>

      {/* Custom Consultation outreach Form / Contact Form */}
      <section id="contact-section" className="max-w-5xl mx-auto px-6">
        <div className="p-8 md:p-12 rounded-3xl glass-panel text-left futuristic-border">
          <span className="text-xs font-mono text-cyan-400">Direct Consultation Line</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1 mb-6">Brief Your System Parameters</h3>

          {contactSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              {contactSuccess}
            </div>
          )}
          {contactError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
              ⚠️ {contactError}
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Your Name</label>
              <input
                id="contact-name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Dean Henderson"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Business Email</label>
              <input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. dean@company.com"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Consultation Subject</label>
              <input
                id="contact-subject"
                type="text"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="e.g. Modular Logistic ERP with Custom Inventory Scopes"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Description of requirements</label>
              <textarea
                id="contact-message"
                rows={4}
                value={contactText}
                onChange={(e) => setContactText(e.target.value)}
                placeholder="Provide simple specifications..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none resize-none"
              ></textarea>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                id="contact-submit-btn"
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 font-semibold text-white text-xs uppercase tracking-wider hover:opacity-95 cursor-pointer"
              >
                Book Free Architecture Audit
              </button>
            </div>
          </form>
        </div>
      </section>

    </div>
  );
}
