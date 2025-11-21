import React, { useState } from 'react';
import { verifyMarketData } from '../services/geminiService';
import { GroundingResult } from '../types';
import { TrendingUp, Search, ExternalLink, AlertTriangle, CheckCircle, HelpCircle, Loader2, Wheat } from 'lucide-react';

export const GroundingView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await verifyMarketData(query);
      setResult(data);
    } catch (err) {
      setError("Failed to verify market data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Verified': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      case 'Contradicted': return 'text-red-400 border-red-500/50 bg-red-500/10';
      default: return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Verified': return <CheckCircle className="w-12 h-12 text-emerald-400" />;
      case 'Contradicted': return <AlertTriangle className="w-12 h-12 text-red-400" />;
      default: return <HelpCircle className="w-12 h-12 text-amber-400" />;
    }
  };

  const suggestions = [
    "Current price of 90kg bag of Irish Potatoes in Nairobi",
    "Wholesale price of Kienyeji Chicken in Kiambu",
    "Fertilizer subsidy availability in Nyandarua",
    "Predicted rainfall for Rift Valley in November"
  ];

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
          <TrendingUp className="mr-3 text-emerald-400" />
          Market Intelligence & Verification
        </h2>
        <p className="text-slate-400">
          Verify current produce prices, weather forecasts, and agricultural news using Google Search Grounding.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-1 shadow-xl mb-6">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about market prices, weather, or subsidies..."
            className="w-full h-28 bg-slate-900 rounded-lg p-4 text-lg text-white placeholder-slate-500 focus:outline-none resize-none border-none"
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <button
              onClick={handleVerify}
              disabled={loading || !query.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Search className="w-4 h-4 mr-2" /> Verify Data</>}
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {!result && !loading && (
        <div className="mb-8">
          <p className="text-slate-500 text-sm mb-2 ml-1">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
               <button 
                key={i} 
                onClick={() => setQuery(s)}
                className="text-left p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
               >
                 {s}
               </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Status Header */}
          <div className={`p-6 rounded-t-xl border-t border-x flex items-center gap-6 ${getStatusColor(result.confidence)}`}>
            <div className="flex-shrink-0 bg-slate-900/50 p-4 rounded-full">
              {getStatusIcon(result.confidence)}
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-widest mb-1 opacity-90">
                Data {result.confidence}
              </h3>
              <p className="opacity-80 font-medium">
                {result.confidence === 'Verified' && "Information aligns with current market sources."}
                {result.confidence === 'Contradicted' && "Significant discrepancies found in market data."}
                {result.confidence === 'Unverified' && "Insufficient data to verify this claim."}
              </p>
            </div>
          </div>

          {/* Analysis Body */}
          <div className="bg-slate-800 border-x border-b border-slate-700 rounded-b-xl p-6 shadow-xl">
            <div className="mb-8">
              <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-3">Grounding Analysis</h4>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-lg">
                  {result.verificationText}
                </p>
              </div>
            </div>

            {/* Sources Grid */}
            {result.sources.length > 0 && (
              <div>
                <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Verified Sources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start p-3 bg-slate-900 hover:bg-slate-900/80 border border-slate-700 hover:border-slate-600 rounded-lg transition-all group"
                    >
                      <div className="bg-slate-800 p-2 rounded text-slate-400 group-hover:text-emerald-400 transition-colors mr-3">
                        <Wheat size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-emerald-400 truncate group-hover:underline">
                          {source.title || "Unknown Source"}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {source.uri}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};