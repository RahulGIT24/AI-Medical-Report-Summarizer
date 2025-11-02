import { useState, useRef, useEffect } from "react"
import {
    Send,
    Plus,
    MessageSquare,
    Trash2,
    Menu,
    X,
    ArrowLeft,
    Loader2,
    Bot,
    User,
} from "lucide-react"
import { useNavigate } from "react-router"
import { apiCall } from "../lib/apiCall"
import { useSearchParams } from 'react-router-dom';
import { toast } from "react-toastify"

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface ChatSession {
    id: string;
    title: string;
    timestamp: string;
}

const AIChatInterface = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const currentSessionRef = useRef<string | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)

    const [messages, setMessages] = useState<Message[]>([])

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            const res = await apiCall("/chat/session", "GET")
            setSessions(res.sessions)
        } catch (error) {
            toast.error("Error while fetching sessions")
        }
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleNewChat = () => {
        currentSessionRef.current = null;
        setCurrentSession(null)
        setMessages([])
        setSearchParams((prevParams) => {
            prevParams.delete('session_id'); 
            return prevParams;
        });
    };

    const formatTimestamp = (timestamp: string) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleString("en-IN", {
            weekday: "short", // "Mon"
            day: "2-digit",   // "31"
            month: "short",   // "Oct"
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,     // "10:45 AM"
        });
    };

    const handleSendMessage = async () => {
        // if(!currentSession) return;
        if (!inputMessage.trim()) return;

        setIsLoading(true);

        try {
            // Step 1: Ensure session exists
            let sessionId = currentSessionRef.current;

            if (!sessionId) {
                // Create new chat session on backend
                const title = inputMessage.slice(0, 30) + "...";
                const res = await apiCall("/chat/session", "POST", { name: title });

                // Save the new session locally
                const newSession: ChatSession = {
                    id: res.id,
                    title: title,
                    timestamp: (new Date).toString(),
                };

                setSessions(prev => [newSession, ...prev]);
                // setCurrentSession(newSession)
                // currentSessionRef.current = res.id;
                sessionId = res.id;
            }

            const userMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content: inputMessage,
                timestamp: (new Date).toString(),
            };

            setMessages(prev => [...prev, userMessage])

            // Step 2: Add user message to the session
            setSessions(prev =>
                prev.map(session =>
                    session.id === sessionId
                        ? {
                            ...session,
                        }
                        : session
                )
            );

            setInputMessage("");

            // Step 3: Create placeholder assistant message
            const assistantId = (Date.now() + 1).toString();
            let partialResponse = "";

            const newMessage: Message = {
                id: assistantId,
                role: "assistant",
                content: "",
                timestamp: (new Date).toString(),
            }

            setMessages(prev => [...prev, newMessage]);


            // Step 4: Start SSE stream
            const evtSource = new EventSource(
                `${import.meta.env.VITE_BASE_URL}/report/search?query=${encodeURIComponent(inputMessage)}&session_id=${sessionId}`,
                { withCredentials: true }
            );

            evtSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    partialResponse += data.token || "";
                    setMessages(prev =>
                        Array.isArray(prev)
                            ? prev.map(m =>
                                m.id === assistantId
                                    ? { ...m, content: partialResponse }
                                    : m
                            )
                            : []
                    );
                } catch (err) {
                    console.error("Stream parse error:", err);
                }
            };

            evtSource.onerror = (err) => {
                console.error("Stream error:", err);
                evtSource.close();
                setIsLoading(false);
            };

            evtSource.addEventListener("end", () => {
                if (sessionId) {
                    if (!searchParams.get("session_id")) {
                        setSearchParams({ "session_id": sessionId })
                    }
                }
                evtSource.close();
                setIsLoading(false);
            });

        } catch (error) {
            console.error("Error while sending message:", error);
            toast.error("Something went wrong while sending message");
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (await deleteSession(sessionId)) {
            setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
            if (currentSessionRef.current === sessionId) {
                currentSessionRef.current = (sessions[0]?.id || null);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const deleteSession = async (id: string) => {
        try {
            const res = await apiCall(`/chat/session?id=${id}`, "DELETE")
            toast.success(res.message);
            return true
        } catch (error) {
            toast.error("Unable to delete session")
            return false
        }
    }

    const fetchChats = async () => {
        if (!currentSessionRef.current) return;
        try {
            const res = await apiCall(`/chat/chats?session_id=${currentSessionRef.current}`)
            setMessages(res.chats);
        } catch (error) {
            toast.error("Error while fetching chats")
        }
    }

    useEffect(() => {
        fetchChats()
    }, [currentSessionRef.current])

    useEffect(() => {
        // if (!sessionId) return;
        if (searchParams.get("session_id")) {
            currentSessionRef.current = searchParams.get("session_id")
            const session = sessions.filter(s => s.id == searchParams.get("session_id"))[0]
            if (session) {
                setCurrentSession(session)
            }
        }
    }, [searchParams])

    return (
        <div className="h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 flex overflow-hidden">

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-800/60 backdrop-blur-xl border-r border-gray-700 flex flex-col overflow-auto`}>

                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">H</span>
                            </div>
                            <span className="text-lg font-bold bg-linear-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                                HealthScan AI
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleNewChat}
                        className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Chat Sessions List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Recent Chats</h3>
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => {
                                setSearchParams({ "session_id": session.id })
                                // setCurrentSession(session)
                            }}
                            className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${currentSession == session
                                ? 'bg-gray-700/70 border border-blue-500/50'
                                : 'bg-gray-700/30 hover:bg-gray-700/50 border border-transparent'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <MessageSquare size={16} className="text-blue-400 shrink-0" />
                                        <h4 className="text-sm font-semibold text-white truncate">
                                            {session.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">
                                        {/* {session.lastMessage || 'No messages yet'} */}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatTimestamp(session.timestamp)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">

                {/* Header */}
                <div className="bg-gray-800/60 backdrop-blur-xl border-b border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                            >
                                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {currentSession?.title || 'AI Assistant'}
                                </h2>
                                <p className="text-xs text-gray-400">Ask anything about your health reports</p>
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
                                <h3 className="text-2xl font-bold text-white">How can I help you today?</h3>
                                <p className="text-gray-400">Ask me anything about your health reports and I'll provide insights using AI.</p>
                                <div className="grid grid-cols-1 gap-3 mt-6">
                                    {[
                                        'What are my recent lab results?',
                                        'Explain my blood pressure readings',
                                        'Are there any concerning trends?'
                                    ].map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setInputMessage(suggestion)}
                                            className="text-left p-3 bg-gray-800/60 border border-gray-700 rounded-xl hover:border-blue-500/50 hover:bg-gray-700/50 transition-all text-sm text-gray-300"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages?.filter(m => m.content != "").map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                >
                                    <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${message.role === 'user'
                                            ? 'bg-linear-to-br from-blue-500 to-green-500'
                                            : 'bg-gray-700 border border-gray-600'
                                            }`}>
                                            {message.role === 'user' ? (
                                                <User className="text-white" size={20} />
                                            ) : (
                                                <Bot className="text-blue-400" size={20} />
                                            )}
                                        </div>

                                        {/* Message Content */}
                                        <div className={`rounded-2xl p-4 ${message.role === 'user'
                                            ? 'bg-linear-to-r from-blue-600 to-green-600 text-white'
                                            : 'bg-gray-800/60 border border-gray-700 text-gray-200'
                                            }`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
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
                                            <Loader2 className="animate-spin" size={20} color="white" />
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
                            AI responses are based on your uploaded health reports. Always consult healthcare professionals for medical advice.
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
    )
}

export default AIChatInterface