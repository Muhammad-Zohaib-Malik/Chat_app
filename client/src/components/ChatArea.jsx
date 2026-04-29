import { useState, useRef, useEffect } from "react";

const ChatArea = ({ selectedUser }) => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [selectedUser]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center text-green-500 mb-6 border border-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Select a Chat
        </h2>
        <p className="mt-2 text-slate-500 max-w-xs mx-auto text-sm leading-relaxed font-medium">
          Choose a user from the left to start a real-time conversation.
        </p>
      </div>
    );
  }

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {/* Chat Header */}
      <div className="h-[72px] px-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm">
            {getInitials(selectedUser.username)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">
              {selectedUser.username}
            </h3>
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              {selectedUser.email}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
          <button className="p-2.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 flex flex-col">
        {/* Simple start message */}
        <div className="flex justify-center py-4">
          <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-full uppercase tracking-widest border border-slate-200 shadow-sm">
            This is the start of your conversation
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${
                msg.sender === "me"
                  ? "bg-green-500 text-white rounded-br-none"
                  : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 px-1 uppercase tracking-wider">
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto relative flex items-center gap-2 px-2 py-2 bg-slate-50 border border-slate-100 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all"
        >
          <button type="button" className="p-2 text-slate-400 hover:text-green-500 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none py-2 px-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
          />
          <button 
            type="submit"
            className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
