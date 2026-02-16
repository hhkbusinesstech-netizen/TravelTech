
import React, { useState } from 'react';
import ArchitectureDocument from './components/ArchitectureDocument';
import AgentPortalDashboard from './components/AgentPortalDashboard';

type View = 'architecture' | 'agent-portal';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('architecture');

  const renderContent = () => {
    switch (activeView) {
      case 'architecture':
        return <ArchitectureDocument />;
      case 'agent-portal':
        return <AgentPortalDashboard />;
      default:
        return <ArchitectureDocument />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      {/* Navigation Bar */}
      <nav className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-4 mb-4 flex justify-center space-x-4">
        <button
          onClick={() => setActiveView('architecture')}
          className={`px-6 py-2 rounded-md text-lg font-medium transition-colors duration-200 ${
            activeView === 'architecture'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-current={activeView === 'architecture' ? 'page' : undefined}
        >
          Architecture Document
        </button>
        <button
          onClick={() => setActiveView('agent-portal')}
          className={`px-6 py-2 rounded-md text-lg font-medium transition-colors duration-200 ${
            activeView === 'agent-portal'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-current={activeView === 'agent-portal' ? 'page' : undefined}
        >
          Agent Portal
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="container max-w-4xl bg-white shadow-lg rounded-lg p-8 md:p-12 lg:p-16">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
