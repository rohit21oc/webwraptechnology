import { useState, FormEvent } from "react";
import { Filter, Search, Trash2, Users, Mail, X } from "lucide-react";
import { ProjectStatus } from "../types";

interface AdminDashboardProps {
  user: any;
  projects: any[];
  usersList: any[];
  messages: any[];
  token: string | null;
  fetchUserProjects: () => void;
  fetchNotifications: () => void;
  apiHeaders: () => any;
}

export default function AdminDashboard({
  projects,
  usersList,
  messages,
  fetchUserProjects,
  fetchNotifications,
  apiHeaders,
}: AdminDashboardProps) {
  // Local active states
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [adminReplyStatus, setAdminReplyStatus] = useState<ProjectStatus>(ProjectStatus.PENDING);
  const [adminReplyNotes, setAdminReplyNotes] = useState("");
  
  const [adminTypeQuery, setAdminTypeQuery] = useState<string>("ALL");
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");

  // Filter projects by paradigm and customer name query
  const adminFilteredProjects = projects.filter((p) => {
    const matchesType = adminTypeQuery === "ALL" || p.projectType === adminTypeQuery;
    const clientName = p.clientName || "";
    const companyName = p.companyName || "";
    const matchesSearch =
      clientName.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(adminSearchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Action: update status and reply notes
  const handleAdminUpdateStatus = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const r = await fetch(`/api/projects/${editingProject.id}/status`, {
        method: "PATCH",
        headers: apiHeaders(),
        body: JSON.stringify({
          status: adminReplyStatus,
          adminNotes: adminReplyNotes,
        }),
      });

      if (r.ok) {
        setEditingProject(null);
        setAdminReplyNotes("");
        fetchUserProjects();
        fetchNotifications();
      }
    } catch (err) {
      console.error("Admin action status transit failed", err);
    }
  };

  // Action: delete project spec
  const handleAdminDeleteProject = async (id: string) => {
    if (!window.confirm("Are you absolutely certain you want to erase this client contract/request record?")) return;
    try {
      const r = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: apiHeaders(),
      });
      if (r.ok) {
        fetchUserProjects();
        fetchNotifications();
      }
    } catch (e) {
      console.error("Admin delete action fault", e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      
      {/* Header statistics */}
      <div className="p-8 rounded-3xl glass-panel relative border border-white/5 flex flex-col md:flex-row justify-between gap-6 mb-10 futuristic-border overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 via-rose-500 to-transparent"></div>
        <div>
          <span className="text-xs uppercase bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-1 rounded-sm font-bold font-mono">
            Administrative Command Mode
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-3 select-none">Operator Control Center</h1>
          <p className="text-slate-400 text-xs mt-1">
            Read customer requests, update system deployment pipelines, view system diagnostics logs, and configure feedback chains.
          </p>
        </div>

        {/* Quick stats totals */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-left shrink-0">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Projects Logged</span>
            <div className="text-md md:text-xl font-bold text-slate-100 font-mono">{projects.length} Proposals</div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Global Accounts</span>
            <div className="text-md md:text-xl font-bold text-slate-100 font-mono">{usersList.length} Active</div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Contact Feed</span>
            <div className="text-md md:text-xl font-bold text-slate-100 font-mono">{messages.length} Feedbacks</div>
          </div>
        </div>
      </div>

      {/* Admin filters & control bar */}
      <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Filter Paradigm:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "Website", "Mobile App", "CRM", "ERP", "Custom Software"].map((item) => (
              <button
                key={item}
                onClick={() => setAdminTypeQuery(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${adminTypeQuery === item ? "bg-violet-600 text-white font-bold" : "bg-white/5 text-slate-400 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Query customer name..."
            value={adminSearchQuery}
            onChange={(e) => setAdminSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:border-cyan-400 outline-none"
          />
        </div>
      </div>

      {/* Split panels: Manage applications vs manage user directory & messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left pane: Active Client Requests management table (Sprints) */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-bold text-white mb-2">Primary Project Propositions Archive ({adminFilteredProjects.length})</h3>
          
          {adminFilteredProjects.length === 0 ? (
            <p className="text-xs text-slate-400 bg-slate-900/10 border border-white/5 p-8 rounded-xl text-center">
              No matches located under search specifications.
            </p>
          ) : (
            <div className="space-y-6">
              {adminFilteredProjects.map((proj) => (
                <div key={proj.id} className="p-6 rounded-2xl glass-panel text-left relative space-y-4 border border-white/5">
                  
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-md text-slate-200">
                          {proj.clientName}
                        </h4>
                        <span className="text-[10px] bg-white/5 px-2 rounded text-slate-400 font-mono">
                          {proj.companyName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{proj.clientEmail} • {proj.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded">
                        {proj.budget}
                      </span>
                      <button
                        id={`edit-proj-${proj.id}`}
                        onClick={() => {
                          setEditingProject(proj);
                          setAdminReplyStatus(proj.status);
                          setAdminReplyNotes(proj.adminNotes || "");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Edit Status
                      </button>
                      <button
                        id={`delete-proj-${proj.id}`}
                        onClick={() => handleAdminDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Request parameters detail block */}
                  <div className="text-xs grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-xl font-mono">
                    <div>
                      <span className="text-slate-500">ProjectType</span>
                      <p className="text-slate-300 mt-0.5">{proj.projectType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Timeline Limit</span>
                      <p className="text-slate-300 mt-0.5">{proj.deadline}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">CurrentStatus</span>
                      <p className="text-cyan-400 mt-0.5 font-bold">{proj.status}</p>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-400 block font-medium">Brief Requirements:</span>
                    <p className="text-slate-300 bg-slate-950/20 p-3 rounded-lg italic leading-relaxed">
                      "{proj.description}"
                    </p>
                  </div>

                  {/* File asset preview in admin panel */}
                  {proj.attachmentName && (
                    <div className="text-xs p-2.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
                      <span className="font-mono text-slate-400 text-[11px] truncate max-w-[200px]">
                        📎 Schema file: {proj.attachmentName}
                      </span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Document stored in filesystem
                      </span>
                    </div>
                  )}

                  {/* Dynamic Notes view */}
                  {proj.adminNotes && (
                    <div className="p-3 bg-slate-950/80 rounded-xl space-y-1.5 text-[11px] font-mono leading-relaxed">
                      <span className="text-slate-500">Current Discussion Track:</span>
                      {proj.adminNotes.split("\n").map((line: string, idx: number) => (
                        <p key={idx} className={line.startsWith("Admin:") ? "text-cyan-400 font-semibold" : "text-slate-300"}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                  
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Registered customers roster & contact form logs */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Registered users card list */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Global Clients Roster
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {usersList.length === 0 ? (
                <p className="text-xs text-slate-400">No registered client records found.</p>
              ) : (
                usersList.map((usr) => (
                  <div key={usr.id} className="p-3 rounded-xl bg-slate-950/50 text-[11px] font-mono">
                    <p className="font-bold text-slate-200 truncate">{usr.name}</p>
                    <p className="text-slate-400 truncate mt-0.5">{usr.email}</p>
                    <div className="flex justify-between items-center text-[10px] mt-2 border-t border-white/5 pt-1.5 text-slate-500 font-sans">
                      <span>OAuth: {usr.provider}</span>
                      <span>{new Date(usr.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Received Contact/Consultation responses */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" />
              Global Consultation Inquiries
            </h3>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400">No submission messages in active server buffers.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-3 bg-slate-950/80 rounded-xl space-y-1.5 text-left text-[11px]">
                    <div className="flex justify-between items-start font-mono">
                      <span className="font-bold text-slate-300 truncate">{msg.name}</span>
                      <span className="text-[9px] text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-400 font-mono text-[10px]">{msg.email}</p>
                    <h5 className="font-sans font-bold text-slate-205 border-b border-white/5 pb-1 text-slate-200">Subj: {msg.subject}</h5>
                    <p className="text-slate-300 leading-relaxed font-sans">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Float dialog Panel for updating project status */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 bg-slate-900 border border-white/10 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-bold text-lg text-white">Modify Status for {editingProject.clientName}</h4>
              <button id="close-admin-edit-modal" onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminUpdateStatus} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Paradigm Status</label>
                <select
                  id="admin-status-select"
                  value={adminReplyStatus}
                  onChange={(e) => setAdminReplyStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs outline-none focus:border-cyan-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Discussion">Under Discussion</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Architect Notes Reply (Post in context channel)</label>
                <textarea
                  id="admin-notes-textarea"
                  rows={4}
                  value={adminReplyNotes}
                  onChange={(e) => setAdminReplyNotes(e.target.value)}
                  placeholder="e.g. Thanks, we recommend setting database schema using PostgreSQL on Google Cloud SQL."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Commence Status Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
