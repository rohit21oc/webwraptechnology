import { Bell, LogOut, ShieldAlert, User } from "lucide-react";
import { useState } from "react";
import { UserRole, Notification } from "../types";

interface HeaderProps {
  user: any;
  onLogout: () => void;
  onOpenAuth: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export default function Header({
  user,
  onLogout,
  onOpenAuth,
  notifications,
  onMarkRead,
  currentTab,
  onChangeTab
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Branding Logo */}
        <div 
          onClick={() => onChangeTab("home")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
            <span className="font-bold text-white tracking-widest text-lg">W</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-lg tracking-wide">WEBWARP</span>
              <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono font-bold">TECHNOLOGY</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Pvt Ltd • Solutions Lab</p>
          </div>
        </div>

        {/* Global Navigations Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            id="nav-home"
            onClick={() => onChangeTab("home")}
            className={`text-sm font-medium transition-colors cursor-pointer ${currentTab === "home" ? "text-cyan-400 font-semibold" : "text-slate-300 hover:text-white"}`}
          >
            Home
          </button>
          <button
            id="nav-services"
            onClick={() => { onChangeTab("home"); setTimeout(() => document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Capabilities
          </button>
          <button
            id="nav-portfolio"
            onClick={() => { onChangeTab("home"); setTimeout(() => document.getElementById("portfolio-section")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Case Studies
          </button>
          <button
            id="nav-pricing"
            onClick={() => { onChangeTab("home"); setTimeout(() => document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            id="nav-contact"
            onClick={() => { onChangeTab("home"); setTimeout(() => document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Consult
          </button>

          {/* User Specific Tabs */}
          {user && (
            <>
              <button
                id="nav-user-dashboard"
                onClick={() => onChangeTab("user-dashboard")}
                className={`text-sm font-medium transition-colors cursor-pointer ${currentTab === "user-dashboard" ? "text-cyan-400 font-semibold" : "text-slate-300 hover:text-white"}`}
              >
                My Workspace
              </button>

              {user.role === UserRole.ADMIN && (
                <button
                  id="nav-admin-dashboard"
                  onClick={() => onChangeTab("admin-dashboard")}
                  className={`text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 cursor-pointer ${currentTab === "admin-dashboard" ? "border-purple-400/50 bg-purple-500/20 font-semibold" : ""}`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Operator Deck
                </button>
              )}
            </>
          )}
        </nav>

        {/* Global Action items */}
        <div className="flex items-center gap-4">
          
          {/* Notifications Center */}
          {user && (
            <div className="relative">
              <button
                id="header-notif-trigger"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-slate-950 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown panels */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl p-2 bg-slate-950 border border-white/10 shadow-2xl z-55 text-left">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                    <span className="font-bold text-xs text-white uppercase tracking-wider">Feed Alerts</span>
                    <span className="text-[10px] bg-white/10 px-1.5 rounded text-cyan-400 font-semibold">{unreadCount} Pending</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-lg text-left transition-all ${notif.readStatus ? "opacity-60" : "bg-white/5"}`}
                        >
                          <div className="flex justify-between items-start">
                            <h5 className="font-semibold text-xs text-slate-200">{notif.title}</h5>
                            {!notif.readStatus && (
                              <button
                                onClick={() => onMarkRead(notif.id)}
                                className="text-[9px] text-cyan-400 hover:underline hover:text-cyan-300 ml-2 shrink-0 cursor-pointer"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-500 font-mono mt-2 block">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth Action triggers */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right select-none">
                <span className="text-xs font-semibold text-white truncate max-w-[124px]">{user.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                  {user.role}
                </span>
              </div>
              
              <div
                onClick={() => onChangeTab(user.role === UserRole.ADMIN ? "admin-dashboard" : "user-dashboard")}
                className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-cyan-400 cursor-pointer hover:border-cyan-400/50 transition-colors"
                title="Go to Dashboard"
              >
                <User className="w-4 h-4" />
              </div>

              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="header-login-trigger"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
