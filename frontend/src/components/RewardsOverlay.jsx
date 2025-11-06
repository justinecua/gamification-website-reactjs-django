export default function RewardsOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-yellow-100 via-green-50 to-white rounded-3xl border-4 border-yellow-300 p-8 text-center shadow-2xl">
        {/* Animated celebration */}
        <div className="flex justify-center gap-2 mb-4 text-4xl">
          <span className="animate-bounce">🎉</span>
          <span className="animate-bounce delay-75">🌟</span>
          <span className="animate-bounce delay-150">🎊</span>
        </div>

        <div className="text-6xl mb-4 animate-pulse">🏆</div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">Amazing Job!</h3>

        <div className="flex justify-center gap-1 mb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="text-3xl animate-spin"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              ⭐
            </div>
          ))}
        </div>

        <p className="text-gray-700 text-lg mb-6 font-medium">
          You did it! Our animal friends are so proud of you!
        </p>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-yellow-400 to-green-500 text-white py-4 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-yellow-400/40 transition-all duration-300 transform hover:scale-105"
        >
          Continue the Fun!
        </button>

        {/* Floating animals */}
        <div className="absolute -top-4 -left-4 text-3xl animate-bounce">
          🐰
        </div>
        <div className="absolute -top-4 -right-4 text-3xl animate-bounce delay-150">
          🐻
        </div>
        <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce delay-300">
          🦉
        </div>
        <div className="absolute -bottom-4 -right-4 text-3xl animate-bounce delay-500">
          🐘
        </div>
      </div>
    </div>
  );
}
