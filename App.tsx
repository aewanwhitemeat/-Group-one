import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CreditScoreView } from './components/CreditScoreView';
import { GroundingView } from './components/GroundingView';
import { ViewState } from './types';
import { Activity, ArrowUpRight, Shield, Sprout, Smartphone, Users } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case ViewState.LOAN_APPLICATION:
        return <CreditScoreView />;
      case ViewState.MARKET_INTEL:
        return <GroundingView />;
      case ViewState.DASHBOARD:
      default:
        return <DashboardSummary onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto h-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const DashboardSummary: React.FC<{onViewChange: (view: ViewState) => void}> = ({ onViewChange }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-bold text-white">AgriFlow Dashboard</h2>
          <p className="text-slate-400 mt-1">Real-time farm credit & harvest monitoring</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Integration Status</p>
          <div className="flex items-center justify-end space-x-2 text-emerald-400 font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span>Safaricom Daraja Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Smartphone} 
          label="Active Loans (Lipa Mdogo)" 
          value="KES 4.2M" 
          trend="+12%" 
          trendUp={true} 
        />
        <StatCard 
          icon={Users} 
          label="Farmers Onboarded" 
          value="842" 
          trend="+24" 
          trendUp={true} 
        />
        <StatCard 
          icon={Sprout} 
          label="Projected Yield Value" 
          value="KES 12.8M" 
          trend="+5%" 
          trendUp={true} 
        />
        <StatCard 
          icon={Activity} 
          label="Repayment Rate" 
          value="94.2%" 
          trend="+1.2%" 
          trendUp={true} 
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div 
          onClick={() => onViewChange(ViewState.LOAN_APPLICATION)}
          className="group bg-slate-900 rounded-xl p-8 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sprout size={120} />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Loan Application & Scoring</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            Assess farmer profiles for input financing. Predict yields for Irish Potatoes, Chicken, etc., and disburse funds via M-PESA.
          </p>
          <span className="text-emerald-500 font-medium flex items-center">
            Start Assessment <ArrowUpRight className="ml-2 w-4 h-4" />
          </span>
        </div>

        <div 
          onClick={() => onViewChange(ViewState.MARKET_INTEL)}
          className="group bg-slate-900 rounded-xl p-8 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield size={120} />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Market Intelligence</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            Verify current market prices and weather conditions to ensure loan viability. Detect market anomalies using Google Search.
          </p>
          <span className="text-blue-500 font-medium flex items-center">
            Verify Market Data <ArrowUpRight className="ml-2 w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Recent Activity Mockup */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent M-PESA Transactions</h3>
        <div className="space-y-4">
          <TransactionRow id="LIPA-8823X" name="J. Kamau (Potatoes)" amount="KES 15,000" status="Completed" time="5 mins ago" />
          <TransactionRow id="LIPA-9921Y" name="S. Ochieng (Poultry)" amount="KES 8,500" status="Pending" time="12 mins ago" />
          <TransactionRow id="LIPA-7712Z" name="M. Wanjiku (Maize)" amount="KES 22,000" status="Completed" time="1 hour ago" />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{icon: any, label: string, value: string, trend: string, trendUp: boolean}> = ({ icon: Icon, label, value, trend, trendUp }) => (
  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
        <Icon size={20} />
      </div>
      <div className={`text-xs font-medium px-2 py-1 rounded ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
        {trend}
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-slate-500 text-sm">{label}</div>
  </div>
);

const TransactionRow: React.FC<{id: string, name: string, amount: string, status: string, time: string}> = ({ id, name, amount, status, time }) => (
  <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
    <div className="flex items-center space-x-4">
      <div className={`w-2 h-2 rounded-full ${status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
      <div>
        <p className="text-slate-300 font-medium text-sm">{name}</p>
        <p className="text-slate-500 text-xs font-mono">{id}</p>
      </div>
    </div>
    <div className="text-right">
       <p className="text-white font-medium text-sm">{amount}</p>
       <p className="text-slate-600 text-xs">{time}</p>
    </div>
  </div>
);

export default App;