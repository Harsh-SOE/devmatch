"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { BASE_URL } from "../src/utils/constants"
import { useDispatch, useSelector } from "react-redux"
import { addFeed } from "../src/utils/feedSlice"
import UserCard from "./UserCard"
import { Loader2, Users, RefreshCw } from "lucide-react"

const Feed = () => {
  const feed = useSelector((store) => store.feed)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch feed data from the backend
  const getFeed = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(BASE_URL + "/feed", { withCredentials: true })
      dispatch(addFeed(res.data?.data || []))
    } catch (err) {
      console.error("Failed to fetch feed:", err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const res = await axios.get(BASE_URL + "/feed", { withCredentials: true })
      dispatch(addFeed(res.data?.data || []))
    } catch (err) {
      console.error("Failed to refresh feed:", err.message)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Fetch feed on component mount
  useEffect(() => {
    getFeed()
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Finding potential matches...</p>
      </div>
    )
  }

  // Handle empty feed
  if (!feed || feed.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-gray-400 dark:text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No more profiles</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          You've seen all available profiles for now. Check back later for new potential matches!
        </p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium transition-colors disabled:opacity-70"
        >
          {isRefreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          Refresh
        </button>
      </div>
    )
  }

  // Render the first profile in the feed
  return (
    <div className="py-8 px-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-500 dark:to-purple-500">
        Discover Developers
      </h1>
      <UserCard user={feed[0]} />
    </div>
  )
}

export default Feed
