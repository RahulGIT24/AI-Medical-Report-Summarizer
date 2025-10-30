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
// import { apiCall } from "../lib/apiCall"
import { toast } from "react-toastify"

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messages: Message[];
}

const AIChatInterface = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([

    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentSession = sessions.find(s => s.id === currentSessionId);

    useEffect(() => {
        if (sessions.length > 0 && !currentSessionId) {
            setCurrentSessionId(sessions[0].id);
        }
    }, [sessions, currentSessionId]);

    useEffect(() => {
        scrollToBottom();
    }, [currentSession?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleNewChat = () => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            lastMessage: '',
            timestamp: new Date(),
            messages: []
        };
        setSessions([newSession, ...sessions]);
        setCurrentSessionId(newSession.id);
        return newSession.id
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !currentSessionId) return;

        // if(!currentSession) {
        //     currentSessionId = handleNewChat()
        // }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        // Add user's message immediately
        setSessions(prev =>
            prev.map(session =>
                session.id === currentSessionId
                    ? {
                        ...session,
                        messages: [...session.messages, userMessage],
                        lastMessage: inputMessage,
                        title: session.messages.length === 0
                            ? inputMessage.slice(0, 30) + '...'
                            : session.title
                    }
                    : session
            )
        );

        setInputMessage('');
        setIsLoading(true);

        try {
            // Create an empty assistant message that will fill up as tokens arrive
            const assistantId = (Date.now() + 1).toString();
            let partialResponse = '';

            setSessions(prev =>
                prev.map(session =>
                    session.id === currentSessionId
                        ? {
                            ...session,
                            messages: [
                                ...session.messages,
                                {
                                    id: assistantId,
                                    role: 'assistant',
                                    content: '',
                                    timestamp: new Date()
                                }
                            ]
                        }
                        : session
                )
            );

            // Use EventSource for Server-Sent Events streaming
            const evtSource = new EventSource(
                `${import.meta.env.VITE_BASE_URL}/report/search?query=${encodeURIComponent(inputMessage)}`
            );

            evtSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    partialResponse += data.token || '';

                    // Update the assistant message in real-time
                    setSessions(prev =>
                        prev.map(session =>
                            session.id === currentSessionId
                                ? {
                                    ...session,
                                    messages: session.messages.map(msg =>
                                        msg.id === assistantId
                                            ? { ...msg, content: partialResponse }
                                            : msg
                                    )
                                }
                                : session
                        )
                    );
                } catch (err) {
                    console.error('Stream parse error:', err);
                }
            };

            evtSource.onerror = (err) => {
                console.error('Stream error:', err);
                evtSource.close();
                setIsLoading(false);
            };

            // Optional: auto-close when backend stops sending
            evtSource.addEventListener('end', () => {
                evtSource.close();
                setIsLoading(false);
            });

        } catch (error) {
            toast.error('Failed to stream response');
            console.error(error);
            setIsLoading(false);
        }
    };


    const handleDeleteSession = (sessionId: string) => {
        setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
            setCurrentSessionId(sessions[0]?.id || null);
        }
        toast.success('Chat session deleted');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 flex overflow-hidden">

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-800/60 backdrop-blur-xl border-r border-gray-700 flex flex-col overflow-hidden`}>

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
                            onClick={() => setCurrentSessionId(session.id)}
                            className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${currentSessionId === session.id
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
                                        {session.lastMessage || 'No messages yet'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {session.timestamp.toLocaleDateString()}
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
                    {!currentSession?.messages.length ? (
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
                            {currentSession.messages.map((message) => (
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
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                                            <Loader2 className="animate-spin text-blue-400" size={20} />
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
                                    <Loader2 className="animate-spin" size={24} />
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