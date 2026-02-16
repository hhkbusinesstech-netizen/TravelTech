
import React from 'react';
import ArchitectureDocument from './components/ArchitectureDocument';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="container max-w-4xl bg-white shadow-lg rounded-lg p-8 md:p-12 lg:p-16">
        <ArchitectureDocument />
      </div>
    </div>
  );
};

export default App;
