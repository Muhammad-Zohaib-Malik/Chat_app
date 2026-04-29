import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";

const ChatLayout = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  console.log("selectedUser", selectedUser);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <div className="flex h-full w-full max-w-[1600px] mx-auto bg-white shadow-2xl shadow-slate-200/50">
        <Sidebar selectedUser={selectedUser} onSelectUser={setSelectedUser} />
        <ChatArea selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default ChatLayout;
