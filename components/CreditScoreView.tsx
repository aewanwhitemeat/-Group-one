import React, { useState } from 'react';
import { FarmerProfile, LoanAssessmentResult, MpesaTransaction } from '../types';
import { assessFarmLoan } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Loader2, Sprout, AlertTriangle, CheckCircle, Phone, Send, Smartphone, DollarSign } from 'lucide-react';

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
  const [profile, setProfile] = useState<FarmerProfile>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoanAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Daraja / M-PESA Simulation State
  const [disbursing, setDisbursing] = useState(false);
  const [transaction, setTransaction] = useState<MpesaTransaction | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTransaction(null);
    try {
      const data = await assessFarmLoan(profile);
      setResult(data);
    } catch (err) {
      setError("Failed to analyze farm profile. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = () => {
    if (!result) return;
    setDisbursing(true);
    
    // Simulate Daraja API Latency
    setTimeout(() => {
      setTransaction({
        id: `LIPA-${Math.floor(Math.random() * 1000000)}`,
        status: 'COMPLETED',
        amount: result.approvedAmount,
        phoneNumber: profile.mpesaNumber,
        timestamp: new Date()
      });
      setDisbursing(false);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: (name === 'farmSize' || name === 'requestedAmount') ? Number(value) : value
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 700) return '#10b981'; // Emerald
    if (score >= 500) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Input Form */}
      <div className="lg:w-5/12 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl overflow-y-auto scrollbar-hide">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Sprout className="mr-2 text-emerald-400" />
          Farmer Profile
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Farmer Name</label>
            <input
              type="text"
              name="farmerName"
              value={profile.farmerName}
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">M-PESA Number</label>
             <div className="relative">
               <Phone className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
               <input
                type="text"
                name="mpesaNumber"
                value={profile.mpesaNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Farm Type</label>
              <select
                name="farmType"
                value={profile.farmType}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none"
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
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Size (Acres/Count)</label>
              <input
                type="number"
                name="farmSize"
                value={profile.farmSize}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Previous Yield History</label>
            <input
              type="text"
              name="previousYieldHistory"
              value={profile.previousYieldHistory}
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-400 mb-1">Loan Request (KES)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 font-bold">KES</span>
              <input
                type="number"
                name="requestedAmount"
                value={profile.requestedAmount}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg pl-12 pr-4 py-2 text-white text-lg font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Analyzing Yield Potential...
              </>
            ) : (
              "Assess Loan Application"
            )}
          </button>
          
          {error && (
            <div className="p-4 mt-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg text-sm flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      <div className="lg:w-7/12 flex flex-col gap-6">
        {!result ? (
          <div className="flex-1 bg-slate-800/50 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 p-10 border-dashed">
            <Sprout size={48} className="mb-4 opacity-20" />
            <p>Fill out the farmer's profile to determine loan eligibility and terms.</p>
          </div>
        ) : (
          <>
            {/* Decision Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Agri-Credit Score</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{result.creditScore}</span>
                    <span className="text-slate-500">/ 1000</span>
                  </div>
                  <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-bold ${result.approved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {result.approved ? 'LOAN APPROVED' : 'LOAN REJECTED'}
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Approved Amount</h3>
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
                  <span className="text-xs text-slate-500 block">Cycle Stage</span>
                  <span className="text-white font-semibold">{profile.cycleStage}</span>
                </div>
              </div>
            </div>

            {/* Risk & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                 <h4 className="text-white font-semibold mb-3 flex items-center">
                   <AlertTriangle className="w-4 h-4 mr-2 text-amber-500"/> Risk Analysis
                 </h4>
                 <ul className="space-y-2 text-sm">
                   <li className="flex justify-between text-slate-300">
                     <span>Weather:</span> <span className="text-amber-400">{result.riskAnalysis.weatherRisk}</span>
                   </li>
                   <li className="flex justify-between text-slate-300">
                     <span>Market:</span> <span className="text-amber-400">{result.riskAnalysis.marketRisk}</span>
                   </li>
                   <li className="flex justify-between text-slate-300">
                     <span>Pests:</span> <span className="text-amber-400">{result.riskAnalysis.pestDiseaseRisk}</span>
                   </li>
                 </ul>
                 <p className="mt-4 text-xs text-slate-400 leading-relaxed border-t border-slate-700 pt-3">
                   "{result.recommendation}"
                 </p>
               </div>

               {/* M-PESA Integration Section */}
               <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex flex-col relative">
                  {/* Background decoration for Daraja */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-600 blur-3xl opacity-20 rounded-full pointer-events-none"></div>

                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Smartphone className="w-4 h-4 mr-2 text-green-500"/> Safaricom Daraja Integration
                  </h4>
                  
                  {transaction && transaction.status === 'COMPLETED' ? (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                       <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                         <CheckCircle className="text-white w-6 h-6" />
                       </div>
                       <h5 className="text-green-400 font-bold">Disbursement Successful</h5>
                       <p className="text-slate-400 text-xs text-center mt-1">
                         KES {transaction.amount.toLocaleString()} sent to<br/>{transaction.phoneNumber}
                       </p>
                       <div className="mt-3 text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                         ID: {transaction.id}
                       </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="text-sm text-slate-300 mb-4">
                        Approve disbursement to farmer's M-PESA wallet. Repayment triggers automatically on {result.repaymentDate} via "Lipa Mdogo Mdogo".
                      </p>
                      
                      <button 
                        onClick={handleDisburse}
                        disabled={disbursing || !result.approved}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {disbursing ? (
                           <><Loader2 className="animate-spin w-4 h-4 mr-2"/> Processing Daraja...</>
                        ) : (
                           <><DollarSign className="w-4 h-4 mr-1"/> Disburse KES {result.approvedAmount.toLocaleString()}</>
                        )}
                      </button>
                      {!result.approved && (
                        <p className="text-xs text-red-400 mt-2 text-center">Loan not approved for disbursement.</p>
                      )}
                    </div>
                  )}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};