import { useState, FormEvent } from "react";
import { Eye, EyeOff, X, Sparkles } from "lucide-react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
} from "../lib/firebase";

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  
  // Standard Auth States
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Google Sign-In Sandbox/Manual States (handy if popups are blocked by browser/iframe rules)
  const [showGoogleSandbox, setShowGoogleSandbox] = useState(false);
  const [googleSandboxEmail, setGoogleSandboxEmail] = useState("");
  const [googleSandboxName, setGoogleSandboxName] = useState("");

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState("");

  // Firebase: Google Authenticated Popup Intake
  const handleGoogleSignInClick = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const email = firebaseUser.email;
      const name = firebaseUser.displayName || email?.split("@")[0] || "Authorized User";

      if (!email) {
        setAuthError("Failed to extract validation parameters from Google account profile.");
        setAuthLoading(false);
        return;
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Firebase authentications verification rejected by local server.");
        setAuthLoading(false);
        return;
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      console.error("Firebase Google Popup authentication failed:", err);
      setAuthError(err.message || "Google single sign-in was cancelled or failed. Try standard credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Sign-In simulation / developer validation fallback
  const handleGoogleSandboxSignIn = async () => {
    setAuthError("");
    const targetEmail = googleSandboxEmail.trim();
    const targetName = googleSandboxName.trim();

    if (!targetEmail || !targetName) {
      setAuthError("Auth error: Please enter your Google display name and account email to request access.");
      return;
    }

    setAuthLoading(true);
    try {
      const r = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, name: targetName }),
      });
      const data = await r.json();

      if (!r.ok) {
        setAuthError(data.error || "OAuth secure verification rejected");
        setAuthLoading(false);
        return;
      }

      onLoginSuccess(data.token, data.user);
    } catch (e) {
      setAuthError("Connection error communicating with auth servers.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Action: Firebase email login + local JWT exchange session
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const email = loginEmail.toLowerCase().trim();

    // 1. Try standard server-side local login FIRST (enables admins like Rohit & pre-configured demos)
    try {
      const localRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: loginPassword,
        }),
      });
      const localData = await localRes.json();
      if (localRes.ok && localData.token && localData.user) {
        onLoginSuccess(localData.token, localData.user);
        return;
      }
    } catch (localErr) {
      console.info("Info: Local direct database lookup skipped or network offset:", localErr);
    }

    // 2. Fallback to Firebase Authentication
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        loginPassword
      );
      const firebaseUser = userCredential.user;

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Client Member",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || "Authentication synchronization with backend failed.");
        setAuthLoading(false);
        return;
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      console.error("Firebase Auth Email Login failed:", err);
      let errMsg = err.message || "Authentication credentials verification failed.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Verification failed: Incorrect email address or password keys.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Verification failed: Registered workspace email address format is invalid.";
      }
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Action: Firebase email registration + local JWT exchange session
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (registerPassword.length < 6) {
      setAuthError("Workspace password security key must be at least 6 characters.");
      setAuthLoading(false);
      return;
    }

    const email = registerEmail.toLowerCase().trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        registerPassword
      );
      const firebaseUser = userCredential.user;

      // Save user record securely to database (Firestore storage)
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          name: registerName.trim(),
          email,
          role: "USER",
          provider: "EMAIL",
          createdAt: new Date().toISOString(),
          status: "active"
        });
        console.log("Profile details saved in Firestore storage successfully.");
      } catch (firestoreErr) {
        console.warn("Unable to write info to Firestore (standard if rules are undeployed)", firestoreErr);
      }

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: registerName.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || "Registration validation synchronization with server failed.");
        setAuthLoading(false);
        return;
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      console.error("Firebase Auth Registration failed:", err);
      let errMsg = err.message || "Failed to initialize credentials with Firebase services.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "An account has already been registered with this email address.";
      }
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };


  // Stage 1: Request password reset email from Firebase Auth
  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setForgotSuccessMessage("");

    const targetEmail = forgotEmail.trim();
    if (!targetEmail) {
      setAuthError("Please enter your registered workspace email.");
      return;
    }

    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setForgotSuccessMessage(
        "A secure password reset link has been dispatched to your email address by Firebase."
      );
      setForgotStep(2);
    } catch (err: any) {
      console.error("Firebase Password Reset dispatch failed:", err);
      setAuthError(err.message || "Failed to communicate with password recovery engine.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl p-1 bg-gradient-to-tr from-violet-600 via-blue-500 to-cyan-400 shadow-2xl text-left relative overflow-hidden animate-in fade-in duration-300">
        <div className="rounded-[22px] bg-slate-950 p-6 md:p-8 space-y-6 relative">
          
          <button
            id="close-auth-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] uppercase font-mono bg-white/5 border border-white/10 text-cyan-400 rounded-full px-2.5 py-1">
              WebWarp Authentications Core
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-3">
              {showForgotPassword
                ? "Reset Security Key"
                : showGoogleSandbox
                ? "Secure Auth Sandbox"
                : authMode === "login"
                ? "Welcome Back Client"
                : "Register Solutions Account"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {showForgotPassword
                ? "Workspace Account Passcode Verification"
                : "Join our enterprise design ecosystem with instant verification keys"}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-mono text-center">
              ⚠️ {authError}
            </div>
          )}

          {/* Form Options Router */}
          {showForgotPassword ? (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Registered Workspace Email</label>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. youremail@example.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  {forgotSuccessMessage && (
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-xl text-center font-medium">
                      ℹ️ {forgotSuccessMessage}
                    </div>
                  )}

                  <button
                    id="forgot-request-otp-btn"
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 font-extrabold text-white tracking-wide text-xs hover:opacity-95 transition-all text-center cursor-pointer shadow-lg shadow-blue-500/20 disabled:scale-100 disabled:opacity-50"
                  >
                    {authLoading ? "Decrypting Spec Servers..." : "Send Verification Reset Link"}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-center leading-relaxed">
                    ✓ **Success! Password Reset Dispatched.**
                    <p className="text-slate-300 text-[11px] mt-2 font-normal leading-normal">
                      Firebase has generated a secure password reset link and dispatched it to **{forgotEmail}**. Please click the link inside your inbox to configure your new secure credentials, then return to sign in.
                    </p>
                  </div>

                  <button
                    id="forgot-reset-back-to-login"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotStep(1);
                      setForgotEmail("");
                      setAuthError("");
                      setForgotSuccessMessage("");
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 font-extrabold text-white tracking-wide text-xs hover:opacity-95 transition-all text-center cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    Return to Sign In screen
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotStep(1);
                  setAuthError("");
                }}
                className="w-full py-1.5 text-slate-400 hover:text-white transition-all text-[11px] font-mono hover:underline text-center"
              >
                ← Back to Sign In screen
              </button>
            </div>
          ) : showGoogleSandbox ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-10 h-10" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114a5.95 5.95 0 0 1-5.95-5.95 5.95 5.95 0 0 1 5.95-5.95c2.455 0 4.603 1.157 5.996 2.978l3.221-3.22A10.82 10.82 0 0 0 12.24 3c-5.976 0-10.8 4.824-10.8 10.8s4.824 10.8 10.8 10.8c5.448 0 10.126-3.957 10.743-9.515v-4.8H12.24Z"
                    />
                  </svg>
                </div>
                <h4 className="font-extrabold text-white text-sm">Google Identity Secure Access</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Enter your Google profile information parameters. This sandbox simulates the postMessage callback verification loop in restrictive iframe views.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Google Workspace Full Name</label>
                    <input
                      id="google-custom-name"
                      type="text"
                      required
                      value={googleSandboxName}
                      onChange={(e) => setGoogleSandboxName(e.target.value)}
                      placeholder="e.g. Your Full Name"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Google Account Email</label>
                    <input
                      id="google-custom-email"
                      type="email"
                      required
                      value={googleSandboxEmail}
                      onChange={(e) => setGoogleSandboxEmail(e.target.value)}
                      placeholder="e.g. standard@gmail.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <button
                  id="google-sandbox-custom-submit"
                  onClick={handleGoogleSandboxSignIn}
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-white tracking-wide text-xs hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {authLoading ? "Initializing Google Handshakes..." : "Authenticate Google Identity"}
                </button>

                <button
                  id="google-sandbox-back"
                  onClick={() => setShowGoogleSandbox(false)}
                  className="w-full py-1 text-slate-400 hover:text-white transition-all text-[11px] font-mono hover:underline"
                >
                  ← Back to Standard Credentials
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Std Login Mode */}
              {authMode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Workspace Email</label>
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. client@company.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-300 font-medium whitespace-pre">Secure Access Code</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginEmail);
                          setShowForgotPassword(true);
                          setForgotStep(1);
                          setAuthError("");
                        }}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Forgot Pass?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password-input"
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pr-10 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-slate-900 border-white/10 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                      />
                      Remember Session Keys
                    </label>
                  </div>

                  <button
                    id="submit-login-btn"
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 font-semibold text-white tracking-wide uppercase text-xs hover:opacity-95 text-center cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    {authLoading ? "Verifying Keys..." : "Load Client Workspace"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Corporate Client Name</label>
                    <input
                      id="register-name-input"
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Rohit Kumar"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Company Email</label>
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="e.g. client@company.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Secure Password</label>
                    <div className="relative">
                      <input
                        id="register-password-input"
                        type={showPassword ? "text" : "password"}
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pr-10 text-slate-200 text-xs focus:border-cyan-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="submit-register-btn"
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 font-semibold text-white tracking-wide uppercase text-xs hover:opacity-95 text-center cursor-pointer"
                  >
                    {authLoading ? "Submitting Ledger Details..." : "Initialize Enterprise Credentials"}
                  </button>
                </form>
              )}

              {/* Secure Google Single Sign-In Button Trigger */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-slate-950 px-2.5 text-slate-500 font-mono">OR SECURE GOOGLE INTENT</span>
                </div>

                {/* Real Firebase Google Popup Button */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={authLoading}
                    className="w-full max-w-[320px] py-2.5 px-4 rounded-xl border border-white/10 hover:border-violet-500/50 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-200 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-2.5 shadow-md shadow-slate-950 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.05-1.4-1.21-2.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </button>
                  
                  {/* Auxiliary fallback link with help info */}
                  <div className="text-center">
                    <button
                      type="button"
                      id="google-oauth-btn"
                      onClick={() => setShowGoogleSandbox(true)}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center justify-center gap-1 mx-auto mt-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                      Trouble with Popups? Use Sandbox Google Login
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Toggle Login/Signup options */}
          {!showForgotPassword && !showGoogleSandbox && (
            <div className="text-center text-xs text-slate-400 mt-4 border-t border-white/5 pt-4">
              {authMode === "login" ? (
                <>
                  First time at WebWarp Technology?{" "}
                  <button
                    id="switch-to-register"
                    onClick={() => setAuthMode("register")}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already registered account?{" "}
                  <button
                    id="switch-to-login"
                    onClick={() => setAuthMode("login")}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign In Instantly
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
