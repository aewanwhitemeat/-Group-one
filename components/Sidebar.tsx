import React from 'react';
import { LayoutDashboard, Sprout, Wheat, TrendingUp } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Farm Overview', icon: LayoutDashboard },
    { id: ViewState.LOAN_APPLICATION, label: 'Loan Application', icon: Sprout },
    { id: ViewState.MARKET_INTEL, label: 'Market Intel', icon: TrendingUp },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <Wheat className="text-emerald-500 w-8 h-8" />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AgriFlow</h1>
          <p className="text-xs text-slate-400">Credit & Daraja</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-400 mb-1">System Status</p>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Gemini AI Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Daraja API Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};