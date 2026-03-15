import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Loader2, Bot, User, Activity } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const AIChatInterface = () => {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { id, patient_id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: inputMessage,
        timestamp: new Date().toString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");

      const assistantId = (Date.now() + 1).toString();
      let partialResponse = "";

      const newMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toString(),
      };

      setMessages((prev) => [...prev, newMessage]);

      const evtSource = new EventSource(
        `${import.meta.env.VITE_BASE_URL}/report/search?query=${encodeURIComponent(inputMessage)}&patient_id=${patient_id}&report_id=${id}`,
        { withCredentials: true },
      );

      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          partialResponse += data.token || "";
          setMessages((prev) =>
            Array.isArray(prev)
              ? prev.map((m) =>
                  m.id === assistantId ? { ...m, content: partialResponse } : m,
                )
              : [],
          );
        } catch (err) {
          console.error("Stream parse error:", err);
        }
      };

      evtSource.onerror = () => {
        evtSource.close();
        setIsLoading(false);
      };
    } catch (error) {
      toast.error("Something went wrong while sending message");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden relative font-sans selection:bg-blue-500/30">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60 p-4 lg:px-8 z-10 shrink-0"
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(31, 41, 55, 1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/report/${id}/${patient_id}`)}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl border border-transparent hover:border-gray-700"
            >
              <ArrowLeft size={22} />
            </motion.button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="text-blue-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  HealthScan AI
                </h2>
                <p className="text-xs text-green-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Online and ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 z-10 scroll-smooth">
        <div className="max-w-4xl mx-auto w-full">
          {!messages?.length ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-[60vh] flex items-center justify-center"
            >
              <div className="text-center space-y-5 max-w-md">
                <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
                  <Bot className="text-white" size={40} />
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  How can I help you?
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Ask me anything about your health reports and I'll provide AI-powered insights and summaries instantly.
                </p>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages
                ?.filter((m) => m.content !== "")
                .map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex mb-6 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end space-x-3 max-w-[85%] md:max-w-[75%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                      
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mb-1 ${
                          message.role === "user"
                            ? "bg-linear-to-br from-blue-500 to-green-500 shadow-md shadow-blue-500/20"
                            : "bg-gray-800 border border-gray-700"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="text-white" size={18} />
                        ) : (
                          <Bot className="text-blue-400" size={18} />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`relative px-5 py-3.5 shadow-xl ${
                          message.role === "user"
                            ? "bg-linear-to-r from-blue-600 to-green-600 text-white rounded-2xl rounded-br-sm"
                            : "bg-gray-900 border border-gray-800 text-gray-200 rounded-2xl rounded-bl-sm"
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className={`text-[11px] mt-2 font-medium ${message.role === "user" ? "text-blue-100/80 text-right" : "text-gray-500 text-left"}`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-6"
                >
                  <div className="flex items-end space-x-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-800 border border-gray-700 mb-1">
                      <Bot className="text-blue-400" size={18} />
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-bl-sm p-4 flex justify-center items-center space-x-2 shadow-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-950/80 backdrop-blur-xl border-t border-gray-800/60 p-4 lg:px-8 z-10 shrink-0"
      >
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-end space-x-3">
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300 shadow-inner">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your health reports..."
                className="w-full bg-transparent text-gray-200 placeholder-gray-500 p-4 resize-none focus:outline-none max-h-32 min-h-14"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-linear-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" color="white" size={24} />
              ) : (
                <Send size={24} className="ml-0.5" />
              )}
            </motion.button>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 text-center font-medium">
            AI responses are based on your uploaded health reports. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AIChatInterface;