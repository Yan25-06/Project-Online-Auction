import React from 'react';

const TabButton = ({ id, label, icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
      activeTab === id 
      ? 'bg-blue-100 text-blue-700 font-medium' 
      : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default TabButton;
