"use client";

import { useState, useEffect } from 'react';

interface FeedbackEntry {
  id: string;
  rating: number;
  review_text: string;
  ai_user_response: string;
  ai_admin_summary: string;
  ai_admin_action: string;
  created_at: string;
}

export default function AdminPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'rating' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/feedback/list');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (e) {
      console.error('Network error fetching entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: 'rating' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'rating') {
      return (a.rating - b.rating) * multiplier;
    }
    return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * multiplier;
  });

  const totalReviews = entries.length;
  const avgRating = totalReviews > 0 
    ? (entries.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) 
    : '0.0';

  if (loading && entries.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <p className="text-yellow-400">Loading feedback...</p>
      </main>
    );
  }

  const SortIcon = ({ active, order }: { active: boolean; order: 'asc' | 'desc' }) => {
    if (!active) return <span className="text-gray-600 ml-1">⇅</span>;
    return <span className="text-yellow-400 ml-1">{order === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-yellow-400 pb-6">
            <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Live Feed (Auto-refreshing every 5s)</p>
            </div>
            
            <div className="flex gap-6 mt-4 md:mt-0">
            <div className="text-center">
                <p className="text-sm text-gray-400">Total Reviews</p>
                <p className="text-2xl font-bold text-yellow-400">{totalReviews}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-400">{avgRating}</p>
            </div>
            </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-yellow-400 text-yellow-400 text-sm uppercase tracking-wider">
                <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => handleSort('rating')}>
                  Rating <SortIcon active={sortField === 'rating'} order={sortOrder} />
                </th>
                <th className="p-4 w-1/4">Review</th>
                <th className="p-4 w-1/4">AI Summary</th>
                <th className="p-4 w-1/4">Recommended Action</th>
                <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => handleSort('created_at')}>
                  Date <SortIcon active={sortField === 'created_at'} order={sortOrder} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-900 transition-colors">
                  <td className="p-4">
                    <span className="text-yellow-400 font-bold">{entry.rating}</span>
                    <span className="text-gray-600">/5</span>
                  </td>
                  <td className="p-4 text-gray-300 text-sm">{entry.review_text}</td>
                  <td className="p-4 text-gray-300 text-sm italic">{entry.ai_admin_summary}</td>
                  <td className="p-4 text-white text-sm font-medium">{entry.ai_admin_action}</td>
                  <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {sortedEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No feedback entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
