import { MessageSquare, Trash2 } from 'lucide-react';
import React from 'react'


// interface

const ChatSideBar = ({

}) => {



  return (
    <div>
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
    </div>
  )
}

export default ChatSideBar