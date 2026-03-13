import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Loader2, Bot, User } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

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
      weekday: "short", // "Mon"
      day: "2-digit", // "31"
      month: "short", // "Oct"
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // "10:45 AM"
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
    <div className="h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 flex overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800/60 backdrop-blur-xl border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={()=>{
                    navigate(`/report/${id}/${patient_id}`)
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Ask anything about your health report
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {!messages?.length ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Bot className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  How can I help you today?
                </h3>
                <p className="text-gray-400">
                  Ask me anything about your health reports and I'll provide
                  insights using AI.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages
                ?.filter((m) => m.content != "")
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`flex space-x-3 max-w-3xl ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          message.role === "user"
                            ? "bg-linear-to-br from-blue-500 to-green-500"
                            : "bg-gray-700 border border-gray-600"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="text-white" size={20} />
                        ) : (
                          <Bot className="text-blue-400" size={20} />
                        )}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-linear-to-r from-blue-600 to-green-600 text-white"
                            : "bg-gray-800/60 border border-gray-700 text-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex space-x-3 max-w-3xl">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-700 border border-gray-600">
                      <Bot className="text-blue-400" size={20} />
                    </div>
                    <div className="rounded-2xl p-4 flex justify-center items-center">
                      <Loader2
                        className="animate-spin"
                        size={20}
                        color="white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-gray-800/60 backdrop-blur-xl p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 bg-gray-900/50 border border-gray-600 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your health reports..."
                  className="w-full bg-transparent text-white placeholder-gray-500 p-4 resize-none focus:outline-none max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-linear-to-r from-blue-600 to-green-600 text-white p-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" color="white" size={24} />
                ) : (
                  <Send size={24} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI responses are based on your uploaded health reports. Always
              consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIChatInterface;
