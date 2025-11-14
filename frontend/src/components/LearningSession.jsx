import { useState } from "react";
import PlayerOverlay from "./PlayerOverlay";
import RewardsOverlay from "./RewardsOverlay";

export default function LearningSession({ topics }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stars, setStars] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const currentTopic = topics[currentIndex];

  const handleFinishTopic = () => {
    setProgress(progress + 1);
    setStars(stars + 1); // or calculate based on performance
    setShowPlayer(false);
    setShowRewards(true);
  };

  const handleNext = () => {
    setShowRewards(false);
    if (currentIndex + 1 < topics.length) {
      setCurrentIndex(currentIndex + 1);
      setShowPlayer(true);
    } else {
      alert("All topics completed!");
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowPlayer(true)}
        className="px-6 py-3 rounded-xl bg-green-500 text-white"
      >
        Start Lesson
      </button>

      {showPlayer && currentTopic && (
        <PlayerOverlay
          topic={currentTopic}
          onClose={handleFinishTopic} // treat closing as finishing
        />
      )}

      {showRewards && <RewardsOverlay onClose={handleNext} />}

      <div className="mt-6">
        <p>
          Progress: {progress}/{topics.length}
        </p>
        <p>Stars: {stars}</p>
      </div>
    </div>
  );
}
