import { useEffect, useRef } from "react"
import { createSocketConnection } from "./socket"

export const useChatSocket = ({
  user,
  targetUserId,
  onReceiveMessage,
  onUserStatusChange,
  onTyping,
  setTargetUserInfo,
}) => {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user?._id || !targetUserId) return

    const socket = createSocketConnection()
    socketRef.current = socket

    socket.emit("joinChat", {
      firstName: user.firstName,
      userId: user._id,
      targetUserId,
      photoUrl: user.photoUrl,
    })

    socket.emit("getUserStatus", targetUserId)

    socket.on("userOnlineStatus", onUserStatusChange)
    socket.on("receiveMessage", onReceiveMessage)
    socket.on("typing", onTyping)
    socket.on("userInfo", (data) => {
      if (data.userId === targetUserId) setTargetUserInfo(data)
    })

    return () => socket.disconnect()
  }, [user, targetUserId])

  return socketRef
}
