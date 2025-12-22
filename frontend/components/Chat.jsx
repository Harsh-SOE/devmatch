// import { useEffect, useState, useRef, useCallback } from "react"
// import { useParams } from "react-router-dom"
// import { createSocketConnection } from "../src/utils/socket"
// import { useSelector } from "react-redux"
// import axios from "axios"
// import { BASE_URL } from "../src/utils/constants"
// import { ArrowLeft, Send, Smile, Paperclip, MoreVertical } from "lucide-react"
// import { Link } from "react-router-dom"

// const Chat = () => {
//   const { targetUserId } = useParams()
//   const [messages, setMessages] = useState([])
//   const [newMessage, setNewMessage] = useState("")
//   const [targetUserInfo, setTargetUserInfo] = useState(null)
//   const [isTyping, setIsTyping] = useState(false)
//   const messagesEndRef = useRef(null)
//   const socketRef = useRef(null)
//   const typingTimeoutRef = useRef(null)
//   const user = useSelector((store) => store.user)
//   const userId = user?._id

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   const fetchChatMessage = useCallback(async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
//         withCredentials: true,
//       })

//       const chatData = response.data

//       const chatMessages = chatData.messages.map((msg) => ({
//         sender: msg.senderId._id === userId ? "self" : "other",
//         text: msg.text,
//         name: msg.senderId.firstName,
//         time: new Date(msg.createdAt).toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         photoUrl: msg.senderId.photoUrl,
//       }))

//       setMessages(chatMessages)

//       setTargetUserInfo(chatData.participants.find((p) => p._id !== userId))
//     } catch (error) {
//       console.error("Error fetching chat messages:", error)
//     }
//   }, [ targetUserId, userId])

//   const handleTypingIndicator = () => {
//     setIsTyping(true)
//     clearTimeout(typingTimeoutRef.current)
//     typingTimeoutRef.current = setTimeout(() => {
//       setIsTyping(false)
//     }, 3000)
//   }

//   useEffect(() => {
//     fetchChatMessage()
//   }, [fetchChatMessage])

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   useEffect(() => {
//     if (!userId || !targetUserId) return

//     const socket = createSocketConnection();
//     socketRef.current = socket;

//     socket.emit("joinChat", {
//       firstName: user.firstName,
//       userId,
//       targetUserId,
//       photoUrl: user.photoUrl,
//     })

//     socket.emit("getUserStatus", targetUserId)

//     socket.on("userOnlineStatus", ({ userId: changedUserId, status }) => {
//       if (changedUserId === targetUserId) {
//         setTargetUserInfo((prev) => ({
//           ...prev,
//           onlineStatus: status,
//         }))
//       }
//     })
//     // Listen for incoming messages
//     socket.on("receiveMessage", (data) => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           sender: data.userId === userId ? "self" : "other",
//           text: data.text,
//           name: data.firstName,
//           time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//           photoUrl: data.photoUrl,
//         },
//       ])
//       setIsTyping(false)
//     })

//     // Handle receiving user info
//     socket.on("userInfo", (data) => {
//       if (data.userId === targetUserId) {
//         setTargetUserInfo(data)
//       }
//     })

//     // Simulate typing indicator
//     socket.on("typing", handleTypingIndicator)

//     return () => {
//       socket.disconnect()
//     }
//   }, [userId, targetUserId, user])

//   const sendMessage = useCallback(() => {
//     if (!newMessage.trim()) return

//     socketRef.current?.emit("sendMessage", {
//       firstName: user.firstName,
//       userId,
//       targetUserId,
//       text: newMessage,
//       photoUrl: user.photoUrl,
//     })

//     setNewMessage("")
//   }, [newMessage, user, userId, targetUserId])

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   const getAvatarUrl = (message) => {
//     if (message.sender === "self") {
//       return user.photoUrl || "/api/placeholder/40/40" // Fallback to placeholder if no photo
//     } else if (message.photoUrl) {
//       return message.photoUrl
//     } else if (targetUserInfo?.photoUrl) {
//       return targetUserInfo.photoUrl
//     } else {
//       return "/api/placeholder/40/40" // Default placeholder
//     }
//   }

// const Chat = () => {
//   const { targetUserId } = useParams()
//   const user = useSelector((store) => store.user)
//   const userId = user?._id

//   const [messages, setMessages] = useState([])
//   const [targetUserInfo, setTargetUserInfo] = useState(null)
//   const [newMessage, setNewMessage] = useState("")
//   const [isTyping, setIsTyping] = useState(false)

//   const socketRef = useChatSocket({
//     user,
//     targetUserId,
//     setTargetUserInfo,
//     onReceiveMessage: (data) => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           sender: data.userId === userId ? "self" : "other",
//           text: data.text,
//           name: data.firstName,
//           time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//           photoUrl: data.photoUrl,
//         },
//       ])
//       setIsTyping(false)
//     },
//     onUserStatusChange: ({ userId: changedUserId, status }) => {
//       if (changedUserId === targetUserId) {
//         setTargetUserInfo((prev) => ({ ...prev, onlineStatus: status }))
//       }
//     },
//     onTyping: () => {
//       setIsTyping(true)
//       setTimeout(() => setIsTyping(false), 3000)
//     },
//   })

//   const fetchMessages = useFetchMessages(targetUserId, userId, setMessages, setTargetUserInfo)

//   useEffect(() => {
//     fetchMessages()
//   }, [fetchMessages])

//   const sendMessage = () => {
//     if (!newMessage.trim()) return
//     socketRef.current?.emit("sendMessage", {
//       firstName: user.firstName,
//       userId,
//       targetUserId,
//       text: newMessage,
//       photoUrl: user.photoUrl,
//     })
//     setNewMessage("")
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 flex flex-col pb-14">
//       {/* Header */}
//       <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex items-center">
//         <Link to="/connections" className="mr-4">
//           <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
//         </Link>

//         {targetUserInfo && (
//           <div className="flex items-center flex-1">
//             <div className="relative">
//               <img
//                 src={targetUserInfo.photoUrl || "/placeholder.svg"}
//                 alt={targetUserInfo.firstName}
//                 className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
//               />
//               <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
//             </div>

//             <div className="ml-3">
//               <h2 className="font-semibold text-gray-800 dark:text-white">{targetUserInfo.firstName}</h2>
//               <p className="text-xs text-gray-500 dark:text-gray-400">{isTyping ? "typing..." : "Online"}</p>
//             </div>
//           </div>
//         )}

//         <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
//           <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
//         </button>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-center p-6">
//             <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
//               <Smile className="w-10 h-10 text-pink-500" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">No messages yet</h3>
//             <p className="text-gray-500 dark:text-gray-400 mt-1">Send a message to start the conversation!</p>
//           </div>
//         ) : (
//           messages.map((message, index) => (
//             <div key={index} className={`flex ${message.sender === "self" ? "justify-end" : "justify-start"}`}>
//               <div
//                 className={`flex items-end gap-2 max-w-[80%] ${message.sender === "self" ? "flex-row-reverse" : ""}`}
//               >
//                 {message.sender !== "self" && (
//                   <img
//                     src={getAvatarUrl(message) || "/placeholder.svg"}
//                     alt={message.name}
//                     className="w-8 h-8 rounded-full object-cover flex-shrink-0"
//                   />
//                 )}

//                 <div
//                   className={`
//                   rounded-2xl px-4 py-2 shadow-sm
//                   ${
//                     message.sender === "self"
//                       ? "bg-pink-500 text-white rounded-tr-none"
//                       : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
//                   }
//                 `}
//                 >
//                   <p className="whitespace-pre-wrap break-words">{message.text}</p>
//                   <div className={`text-xs mt-1 ${message.sender === "self" ? "text-pink-100" : "text-gray-500"}`}>
//                     {message.time}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}

//         {isTyping && (
//           <div className="flex justify-start">
//             <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm">
//               <div className="flex space-x-1">
//                 <div
//                   className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
//                   style={{ animationDelay: "0ms" }}
//                 ></div>
//                 <div
//                   className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
//                   style={{ animationDelay: "150ms" }}
//                 ></div>
//                 <div
//                   className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
//                   style={{ animationDelay: "300ms" }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sticky bottom-14">
//         <div className="flex items-end gap-2 max-w-4xl mx-auto">
//           <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
//             <Paperclip className="w-5 h-5" />
//           </button>

//           <div className="flex-1 relative">
//             <textarea
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Type a message..."
//               className="w-full border border-gray-300 dark:border-gray-600 rounded-full py-3 pl-4 pr-12 resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
//               style={{ minHeight: "44px" }}
//               rows={1}
//             />
//             <button className="absolute right-3 bottom-2 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
//               <Smile className="w-5 h-5" />
//             </button>
//           </div>

//           <button
//             onClick={sendMessage}
//             disabled={!newMessage.trim()}
//             className={`p-3 rounded-full ${
//               newMessage.trim()
//                 ? "bg-pink-500 text-white hover:bg-pink-600"
//                 : "bg-gray-200 text-gray-500 dark:bg-gray-700"
//             } transition-colors`}
//           >
//             <Send className="w-5 h-5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Chat

import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, MoreVertical, Paperclip, Send, Smile } from "lucide-react";
import { useChatSocket } from "../src/utils/userChatSocket";
import { useFetchMessages } from "../src/utils/useFetchMessages";

// Use a static placeholder that won't trigger additional requests
const PLACEHOLDER_AVATAR = "/placeholder.svg";

const Chat = () => {
  const { targetUserId } = useParams();
  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [targetUserInfo, setTargetUserInfo] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);

  const socketRef = useChatSocket({
    user,
    targetUserId,
    setTargetUserInfo,
    onReceiveMessage: (data) => {
      console.log("Received message:", data);
      setMessages((prev) => [
        ...prev,
        {
          sender: data.userId === userId ? "self" : "other",
          text: data.text,
          name: data.firstName,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          photoUrl: data.photoUrl || PLACEHOLDER_AVATAR,
        },
      ]);
      setIsTyping(false);
    },
    onUserStatusChange: ({ userId: changedUserId, status }) => {
      if (changedUserId === targetUserId) {
        setTargetUserInfo((prev) =>
          prev ? { ...prev, onlineStatus: status } : prev
        );
      }
    },
    onTyping: () => {
      setIsTyping(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => setIsTyping(false), 3000);
      setTypingTimeout(timeout);
    },
  });

  const fetchMessages = useFetchMessages(
    targetUserId,
    userId,
    setMessages,
    setTargetUserInfo
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socketRef.current?.emit("sendMessage", {
      firstName: user.firstName,
      userId,
      targetUserId,
      text: newMessage,
      photoUrl: user.photoUrl || PLACEHOLDER_AVATAR,
    });
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socketRef.current?.emit("typing", {
      userId,
      targetUserId,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 flex flex-col pb-14">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex items-center">
        <Link to="/connections" className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </Link>

        {targetUserInfo && (
          <div className="flex items-center flex-1">
            <div className="relative">
              <img
                src={targetUserInfo.photoUrl || PLACEHOLDER_AVATAR}
                alt={targetUserInfo.firstName || "User"}
                className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
                onError={(e) => {
                  console.log("Avatar load error, using placeholder");
                  e.target.onerror = null; // Prevent infinite error loop
                  e.target.src = PLACEHOLDER_AVATAR;
                }}
              />
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  targetUserInfo.onlineStatus === "online"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>

            <div className="ml-3">
              <h2 className="font-semibold text-gray-800 dark:text-white">
                {targetUserInfo.firstName}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isTyping
                  ? "typing..."
                  : targetUserInfo.onlineStatus === "online"
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </div>
        )}

        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
              <Smile className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Send a message to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "self" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-2 max-w-[80%] ${
                  message.sender === "self" ? "flex-row-reverse" : ""
                }`}
              >
                {message.sender !== "self" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={message.photoUrl || PLACEHOLDER_AVATAR}
                      alt={message.name || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log(
                          "Message avatar load error, using placeholder"
                        );
                        e.target.onerror = null; // Prevent infinite error loop
                        e.target.src = PLACEHOLDER_AVATAR;
                      }}
                    />
                  </div>
                )}

                <div
                  className={`
                  rounded-2xl px-4 py-2 shadow-sm
                  ${
                    message.sender === "self"
                      ? "bg-pink-500 text-white rounded-tr-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                  }
                `}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "self"
                        ? "text-pink-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.time}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sticky bottom-14">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-full py-3 pl-4 pr-12 resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
              style={{ minHeight: "44px" }}
              rows={1}
            />
            <button className="absolute right-3 bottom-2 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full ${
              newMessage.trim()
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700"
            } transition-colors`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
