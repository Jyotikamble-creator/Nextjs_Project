"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import JournalCard from "@/components/journal/JournalCard"
import Loader from "@/components/common/Loader"
import { IJournal } from "@/server/models/Journal"

export default function JournalsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [journals, setJournals] = useState<IJournal[]>([])
  const [filteredJournals, setFilteredJournals] = useState<IJournal[]>([])
  const [journalsLoading, setJournalsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMood, setSelectedMood] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [moods, setMoods] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserJournals()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    filterJournals()
  }, [journals, searchTerm, selectedMood, selectedTag])

  const fetchUserJournals = async () => {
    try {
      const response = await fetch(`/api/journals?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setJournals(data)

        // Extract unique moods and tags
        const uniqueMoods = [...new Set(data.map((journal: IJournal) => journal.mood).filter(Boolean))] as string[]
        const uniqueTags = [...new Set(data.flatMap((journal: IJournal) => journal.tags || []))] as string[]

        setMoods(uniqueMoods)
        setTags(uniqueTags)
      }
    } catch (error) {
      console.error('Failed to fetch journals:', error)
    } finally {
      setJournalsLoading(false)
    }
  }

  const filterJournals = () => {
    let filtered = journals

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(journal =>
        journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by mood
    if (selectedMood) {
      filtered = filtered.filter(journal => journal.mood === selectedMood)
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(journal => journal.tags?.includes(selectedTag))
    }

    setFilteredJournals(filtered)
  }

  const handleDeleteJournal = async (journalId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return

    try {
      const response = await fetch(`/api/journals/${journalId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setJournals(journals.filter(journal => journal._id.toString() !== journalId))
      } else {
        alert('Failed to delete journal')
      }
    } catch (error) {
      console.error('Failed to delete journal:', error)
      alert('Failed to delete journal')
    }
  }

  if (loading) return <Loader fullscreen />

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to view your journals</p>
          <Link href="/auth/login" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Journals</h1>
              <p className="text-gray-300">Reflect on your thoughts and memories</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{filteredJournals.length}</p>
              <p className="text-gray-400 text-sm">Total Entries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search journals..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Mood Filter */}
            <div>
              <label htmlFor="mood" className="block text-sm font-medium text-gray-300 mb-2">
                Mood
              </label>
              <select
                id="mood"
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="" className="bg-slate-800">All Moods</option>
                {moods.map(mood => (
                  <option key={mood} value={mood} className="bg-slate-800">
                    {mood === 'happy' ? '😊 Happy' :
                     mood === 'excited' ? '🤩 Excited' :
                     mood === 'grateful' ? '🙏 Grateful' :
                     mood === 'peaceful' ? '😌 Peaceful' :
                     mood === 'thoughtful' ? '🤔 Thoughtful' :
                     mood === 'sad' ? '😢 Sad' :
                     mood === 'anxious' ? '😰 Anxious' :
                     mood === 'angry' ? '😠 Angry' :
                     mood === 'tired' ? '😴 Tired' :
                     mood === 'inspired' ? '✨ Inspired' : mood}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-300 mb-2">
                Tag
              </label>
              <select
                id="tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="" className="bg-slate-800">All Tags</option>
                {tags.map(tag => (
                  <option key={tag} value={tag} className="bg-slate-800">#{tag}</option>
                ))}
              </select>
            </div>

            {/* Create Journal Button */}
            <div className="flex items-end">
              <Link
                href="/create-journal"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Write Journal
              </Link>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedMood || selectedTag) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedMood("")
                  setSelectedTag("")
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Journals List */}
        {journalsLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader message="Loading your journals..." />
          </div>
        ) : filteredJournals.length > 0 ? (
          <div className="space-y-6">
            {filteredJournals.map((journal) => (
              <div key={journal._id.toString()} className="relative group">
                <JournalCard journal={journal} />
                {/* Action buttons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                  <button
                    onClick={() => handleDeleteJournal(journal._id.toString())}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                    title="Delete journal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 max-w-md">
              <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No journal entries yet</h3>
              <p className="text-gray-400 mb-8">
                {journals.length === 0
                  ? "Start writing your thoughts and memories. Your first journal entry awaits."
                  : "Try adjusting your search or filters to find what you're looking for."
                }
              </p>
              {journals.length === 0 && (
                <Link
                  href="/create-journal"
                  className="inline-flex items-center px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Write Your First Journal
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}