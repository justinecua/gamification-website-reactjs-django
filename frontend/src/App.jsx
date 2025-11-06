import { useMemo, useState } from "react";
import { TOPICS, SECTIONS } from "./mockData";
import Header from "./components/Header";
import WelcomeBanner from "./components/WelcomeBanner";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import TopicGridSection from "./components/TopicGridSection";
import Footer from "./components/Footer";
import AdminMock from "./components/AdminMock";
import PlayerOverlay from "./components/PlayerOverlay";
import RewardsOverlay from "./components/RewardsOverlay";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("learn");

  const stars = useMemo(() => Math.min(progress, 5), [progress]);

  const handleOpen = (topic) => setSelected(topic);
  const handleClose = () => setSelected(null);
  const handleFinished = () => {
    setSelected(null);
    setShowReward(true);
    setProgress((p) => Math.min(p + 1, TOPICS.length));
  };

  const animatedCharacters = [
    { emoji: "🐰", name: "Bunny", color: "from-pink-400 to-pink-300" },
    { emoji: "🐻", name: "Bear", color: "from-amber-500 to-amber-400" },
    { emoji: "🦉", name: "Owl", color: "from-purple-400 to-purple-300" },
    { emoji: "🐘", name: "Ellie", color: "from-blue-400 to-blue-300" },
    { emoji: "🦋", name: "Butterfly", color: "from-indigo-400 to-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-green-100 to-white">
      <Header
        progress={progress}
        stars={stars}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <WelcomeBanner />

      {activeTab === "learn" ? (
        <>
          <HeroSection
            animatedCharacters={animatedCharacters}
            heroImage={SECTIONS.hero.image}
          />
          <FeaturesSection />
          <TopicGridSection progress={progress} handleOpen={handleOpen} />
        </>
      ) : (
        <div className="py-20">
          <AdminMock />
        </div>
      )}

      <Footer animatedCharacters={animatedCharacters} />

      {selected && (
        <PlayerOverlay
          topic={selected}
          onClose={handleClose}
          onFinished={handleFinished}
        />
      )}

      {showReward && <RewardsOverlay onClose={() => setShowReward(false)} />}
    </div>
  );
}
