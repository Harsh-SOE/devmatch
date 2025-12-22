"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { BASE_URL } from "../src/utils/constants"
import { useDispatch } from "react-redux"
import { addRequests, removeRequest } from "../src/utils/requestSlice"
import { useSelector } from "react-redux"
import { Check, X, UserPlus, Loader2 } from "lucide-react"

const Requests = () => {
  const requests = useSelector((store) => store.requests)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState(null)

  const reviewRequests = async (status, _id) => {
    try {
      setActionInProgress(_id)
      await axios.post(BASE_URL + "/request/review/" + status + "/" + _id, [], { withCredentials: true })
      dispatch(removeRequest(_id))
    } catch (err) {
      console.log(err.message)
    } finally {
      setActionInProgress(null)
    }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await axios.get(BASE_URL + "/user/requests", { withCredentials: true })
      dispatch(addRequests(res.data.data))
    } catch (err) {
      console.log(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading requests...</p>
      </div>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <UserPlus className="w-10 h-10 text-gray-400 dark:text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No connection requests</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          When someone shows interest in connecting with you, their request will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Connection Requests</h1>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {requests.map((request) => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } = request.fromUserId
          const isProcessing = actionInProgress === request._id

          return (
            <div
              key={_id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <img
                    alt={`${firstName} ${lastName}`}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-4 border-pink-100 dark:border-pink-900/30"
                    src={photoUrl || "/placeholder.svg"}
                  />
                </div>

                {/* User Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {firstName} {lastName}
                    </h2>
                    {age && gender && (
                      <span className="px-3 py-1 rounded-full text-sm bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300">
                        {age}, {gender}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{about || "No bio provided"}</p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-auto">
                    <button
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      onClick={() => reviewRequests("rejected", request._id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      Decline
                    </button>

                    <button
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium transition-colors disabled:opacity-50"
                      onClick={() => reviewRequests("accepted", request._id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Requests
