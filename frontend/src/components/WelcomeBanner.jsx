export default function WelcomeBanner() {
  return (
    <div className="bg-gradient-to-r from-yellow-300 to-green-400 py-5 px-6 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <p className="text-white font-bold text-xl drop-shadow-md">
          Welcome to PlayLearn! Let's have fun while learning!
        </p>
      </div>
    </div>
  );
}
