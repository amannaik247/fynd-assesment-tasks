"use client";

import { useState, useEffect } from 'react';

export default function UserPage() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedRating = localStorage.getItem('fynd_feedback_rating');
    const savedReview = localStorage.getItem('fynd_feedback_review');
    const savedResponse = localStorage.getItem('fynd_feedback_response');
    
    if (savedRating) setRating(parseInt(savedRating, 10));
    if (savedReview) setReview(savedReview);
    if (savedResponse) setAiResponse(savedResponse);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('fynd_feedback_rating', rating.toString());
    localStorage.setItem('fynd_feedback_review', review);
    localStorage.setItem('fynd_feedback_response', aiResponse);
  }, [rating, review, aiResponse, hasLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) { 
      setError('Please select a rating');
      return;
    }
    setSubmitting(true);
    setError('');
  
    setAiResponse('');
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review_text: review.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.data.ai_response);
        setRating(0);
        setReview('');
      }
      else setError(data.error || 'Submission failed');
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <form className="w-full max-w-md space-y-6 p-8" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-center">Give Feedback</h1>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review... (Optional)"
          className="w-full rounded-sm border border-yellow-400 bg-black p-2 text-white focus:outline-none focus:border-yellow-400"
          rows={4}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-yellow-400 py-2 text-black disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {aiResponse && (
          <div className="mt-4 border border-yellow-400 p-4">
            <p>{aiResponse}</p>
          </div>
        )}
      </form>
    </main>
  );
}
