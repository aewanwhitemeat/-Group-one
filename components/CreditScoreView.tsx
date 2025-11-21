import React, { useState } from 'react';
import { FarmerProfile, LoanAssessmentResult, MpesaTransaction, LoanStage, TransactionType } from '../types';
import { assessFarmLoan } from '../services/geminiService';
import { DarajaAPI } from '../services/api';
import { Loader2, Sprout, AlertTriangle, CheckCircle, Phone, Smartphone, DollarSign, RefreshCw, Lock, ArrowRight, Wallet } from 'lucide-react';

const INITIAL_PROFILE: FarmerProfile = {
  farmerName: 'John Kamau',
  mpesaNumber: '254700000000',
  location: 'Kinangop, Nyandarua',
  farmType: 'Crops',
  specificProduce: 'Irish Potatoes',
  farmSize: 2.5,
  cycleStage: 'Planting',
  requestedAmount: 25000,
  previousYieldHistory: '120 bags in 2023'
};

export const CreditScoreView: React.FC = () => {
  const [stage, setStage] = useState<LoanStage>(LoanStage.APPLICATION);
  const [profile, setProfile] = useState<FarmerProfile>(INITIAL_PROFILE);
  const [result, setResult] = useState<LoanAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [loadingText, setLoadingText] = useState<string>("");

  // Handlers
  const handleAnalyze = async () => {
    setStage(LoanStage.ASSESSING);
    setLoadingText("Analyzing Satellite Data & Risk Profile...");
    setError(null);
    try {
      const data = await assessFarmLoan(profile);
      setResult(data);
      setStage(LoanStage.REVIEW);
    } catch (err) {
      setError("Failed to analyze farm profile.");
      setStage(LoanStage.APPLICATION);
    }
  };

  const handleDisburse = async () => {
    if (!result) return;
    setStage(LoanStage.DISBURSING);
    setLoadingText("Contacting Safaricom Daraja B2C API...");
    
    try {
      const tx = await DarajaAPI.initiateB2CDisbursement(profile.mpesaNumber, result.approvedAmount);
      setTransactions(prev => [tx, ...prev]);
      setStage(LoanStage.ACTIVE);
    } catch (err) {
      setError("Disbursement Failed. Please try again.");
      setStage(LoanStage.REVIEW);
    }
  };

  const handleRepayment = async () => {
    if (!result) return;
    setStage(LoanStage.REPAYING);
    setLoadingText("Sending STK Push to Farmer's Phone...");

    try {
      // Simulating full repayment for demo purposes
      const tx = await DarajaAPI.triggerSTKPush(profile.mpesaNumber, result.approvedAmount);
      setTransactions(prev => [tx, ...prev]);
      setStage(LoanStage.COMPLETED);
    } catch (err) {
      setError("Payment failed or cancelled by user.");
      setStage(LoanStage.ACTIVE);
    }
  };

  const handleReset = () => {
    setStage(LoanStage.APPLICATION);
    setResult(null);
    setTransactions([]);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: (name === 'farmSize' || name === 'requestedAmount') ? Number(value) : value
    }));
  };

  // Render Helpers
  const renderProgressBar = () => {
    const stages = [LoanStage.APPLICATION, LoanStage.REVIEW, LoanStage.ACTIVE, LoanStage.COMPLETED];
    const currentIndex = stages.indexOf(stage === LoanStage.ASSESSING ? LoanStage.APPLICATION : (stage === LoanStage.DISBURSING ? LoanStage.REVIEW : (stage === LoanStage.REPAYING ? LoanStage.ACTIVE : stage)));
    
    return (
      <div className="flex items-center justify-between mb-8 px-4">
        {stages.map((s, idx) => {
          const isActive = idx <= currentIndex;
          return (
            <div key={s} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {s === LoanStage.APPLICATION ? 'Apply' : s === LoanStage.REVIEW ? 'Review' : s === LoanStage.ACTIVE ? 'Grow & Harvest' : 'Repaid'}
              </span>
            </div>
          );
        })}
        <div className="absolute top-4 left-0 w-full h-1 bg-slate-800 -z-0 transform translate-y-[10px] hidden md:block"></div>
      </div>
    );
  };

  // --- VIEWS ---

  if (stage === LoanStage.ASSESSING || stage === LoanStage.DISBURSING || stage === LoanStage.REPAYING) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
        <h3 className="text-xl font-bold text-white mb-2">{loadingText}</h3>
        <p className="text-slate-400 text-sm">Securely communicating with {stage === LoanStage.ASSESSING ? 'Gemini AI' : 'Safaricom Daraja'}...</p>
      </div>
    );
  }

  if (stage === LoanStage.COMPLETED) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 text-center p-8">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Loan Cycle Complete!</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Farmer <strong>{profile.farmerName}</strong> has successfully repaid the loan via M-PESA. The credit score has been updated.
        </p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md mb-8">
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-slate-400">Total Repaid</span>
            <span className="text-white font-mono font-bold">KES {transactions.find(t => t.type === TransactionType.REPAYMENT)?.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Transaction ID</span>
            <span className="text-emerald-400 font-mono">{transactions.find(t => t.type === TransactionType.REPAYMENT)?.transactionId}</span>
          </div>
        </div>

        <button onClick={handleReset} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" /> Start New Application
        </button>
      </div>
    );
  }

  if (stage === LoanStage.ACTIVE) {
    return (
      <div className="max-w-4xl mx-auto">
        {renderProgressBar()}
        
        <div className="bg-slate-800 rounded-xl border border-emerald-500/30 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Active Loan: {profile.specificProduce}</h2>
              <p className="text-emerald-400 text-sm flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Disbursed to {profile.mpesaNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs uppercase tracking-widest">Outstanding Balance</p>
              <p className="text-4xl font-bold text-white mt-1">KES {result?.approvedAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Harvest Simulation */}
             <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center mb-4">
                  <Sprout className="text-emerald-400 w-6 h-6 mr-3" />
                  <h3 className="text-white font-semibold">Production Cycle</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  The farmer is currently in the <strong>{profile.cycleStage}</strong> stage. 
                  Expected yield value is KES {result?.projectedRevenue.toLocaleString()}.
                </p>
                <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-right text-xs text-emerald-400">65% to Harvest</p>
             </div>

             {/* Repayment Section */}
             <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center mb-4">
                  <Smartphone className="text-blue-400 w-6 h-6 mr-3" />
                  <h3 className="text-white font-semibold">Lipa Mdogo Mdogo</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  Initiate repayment via M-PESA STK Push. The farmer will receive a prompt on their phone to enter PIN.
                </p>
                <button 
                  onClick={handleRepayment}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all shadow-lg shadow-blue-900/20"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Trigger Repayment (KES {result?.approvedAmount.toLocaleString()})
                </button>
             </div>
          </div>
          
          {/* Transaction History Mini */}
          <div className="mt-8 pt-6 border-t border-slate-700">
             <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Transaction History</h4>
             <div className="space-y-2">
               {transactions.map((tx) => (
                 <div key={tx.transactionId} className="flex justify-between items-center text-sm bg-slate-900 p-3 rounded">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${tx.type === TransactionType.DISBURSEMENT ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                      <span className="text-slate-300">{tx.type}</span>
                    </div>
                    <span className="font-mono text-slate-400">{tx.transactionId}</span>
                    <span className="text-white font-medium">KES {tx.amount.toLocaleString()}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Default View: APPLICATION & REVIEW
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Input Form */}
      <div className="lg:w-5/12 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-bold text-white flex items-center">
            <Sprout className="mr-2 text-emerald-400" />
            Farmer Profile
          </h2>
          <span className="px-2 py-1 bg-slate-700 text-xs rounded text-slate-300 font-mono">STEP 1</span>
        </div>
        
        <div className="space-y-4 opacity-100 transition-opacity disabled:opacity-50">
          <fieldset disabled={stage !== LoanStage.APPLICATION}>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Farmer Name</label>
            <input
              type="text"
              name="farmerName"
              value={profile.farmerName}
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:text-slate-500"
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-400 mb-1">M-PESA Number</label>
             <div className="relative">
               <Phone className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
               <input
                type="text"
                name="mpesaNumber"
                value={profile.mpesaNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Farm Type</label>
              <select
                name="farmType"
                value={profile.farmType}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none disabled:text-slate-500"
              >
                <option value="Crops">Crops</option>
                <option value="Livestock">Livestock</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Produce</label>
              <input
                type="text"
                name="specificProduce"
                placeholder="e.g. Potatoes"
                value={profile.specificProduce}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Size (Acres/Heads)</label>
              <input
                type="number"
                name="farmSize"
                value={profile.farmSize}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-emerald-400 mb-1">Loan Request (KES)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 font-bold">KES</span>
              <input
                type="number"
                name="requestedAmount"
                value={profile.requestedAmount}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg pl-12 pr-4 py-2 text-white text-lg font-bold focus:ring-2 focus:ring-emerald-500 outline-none disabled:text-slate-500"
              />
            </div>
          </div>
          </fieldset>

          {stage === LoanStage.APPLICATION && (
            <button
              onClick={handleAnalyze}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center"
            >
              Assess Loan Application <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          )}
          
          {error && (
            <div className="p-4 mt-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg text-sm flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results & Action */}
      <div className="lg:w-7/12 flex flex-col gap-6">
        {!result ? (
          <div className="flex-1 bg-slate-800/50 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 p-10 border-dashed">
            <Lock size={48} className="mb-4 opacity-20" />
            <p>Complete the profile to unlock AI assessment.</p>
          </div>
        ) : (
          <>
            {/* Decision Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Agri-Credit Score</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{result.creditScore}</span>
                    <span className="text-slate-500">/ 1000</span>
                  </div>
                  <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-bold ${result.approved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {result.approved ? 'APPROVED FOR FINANCING' : 'HIGH RISK - REJECTED'}
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Approved Input Value</h3>
                  <span className="text-4xl font-bold text-white">KES {result.approvedAmount.toLocaleString()}</span>
                  <p className="text-emerald-400 text-sm mt-1">@ {result.interestRate}% Interest</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-lg">
                <div>
                  <span className="text-xs text-slate-500 block">Projected Revenue</span>
                  <span className="text-white font-semibold">KES {result.projectedRevenue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Repayment Date</span>
                  <span className="text-white font-semibold">{result.repaymentDate}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Risk Level</span>
                  <span className="text-amber-400 font-semibold">{result.riskAnalysis.marketRisk}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-slate-300 text-sm italic">"{result.recommendation}"</p>
              </div>
            </div>

            {/* Action Panel */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 blur-[60px] opacity-20 rounded-full pointer-events-none"></div>

                  <h4 className="text-white font-semibold mb-3 flex items-center z-10">
                    <Smartphone className="w-4 h-4 mr-2 text-green-500"/> Safaricom Daraja B2C Integration
                  </h4>
                  
                  <p className="text-sm text-slate-300 mb-6 z-10 max-w-lg">
                     Disburse funds directly to <strong>{profile.farmerName}</strong>'s M-PESA ({profile.mpesaNumber}). 
                     The system will automatically track harvest cycles for "Lipa Mdogo Mdogo" recovery.
                  </p>
                  
                  <div className="flex gap-4 z-10">
                    <button 
                      onClick={handleDisburse}
                      disabled={!result.approved}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20"
                    >
                      <DollarSign className="w-5 h-5 mr-2"/> Disburse Funds Now
                    </button>
                    <button 
                      onClick={handleReset}
                      className="px-4 py-3 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
               </div>
          </>
        )}
      </div>
    </div>
  );
};
