import { useState, ChangeEvent, FormEvent } from "react";
import { ShieldCheck, PlusCircle, Paperclip, Layers, Sparkles } from "lucide-react";
import { ProjectType } from "../types";

interface UserDashboardProps {
  user: any;
  projects: any[];
  token: string | null;
  fetchUserProjects: () => void;
  fetchNotifications: () => void;
  apiHeaders: () => any;
}

export default function UserDashboard({
  user,
  projects,
  fetchUserProjects,
  fetchNotifications,
  apiHeaders,
}: UserDashboardProps) {
  // Local project lodging states
  const [companyName, setCompanyName] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>(ProjectType.WEBSITE);
  const [budgetRange, setBudgetRange] = useState("$10,000 - $25,000");
  const [timelineStr, setTimelineStr] = useState("2-3 Months (Standard)");
  const [projectDescription, setProjectDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentData, setAttachmentData] = useState("");
  
  const [projectSubmitSuccess, setProjectSubmitSuccess] = useState(false);
  const [projectSubmitError, setProjectSubmitError] = useState("");
  const [workspaceNotesInput, setWorkspaceNotesInput] = useState("");

  // Handler for custom file updates
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit project request spec
  const handleProjectRequestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProjectSubmitError("");
    setProjectSubmitSuccess(false);

    if (!projectDescription.trim()) {
      setProjectSubmitError("Write a brief description of what software tools are needed.");
      return;
    }

    try {
      const payload = {
        companyName,
        phone: phoneValue,
        projectType: selectedProjectType,
        budget: budgetRange,
        deadline: timelineStr,
        description: projectDescription,
        attachmentName: attachmentName || undefined,
        attachmentData: attachmentData || undefined,
      };

      const r = await fetch("/api/projects", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await r.json();
      if (!r.ok) {
        setProjectSubmitError(data.error || "Failure to submit guidelines");
        return;
      }

      setProjectSubmitSuccess(true);
      setCompanyName("");
      setPhoneValue("");
      setProjectDescription("");
      setAttachmentName("");
      setAttachmentData("");
      
      fetchUserProjects();
      fetchNotifications();
    } catch (e) {
      setProjectSubmitError("Unable to securely dispatch proposal request.");
    }
  };

  // Discussion notes updates
  const handleWorkspaceThreadReply = async (projId: string) => {
    if (!workspaceNotesInput.trim()) return;
    try {
      const r = await fetch(`/api/projects/${projId}/notes`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ notes: workspaceNotesInput }),
      });
      if (r.ok) {
        setWorkspaceNotesInput("");
        fetchUserProjects();
        fetchNotifications();
      }
    } catch (error) {
      console.error("Notes post error:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      
      {/* Header / Intro Card */}
      <div className="p-8 rounded-3xl glass-panel relative border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 futuristic-border overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-violet-600 via-cyan-500 to-transparent"></div>
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Active Client Session</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Welcome to Your Account, <span className="grad-text">{user?.name}</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Manage projects requests, track AI solutions blueprints, and communicate directly with primary senior consultants.
          </p>
        </div>

        <div id="user-role-badge" className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-mono">Authentication Role</p>
            <p className="text-xs font-bold text-slate-100 font-mono uppercase">{user?.role || "USER"}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Split Elements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Register project form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-left relative">
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              Lodge New App Request
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Our solutions engineers will generate real architecture estimates using generative systems.
            </p>

            {projectSubmitSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                Project request success! View details on the right pane. Dynamic solution milestones report generated shortly via backend support system.
              </div>
            )}
            {projectSubmitError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-semibold">
                ⚠️ {projectSubmitError}
              </div>
            )}

            <form onSubmit={handleProjectRequestSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Company / Branch Name</label>
                <input
                  id="user-company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Biotech Systems"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Callback Phone Number</label>
                <input
                  id="user-phone-val"
                  type="text"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  placeholder="e.g. +1 (321) 456-7890"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Project Paradigm</label>
                  <select
                    id="user-project-type"
                    value={selectedProjectType}
                    onChange={(e) => setSelectedProjectType(e.target.value as ProjectType)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs outline-none focus:border-cyan-400"
                  >
                    <option value={ProjectType.WEBSITE}>Global Website</option>
                    <option value={ProjectType.MOBILE_APP}>Hybrid Mobile App</option>
                    <option value={ProjectType.CRM}>CRM Pipeline</option>
                    <option value={ProjectType.ERP}>Multimodule ERP</option>
                    <option value={ProjectType.CUSTOM_SOFTWARE}>Custom App Core</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Target Duration Bracket</label>
                  <select
                    id="user-project-deadline"
                    value={timelineStr}
                    onChange={(e) => setTimelineStr(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs outline-none focus:border-cyan-400"
                  >
                    <option value="1 Month (Express)">1 Month (Express)</option>
                    <option value="2-3 Months (Standard)">2-3 Months (Standard)</option>
                    <option value="4-6 Months (Large)">4-6 Months (Large)</option>
                    <option value="Continuous Sprints (Enterprise)">Continuous Sprints</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Financial Bracket Allocation</label>
                <select
                  id="user-project-budget"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs outline-none focus:border-cyan-400"
                >
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                  <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                  <option value="Custom Enterprise Scale ($100k+)">$100,000+ Enterprise Scale</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Project Description & Core Specs</label>
                <textarea
                  id="user-project-desc"
                  rows={4}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Detail user roles, target hosting containers, integrations, etc."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none resize-none"
                ></textarea>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Requirements Attachment / SOW</label>
                <div className="border border-dashed border-white/15 hover:border-cyan-500/40 rounded-xl p-4 bg-slate-950/40 hover:bg-slate-950 text-center transition-all cursor-pointer relative">
                  <input
                    id="user-file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <Paperclip className="w-5 h-5 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-300">
                      {attachmentName ? attachmentName : "Upload Attachment / Diagram Doc"}
                    </p>
                    <p className="text-[10px] text-slate-500">PDF, JPG, PNG or DOCX up to 10MB</p>
                  </div>
                </div>
              </div>

              <button
                id="submit-proposal-btn"
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-xs uppercase tracking-wide cursor-pointer hover:opacity-95 text-center"
              >
                Dispatch Proposal Code
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Track active project state and chat panel */}
        <div className="lg:col-span-7 space-y-8">
          <div className="text-left">
            <h3 className="text-xl font-bold text-white mb-4">My Initiated Project Pipelines</h3>
            {projects.length === 0 ? (
              <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/10 text-center text-slate-400">
                <Layers className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                No requests active in your file yet. Lodge specifications via the left form!
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-6 rounded-2xl glass-panel relative border border-white/5 space-y-4">
                    
                    {/* Header metrics */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-md tracking-wide">
                            {proj.projectType}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 font-mono py-0.5 px-2 rounded-full">
                            ID: {proj.id?.slice(0, 8)}...
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Submitted {new Date(proj.createdAt).toLocaleDateString()} at {new Date(proj.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {/* Status Indicator pill */}
                      <span className={`text-[10px] font-bold uppercase py-1 px-3 rounded-md font-mono ${
                        proj.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        proj.status === "In Progress" ? "bg-blue-500/10 text-cyan-400 border border-blue-500/20" :
                        proj.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        proj.status === "Rejected" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}>
                        ● {proj.status}
                      </span>
                    </div>

                    {/* Progress Status Bar map */}
                    <div className="space-y-1.5 py-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Lodged</span>
                        <span>In Review</span>
                        <span>Coded</span>
                        <span>Complete</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex font-sans">
                        <div className={`h-full bg-cyan-400 transition-all ${
                          proj.status === "Pending" ? "w-1/4" :
                          proj.status === "Under Discussion" ? "w-2/4" :
                          proj.status === "In Progress" ? "w-3/4" :
                          proj.status === "Completed" ? "w-full" :
                          "w-0 bg-transparent"
                        }`}></div>
                      </div>
                    </div>

                    {/* Specs breakdown */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono py-2 bg-slate-950/50 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-500">Company Group</span>
                        <p className="text-slate-200 mt-0.5">{proj.companyName}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Timeline Duration</span>
                        <p className="text-slate-200 mt-0.5">{proj.deadline}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Allocated Budget</span>
                        <p className="text-emerald-400 mt-0.5 font-bold">{proj.budget}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Attachment Spec</span>
                        <p className="text-slate-200 mt-0.5 truncate max-w-[140px]">
                          {proj.attachmentName ? proj.attachmentName : "None Linked"}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-left">
                      <span className="text-slate-400 block font-medium mb-1">Client Brief:</span>
                      <p className="text-slate-300 leading-relaxed bg-slate-950/20 p-3 rounded-xl italic">
                        "{proj.description}"
                      </p>
                    </div>

                    {/* AI CONSULTANT BLUEPRINT CODE (True Gemini Output) */}
                    <div className="rounded-xl bg-violet-950/20 border border-violet-500/20 p-4 space-y-2 text-left">
                      <h5 className="font-extrabold text-xs text-violet-300 flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        WEBWARP AGENT ARCHITECTURE BLUEPRINT (REAL AI RESPONSE)
                      </h5>
                      <div className="text-slate-300 text-[11px] font-sans leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
                        {proj.aiAnalysis}
                      </div>
                    </div>

                    {/* Direct Messages & Discussion notes thread */}
                    <div className="space-y-3 pt-2 text-left">
                      <h5 className="text-xs font-bold text-slate-300 font-mono">Consultant Discussion Thread</h5>
                      <div className="bg-slate-950/80 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2 text-[11px] font-mono leading-relaxed">
                        {proj.adminNotes ? (
                          proj.adminNotes.split("\n").map((line: string, i: number) => (
                            <div key={i} className={`p-1.5 rounded ${line.startsWith("Admin:") ? "text-cyan-400 font-semibold" : "text-slate-300"}`}>
                              {line}
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 italic">No notes logged yet. Post a question below to start discussion.</p>
                        )}
                      </div>

                      {/* Reply Input block */}
                      <div className="flex gap-2">
                        <input
                          id={`note-input-${proj.id}`}
                          type="text"
                          placeholder="Address questions to WebWarp senior architects..."
                          value={workspaceNotesInput}
                          onChange={(e) => setWorkspaceNotesInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleWorkspaceThreadReply(proj.id);
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 outline-none"
                        />
                        <button
                          onClick={() => handleWorkspaceThreadReply(proj.id)}
                          className="bg-white/10 hover:bg-white/20 px-3 rounded-lg text-cyan-400 text-xs font-bold transition-all shrink-0 cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
