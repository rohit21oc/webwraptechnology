import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import Header from "./components/Header";
import HomeView from "./components/HomeView";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import SupportChat from "./components/SupportChat";
import WhatsAppButton from "./components/WhatsAppButton";
import { UserRole } from "./types";
import { auth, signOut, getRedirectResult } from "./lib/firebase";

export default function App() {
  // Navigation Routing States
  // "home", "user-dashboard", "admin-dashboard"
  const [currentTab, setCurrentTab] = useState<string>("home");

  // Authentication States
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [redirectLoading, setRedirectLoading] = useState<boolean>(false);
  const [redirectError, setRedirectError] = useState<string>("");

  // Support Floating AI Advisor States (controlled here or via Chat components)
  const [chatOpen, setChatOpen] = useState(false);

  // Application Data States
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Load Saved Client Sessions
  useEffect(() => {
    const savedToken = localStorage.getItem("nexus_jwt_token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserSession(savedToken);
    }
  }, []);

  // Firebase: Google Redirect Authentication Handler
  useEffect(() => {
    const handleCheckRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setRedirectLoading(true);
          const firebaseUser = result.user;
          const email = firebaseUser.email;
          const name = firebaseUser.displayName || email?.split("@")[0] || "Authorized User";
          if (email) {
            const res = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email.trim(), name: name.trim() }),
            });
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json") && res.ok) {
              const data = await res.json();
              handleLoginSuccess(data.token, data.user);
            } else {
              const text = await res.text();
              console.error("Exchange failed after redirect:", text);
              setRedirectError("Google account synchronization failed with local server.");
            }
          }
        }
      } catch (err: any) {
        console.error("Firebase auth redirect check error:", err);
        setRedirectError(err.message || "Credential verification failed during redirect handshake.");
      } finally {
        setRedirectLoading(false);
      }
    };
    handleCheckRedirect();
  }, []);

  // Sync data updates on login state triggers
  useEffect(() => {
    if (token) {
      fetchUserProjects();
      fetchNotifications();
      if (user && user.role === UserRole.ADMIN) {
        fetchAdminData();
      }
    } else {
      setProjects([]);
      setNotifications([]);
      setUsersList([]);
    }
  }, [token, user?.role]);

  // Periodic notifications ticker
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        fetchNotifications();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const apiHeaders = (customToken?: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${customToken || token}`,
  });

  const fetchUserSession = async (sessionToken: string) => {
    try {
      const r = await fetch("/api/auth/verify", {
        headers: apiHeaders(sessionToken),
      });
      if (r.ok) {
        const data = await r.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("nexus_jwt_token");
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error("Token verification fault", e);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const r = await fetch("/api/projects", { headers: apiHeaders() });
      if (r.ok) {
        const data = await r.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed loading projects feed", e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const r = await fetch("/api/notifications", { headers: apiHeaders() });
      if (r.ok) {
        const data = await r.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed loading notifications feed", e);
    }
  };

  const fetchAdminData = async () => {
    try {
      const userRes = await fetch("/api/users", { headers: apiHeaders() });
      if (userRes.ok) {
        const uData = await userRes.json();
        setUsersList(uData);
      }
      const msgRes = await fetch("/api/messages", { headers: apiHeaders() });
      if (msgRes.ok) {
        const mData = await msgRes.json();
        setMessages(mData);
      }
    } catch (e) {
      console.error("Admin data hydration error", e);
    }
  };

  // Mark all notifications read
  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: apiHeaders(),
      });
      fetchNotifications();
    } catch (e) {
      console.error("Mark read fault", e);
    }
  };

  // Sign out
  const handleLogout = () => {
    signOut(auth).catch((err) => console.error("Firebase signout error:", err));
    localStorage.removeItem("nexus_jwt_token");
    setToken(null);
    setUser(null);
    setCurrentTab("home");
  };

  const handleOpenAuth = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (newToken: string, loggedUser: any) => {
    setToken(newToken);
    setUser(loggedUser);
    localStorage.setItem("nexus_jwt_token", newToken);
    setShowAuthModal(false);
    setCurrentTab(loggedUser.role === UserRole.ADMIN ? "admin-dashboard" : "user-dashboard");
  };

  return (
    <div id="canvas-root" className="min-h-screen flex flex-col font-sans selection:bg-violet-500/30 selection:text-white relative bg-slate-950 text-slate-100 overflow-x-hidden">
      
      {/* Visual background ambient circles */}
      <div className="absolute top-0 left-0 right-0 h-[1000px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-300px] left-[10%] w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[200px] right-[5%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px] animate-pulse"></div>
      </div>

      <Header
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => handleOpenAuth("login")}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
      />

      {/* Main Body Engine */}
      <main className="flex-1 w-full z-10">
        
        {/* ========================================== */}
        {/* SCREEN SECTION: HOME & MARKETING           */}
        {/* ========================================== */}
        {currentTab === "home" && (
          <HomeView
            user={user}
            onOpenAuth={handleOpenAuth}
            onChangeTab={setCurrentTab}
            setChatOpen={setChatOpen}
            fetchNotifications={fetchNotifications}
            apiHeaders={apiHeaders}
          />
        )}

        {/* ========================================== */}
        {/* SCREEN SECTION: USER WORKSPACE DASHBOARD   */}
        {/* ========================================== */}
        {currentTab === "user-dashboard" && (
          <UserDashboard
            user={user}
            projects={projects}
            token={token}
            fetchUserProjects={fetchUserProjects}
            fetchNotifications={fetchNotifications}
            apiHeaders={apiHeaders}
          />
        )}

        {/* ========================================== */}
        {/* SCREEN SECTION: SECURE ADMIN OPERATOR DECK */}
        {/* ========================================== */}
        {currentTab === "admin-dashboard" && user?.role === UserRole.ADMIN && (
          <AdminDashboard
            user={user}
            projects={projects}
            usersList={usersList}
            messages={messages}
            token={token}
            fetchUserProjects={fetchUserProjects}
            fetchNotifications={fetchNotifications}
            apiHeaders={apiHeaders}
          />
        )}

      </main>

      {/* Floating AI Consultant Chat Modal */}
      <SupportChat />

      {/* Floating WhatsApp Quick link button */}
      <WhatsAppButton />

      {/* GLOBAL AUTH MODAL */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Google Redirect Authentication Overlay Loader */}
      {redirectLoading && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[999] flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-violet-500 animate-spin [animation-duration:1.5s]"></div>
            <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <h3 className="text-base font-semibold text-white tracking-wider mb-2 font-mono uppercase">Synchronizing OAuth Session</h3>
          <p className="text-xs text-slate-400 max-w-sm">Please wait while we verify your Google Authentication status and update secure tokens on the server...</p>
        </div>
      )}

      {redirectError && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[999] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border border-red-500/30 p-6 rounded-2xl max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setRedirectError("")}
              className="absolute top-3 right-3 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4 font-mono font-bold text-lg">!</div>
            <h3 className="text-sm font-bold text-white mb-2">Google Single Sign-In Handshake Failed</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{redirectError}</p>
            <button
              onClick={() => setRedirectError("")}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all"
            >
              Dismiss Notice
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
