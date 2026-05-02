// VibeMatch page — dedicated mood-based discovery page
import VibeMatcher from '../components/VibeMatcher';

function VibeMatch() {
  return (
    <div style={{ backgroundColor: '#0B0F1A', minHeight: '100vh' }}>
      <div className="px-6 pt-10 pb-4 max-w-7xl mx-auto">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Discovery</p>
        <h1 className="text-3xl font-bold text-white">Find your vibe</h1>
        <p className="text-gray-500 text-sm mt-1">Pick a mood, get personalized recommendations</p>
      </div>
      <VibeMatcher />
    </div>
  );
}

export default VibeMatch;