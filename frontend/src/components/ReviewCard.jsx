// ReviewCard — displays review with spoiler-blur feature
import { useAuth } from '../context/AuthContext';
import { deleteReview } from '../services/api';
import { useState } from 'react';

// Parse comment text and split into normal/spoiler segments
// Spoiler markers: ||hidden text||
const parseComment = (comment) => {
  const segments = [];
  const regex = /(\|\|[^|]+?\|\|)/g;
  const parts = comment.split(regex);

  parts.forEach(part => {
    if (part.startsWith('||') && part.endsWith('||')) {
      segments.push({ type: 'spoiler', text: part.slice(2, -2) });
    } else if (part) {
      segments.push({ type: 'normal', text: part });
    }
  });

  return segments;
};

function ReviewCard({ review, onDelete }) {
  const { user } = useAuth();
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  const handleDelete = async () => {
    try {
      await deleteReview(review._id);
      onDelete(review._id);
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  const toggleSpoiler = (idx) => {
    setRevealedSpoilers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const segments = parseComment(review.comment);

  return (
    <div className="p-5 rounded-2xl"
      style={{ backgroundColor: '#0F1623', border: '1px solid rgba(255,255,255,0.06)' }}>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #E879F9)' }}>
            {review.user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-semibold">{review.user?.username}</p>
              {review.hasSpoilers && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                  ⚠️ Has spoilers
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {[1,2,3,4,5].map(s => (
                <span key={s}
                  style={{ color: s <= review.rating ? '#E879F9' : '#374151', fontSize: '13px' }}>
                  ★
                </span>
              ))}
              <span className="text-gray-500 text-xs ml-1">
                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {(user?._id === review.user?._id || user?.role === 'admin') && (
          <button onClick={handleDelete}
            className="text-gray-600 hover:text-red-400 text-xs transition-colors px-2 py-1 rounded-lg">
            Delete
          </button>
        )}
      </div>

      {/* Comment with spoiler segments */}
      <p className="text-gray-300 text-sm leading-relaxed">
        {segments.map((seg, idx) => {
          if (seg.type === 'normal') {
            return <span key={idx}>{seg.text}</span>;
          }
          // Spoiler segment — blurred until clicked
          const revealed = revealedSpoilers[idx];
          return (
            <span key={idx}
              onClick={() => toggleSpoiler(idx)}
              className="inline cursor-pointer transition-all rounded px-1"
              style={{
                backgroundColor: revealed ? 'rgba(245,158,11,0.1)' : 'rgba(0,0,0,0.6)',
                color: revealed ? '#FCD34D' : 'transparent',
                textShadow: revealed ? 'none' : '0 0 8px rgba(255,255,255,0.6)',
                userSelect: revealed ? 'auto' : 'none',
              }}
              title={revealed ? 'Click to hide spoiler' : 'Click to reveal spoiler'}>
              {revealed ? seg.text : seg.text.replace(/./g, '█')}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export default ReviewCard;