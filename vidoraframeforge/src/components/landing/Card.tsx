import React from 'react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Welcome Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-light-text mb-4">
          Welcome to <span className="text-primary-blue">VidoraFrameForge</span>
        </h1>
        <p className="text-xl text-subtle-text mb-8">
          Discover fun and engaging games to challenge your mind and enjoy your time!
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-primary-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300">
            Explore Games
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300">
            Get Started
          </button>
        </div>
      </div>

      {/* Popular Games Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-light-text text-center mb-8">Popular Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-bg p-6 rounded-lg shadow-xl text-center hover:shadow-2xl transition duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-light-text mb-2">Word Guess</h3>
            <p className="text-subtle-text">Guess the hidden word in six tries.</p>
          </div>
          <div className="bg-card-bg p-6 rounded-lg shadow-xl text-center hover:shadow-2xl transition duration-300">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold text-light-text mb-2">Memory Match</h3>
            <p className="text-subtle-text">Test your memory by matching pairs.</p>
          </div>
          <div className="bg-card-bg p-6 rounded-lg shadow-xl text-center hover:shadow-2xl transition duration-300">
            <div className="text-4xl mb-4">➕</div>
            <h3 className="text-xl font-semibold text-light-text mb-2">Math Quiz</h3>
            <p className="text-subtle-text">Solve quick-fire math problems.</p>
          </div>
          <div className="bg-card-bg p-6 rounded-lg shadow-xl text-center hover:shadow-2xl transition duration-300">
            <div className="text-4xl mb-4">⌨️</div>
            <h3 className="text-xl font-semibold text-light-text mb-2">Typing Test</h3>
            <p className="text-subtle-text">Improve your typing speed and accuracy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

