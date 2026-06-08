import { useState, FormEvent } from "react";
import { Sparkles, X, Send } from "lucide-react";

export default function SupportChat() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      sender: "ai",
      text: "Welcome to WebWarp Technology Pvt Ltd. I am your AI Enterprise Architect. Let's design premium software structures together. Ask me about custom workflows or get an estimate instantly or create an account to officially lodge specs!",
      createdAt: new Date().toISOString()
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleSupportMessageSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userLine = {
      sender: "user",
      text: chatMessage,
      createdAt: new Date().toISOString()
    };

    setChatHistory((p) => [...p, userLine]);
    const inputMsg = chatMessage;
    setChatMessage("");
    setChatLoading(true);

    try {
      const r = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMsg,
          chatHistory: chatHistory.map((h) => ({ sender: h.sender, text: h.text }))
        })
      });
      const data = await r.json();
      setChatLoading(false);
      setChatHistory((p) => [
        ...p,
        {
          sender: "ai",
          text: data.response || "Our network is experiencing minor load variance. Please prompt again.",
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (e) {
      setChatLoading(false);
      setChatHistory((p) => [
        ...p,
        {
          sender: "ai",
          text: "I was unable to establish connection to our specification engine. Please verify connectivity.",
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <>
      {chatOpen ? (
        <div className="fixed bottom-24 right-6 z-40 w-80 md:w-96 rounded-2xl p-4 glass-panel-heavy shadow-2xl transition-all duration-300 text-left scale-100 flex flex-col max-h-[480px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">Solutions Architect Agent</h4>
                <p className="text-[10px] text-cyan-400">Powered by Gemini-3.5-Flash</p>
              </div>
            </div>
            <button
              id="close-chat-trigger"
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3 max-h-71">
            {chatHistory.map((h, i) => (
              <div key={i} className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                h.sender === "user" ? "bg-cyan-600 text-white ml-auto" : "bg-white/5 text-slate-300"
              }`}>
                {h.text}
              </div>
            ))}
            {chatLoading && (
              <div className="bg-white/5 text-slate-400 text-xs italic p-2 rounded-xl max-w-[50%] animate-pulse">
                Formulating architecture...
              </div>
            )}
          </div>

          <form onSubmit={handleSupportMessageSend} className="border-t border-white/5 pt-3 mt-auto flex gap-2">
            <input
              id="chat-message-input"
              type="text"
              placeholder="Ask about budgets, ERP or tech choices..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 outline-none"
            />
            <button
              id="chat-send-btn"
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 p-2 rounded-lg text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          id="open-ai-chat-btn"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white shadow-lg animate-pulse z-40"
          title="Consult AI Architect"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
