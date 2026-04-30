import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../api/users";

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data.users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-emerald-100 text-emerald-600",
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
      "bg-rose-100 text-rose-600",
      "bg-cyan-100 text-cyan-600",
      "bg-indigo-100 text-indigo-600",
      "bg-teal-100 text-teal-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="w-80 h-full flex flex-col bg-white border-r border-slate-200">
      {/* User Info Header */}
      <div className="p-4 border-bottom border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.username ? getInitials(user.username) : "?"}
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 leading-tight">
              {user?.username}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Online
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          title="Sign Out"
        >
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="px-2 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Active Chats
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md">
            {users.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2 px-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 animate-pulse"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100"></div>
                <div className="flex-1">
                  <div className="h-3 w-24 bg-slate-100 rounded-full mb-2"></div>
                  <div className="h-2 w-32 bg-slate-50 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="mt-12 text-center px-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No users found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => onSelectUser(u)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group ${selectedUser?.id === u.id
                  ? "bg-green-50 shadow-sm shadow-green-100/50"
                  : "hover:bg-slate-50"
                  }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-transform group-hover:scale-105 ${getAvatarColor(u.username)}`}
                >
                  {getInitials(u.username)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold truncate ${selectedUser?.id === u.id ? "text-green-700" : "text-slate-800"}`}
                    >
                      {u.username}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {u.email}
                  </span>
                </div>
                {selectedUser?.id === u.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
