import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="mb-3 w-80 rounded-2xl p-4 glass-panel-heavy shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                  N
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">Nexus Support Agent</h4>
                <p className="text-xs text-emerald-400">Online • Typically replies instantly</p>
              </div>
            </div>
            <button
              id="close-whatsapp-prompt"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed/6">
            "Welcome to Nexus Automata! Let's discuss your web application, mobile app, or ERP specifications today. Our consulting is completely risk-free."
          </p>
          <a
            id="whatsapp-chat-link"
            href="https://wa.me/917645050131?text=Hi%20Nexus%20Automata,%20I'm%20interested%20in%20a%20project%20consultation!"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-medium text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4" />
            Start WhatsApp Chat
          </a>
        </div>
      ) : (
        <button
          id="whatsapp-float-trigger"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300"></span>
          </span>
        </button>
      )}
    </div>
  );
}
