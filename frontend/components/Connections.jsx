"use client"

import { useEffect, useState } from "react"
import { BASE_URL } from "../src/utils/constants"
import axios from "axios"
import { useDispatch } from "react-redux"
import { addConnections } from "../src/utils/connectionSlice"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { MessageCircle, Heart, X, Loader2 } from "lucide-react"

const Connections = () => {
  const connections = useSelector((store) => store.connections)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const res = await axios.get(BASE_URL + "/user/connections", { withCredentials: true })
      dispatch(addConnections(res.data.data))
    } catch (err) {
      console.log(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Finding your matches...</p>
      </div>
    )
  }

  if (connections?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 p-4">
        <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-pink-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Matches Yet</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-md">
          Keep swiping to find your perfect match! Your connections will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 py-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Matches</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-pink-500">{connections?.length || 0}</span>
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          </div>
        </header>

        <div className="space-y-4">
          {connections?.map((connection) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about, onlineStatus } = connection

            return (
              <div
                key={_id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="relative">
                  <img
                    alt={`${firstName} ${lastName}`}
                    className="w-full h-48 object-cover"
                    src={photoUrl || "/placeholder.svg?height=200&width=400"}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg?height=200&width=400"
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <div
                      className={`w-3 h-3 rounded-full ${onlineStatus === "online" ? "bg-green-500" : "bg-gray-400"}`}
                    ></div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {firstName} {lastName}
                    </h2>
                    {age && gender && (
                      <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-medium rounded-full">
                        {age} • {gender.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {about && <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">{about}</p>}

                  <div className="flex justify-between items-center">
                    <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>

                    <Link
                      to={`/chat/${_id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-full hover:from-pink-600 hover:to-purple-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Connections
