
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './hooks/useDebounce';
import TradingChart from './components/TradingChart';
import { Word, UserProgress, AnalyticsData, RecallHistoryPoint } from './types';

// Mock Services for demo context
const mockFetchAnalytics = async (uid: string): Promise<AnalyticsData> => {
  return {
    totalAttempts: 1250,
    totalCorrect: 980,
    overallAccuracy: 0.784,
    accuracyByDay: Array.from({ length: 14 }, (_, i) => ({
      date: `2024-03-${String(15 + i).padStart(2, '0')}`,
      accuracy: 0.6 + Math.random() * 0.4,
      total: Math.floor(Math.random() * 50) + 10
    })),
    hardestWordIds: ['w1', 'w2'],
    typeBreakdown: { flashcard: 600, mcq: 400, fill: 250 },
    uniqueWordsStudied: 450
  };
};

const mockFetchProgress = async (uid: string): Promise<UserProgress> => {
  return {
    currentStreak: 12,
    longestStreak: 45,
    totalWordsStudied: 3200,
    totalQuizzesTaken: 156,
    todayProgress: 15,
    dailyGoal: 20
  };
};

const mockSearchWords = async (uid: string, term: string): Promise<Word[]> => {
  const words = [
    { id: 'w1', term: 'Ubiquitous', shortMeaning: 'Có mặt ở khắp nơi', p_recall: 0.85, userId: uid },
    { id: 'w2', term: 'Ephemeral', shortMeaning: 'Phù du, chóng tàn', p_recall: 0.42, userId: uid },
    { id: 'w3', term: 'Pragmatic', shortMeaning: 'Thực dụng, thực tế', p_recall: 0.91, userId: uid },
    { id: 'w4', term: 'Sycophant', shortMeaning: 'Kẻ nịnh hót', p_recall: 0.35, userId: uid },
  ];
  return words.filter(w => w.term.toLowerCase().includes(term.toLowerCase()));
};

const mockFetchRecallData = async (uid: string, wordId: string): Promise<RecallHistoryPoint[]> => {
  const history: RecallHistoryPoint[] = [];
  let baseTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
  let currentP = 0.5;
  for (let i = 0; i < 40; i++) {
    baseTime += Math.random() * (1 * 24 * 60 * 60 * 1000);
    const correct = Math.random() > (1 - currentP);
    currentP = correct ? Math.min(1, currentP + 0.1) : Math.max(0, currentP - 0.15);
    history.push({
      timestamp: baseTime,
      pRecall: currentP,
      correct
    });
  }
  return history;
};

interface AnalyticsProps {
  user: { uid: string; email: string; displayName?: string };
}

export default function Analytics({ user }: AnalyticsProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Recall Chart States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [recallHistory, setRecallHistory] = useState<RecallHistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Domains
  const [xDomain, setXDomain] = useState<[number, number]>([0, 0]);
  const [yDomain, setYDomain] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const init = async () => {
      try {
        const [p, a] = await Promise.all([
          mockFetchProgress(user.uid),
          mockFetchAnalytics(user.uid)
        ]);
        setProgress(p);
        setAnalytics(a);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user.uid]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      mockSearchWords(user.uid, debouncedSearchTerm).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, user.uid]);

  useEffect(() => {
    if (selectedWord) {
      setHistoryLoading(true);
      mockFetchRecallData(user.uid, selectedWord.id)
        .then(history => {
          setRecallHistory(history);
          if (history.length > 0) {
            const timestamps = history.map(h => h.timestamp);
            setXDomain([Math.min(...timestamps), Math.max(...timestamps)]);
          }
        })
        .finally(() => setHistoryLoading(false));
    }
  }, [selectedWord, user.uid]);

  const handleDomainChange = (newX: [number, number], newY: [number, number]) => {
    setXDomain(newX);
    setYDomain(newY);
  };

  const handleYZoom = (factor: number) => {
    const center = (yDomain[0] + yDomain[1]) / 2;
    const halfWidth = ((yDomain[1] - yDomain[0]) * factor) / 2;
    setYDomain([Math.max(0, center - halfWidth), Math.min(1, center + halfWidth)]);
  };

  const handleReset = () => {
    if (recallHistory.length > 0) {
      const timestamps = recallHistory.map(h => h.timestamp);
      setXDomain([Math.min(...timestamps), Math.max(...timestamps)]);
    }
    setYDomain([0, 1]);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="animate-pulse text-[#2962ff] text-xl font-bold tracking-widest">LOADING TRADING ENGINE...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#d1d4dc] pb-20">
      {/* Navbar Area */}
      <div className="border-b border-[#21262d] bg-[#161b22] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#2962ff] rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(41,98,255,0.4)]">LC</div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">LingoChart <span className="text-[#2962ff]">Pro</span></h1>
            <p className="text-[10px] text-[#8b949e] font-mono tracking-wider uppercase">Institutional Recall Analysis</p>
          </div>
        </div>
        
        <div className="relative w-64 md:w-96">
          <input 
            type="text"
            placeholder="Search word to analyze (e.g. Ubiquitous)..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#2962ff] transition-all placeholder-[#484f58]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-[#161b22] border border-[#30363d] rounded-md shadow-2xl z-50 overflow-hidden">
              {searchResults.map(word => (
                <button
                  key={word.id}
                  onClick={() => { setSelectedWord(word); setSearchTerm(''); setSearchResults([]); }}
                  className="w-full text-left px-4 py-3 hover:bg-[#21262d] border-b border-[#30363d] last:border-0 transition-colors"
                >
                  <div className="font-bold text-white text-sm">{word.term}</div>
                  <div className="text-[11px] text-[#8b949e] line-clamp-1">{word.shortMeaning}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto p-6 space-y-6">
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard label="Total Words" value={analytics?.uniqueWordsStudied || 0} change="+12%" />
          <StatCard label="Recall Rate" value={`${Math.round((analytics?.overallAccuracy || 0) * 100)}%`} isPositive={true} />
          <StatCard label="Current Streak" value={progress?.currentStreak || 0} subValue="Days" />
          <StatCard label="Total Quizzes" value={progress?.totalQuizzesTaken || 0} />
          <StatCard label="Daily Goal" value={`${progress?.todayProgress}/${progress?.dailyGoal}`} />
          <StatCard label="Correct Answers" value={analytics?.totalCorrect || 0} color="text-[#089981]" />
        </div>

        {/* Main Chart Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden shadow-2xl">
              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-[#21262d] flex items-center justify-between flex-wrap gap-4 bg-[#1c2128]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-[#0d1117] rounded p-1 border border-[#30363d]">
                    <button onClick={() => handleYZoom(0.8)} className="w-8 h-7 flex items-center justify-center hover:bg-[#21262d] text-[#8b949e] rounded transition-colors" title="Zoom Y In">Y+</button>
                    <button onClick={() => handleYZoom(1.2)} className="w-8 h-7 flex items-center justify-center hover:bg-[#21262d] text-[#8b949e] rounded transition-colors" title="Zoom Y Out">Y-</button>
                  </div>
                  <button onClick={handleReset} className="px-3 h-9 bg-[#2962ff] hover:bg-[#1e40af] text-white text-[10px] font-bold rounded shadow-lg transition-all uppercase tracking-widest">Reset Chart</button>
                </div>
                
                {selectedWord && (
                  <div className="flex items-center gap-4 text-[10px] font-mono font-bold">
                    <div className="text-[#8b949e]">PAIR: <span className="text-white uppercase">{selectedWord.term} / TIME</span></div>
                    <div className="text-[#8b949e]">VOL: <span className="text-[#089981]">{recallHistory.length} ENTRIES</span></div>
                  </div>
                )}
              </div>

              <div className="h-[600px] w-full relative">
                {selectedWord ? (
                  <TradingChart 
                    data={recallHistory} 
                    xDomain={xDomain} 
                    yDomain={yDomain} 
                    onDomainChange={handleDomainChange}
                    onReset={handleReset}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-12 bg-[#0d1117]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#2962ff]/20 blur-3xl rounded-full"></div>
                      <div className="relative w-24 h-24 bg-[#161b22] border border-[#2a2e39] rounded-full flex items-center justify-center text-4xl">🔬</div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Initialize Data Stream</h3>
                      <p className="text-[#8b949e] max-w-md mx-auto text-sm leading-relaxed">Search for a term to visualize its probability decay and memory reinforcement events through our high-frequency data engine.</p>
                    </div>
                    <div className="flex gap-4">
                      {['Ubiquitous', 'Ephemeral', 'Pragmatic'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setSearchTerm(t)}
                          className="px-4 py-2 bg-[#21262d] hover:bg-[#2962ff] text-[11px] font-bold rounded border border-[#30363d] transition-all"
                        >
                          ANALYZE {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interaction Log */}
            {selectedWord && recallHistory.length > 0 && (
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b border-[#21262d] flex justify-between items-center bg-[#1c2128]">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8b949e]">Real-time Transaction History</h3>
                  <span className="text-[10px] text-[#089981] animate-pulse font-mono font-bold">● CONNECTED</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                  <table className="w-full text-left text-[11px] font-mono border-collapse">
                    <thead className="bg-[#0d1117] text-[#484f58] sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 font-bold border-b border-[#21262d]">TIME</th>
                        <th className="px-6 py-3 font-bold border-b border-[#21262d]">ACTION</th>
                        <th className="px-6 py-3 font-bold border-b border-[#21262d] text-right">PROBABILITY</th>
                        <th className="px-6 py-3 font-bold border-b border-[#21262d] text-right">DELTA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d]">
                      {recallHistory.slice().reverse().map((h, i, arr) => {
                        const prev = arr[i + 1];
                        const delta = prev ? h.pRecall - prev.pRecall : 0;
                        return (
                          <tr key={i} className="hover:bg-[#1c2128] transition-colors group">
                            <td className="px-6 py-4 text-[#8b949e] group-hover:text-white transition-colors">
                              {new Date(h.timestamp).toLocaleString('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-2 py-0.5 rounded-[2px] font-bold text-[9px] ${h.correct ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'}`}>
                                {h.correct ? 'REINFORCED' : 'DECAYED'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-white">{(h.pRecall * 100).toFixed(2)}%</td>
                            <td className={`px-6 py-4 text-right font-bold ${delta >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                              {delta === 0 ? '-' : `${delta > 0 ? '+' : ''}${(delta * 100).toFixed(2)}%`}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 shadow-xl">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8b949e] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f23645]"></span> Critical Alerts
              </h3>
              <div className="space-y-4">
                {analytics?.hardestWordIds.map(id => (
                  <div key={id} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg group hover:border-[#f23645] transition-all cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[10px] text-[#f23645] tracking-widest uppercase">Recall Alert</span>
                      <span className="text-[10px] text-[#484f58] font-mono">#{id}</span>
                    </div>
                    <div className="text-sm text-white font-bold mb-1">Momentum Loss Detected</div>
                    <div className="text-[11px] text-[#8b949e] leading-tight">Retention dropped below 50% critical threshold. Urgent review recommended.</div>
                    <button className="mt-4 w-full py-2 bg-[#21262d] group-hover:bg-[#f23645] group-hover:text-white text-[#8b949e] rounded font-black text-[9px] transition-all uppercase tracking-widest">Execute Drill</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 shadow-xl">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8b949e] mb-6">Quiz Type Exposure</h3>
              <div className="space-y-5">
                <ProgressBar label="Flashcards" value={analytics?.typeBreakdown.flashcard || 0} total={analytics?.totalAttempts || 1} color="bg-[#2962ff]" />
                <ProgressBar label="Multiple Choice" value={analytics?.typeBreakdown.mcq || 0} total={analytics?.totalAttempts || 1} color="bg-[#8e44ad]" />
                <ProgressBar label="Fill-in-Blanks" value={analytics?.typeBreakdown.fill || 0} total={analytics?.totalAttempts || 1} color="bg-[#089981]" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#2962ff] to-[#1e40af] rounded-xl p-6 text-white shadow-[0_20px_40px_rgba(41,98,255,0.3)]">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Market Outlook</div>
              <h3 className="text-xl font-bold mb-2">Portfolio Optimized</h3>
              <p className="text-xs opacity-90 leading-relaxed mb-6">Your recall efficiency is up 14.2% this week. Strategic focus on High-Volatility nouns recommended for tomorrow's session.</p>
              <button className="w-full bg-white text-[#2962ff] py-3 rounded-lg font-black text-[10px] hover:scale-[1.02] transition-all uppercase tracking-[0.2em] shadow-xl">Start Strategy Session</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, change, isPositive, color = "text-white" }: any) {
  return (
    <div className="bg-[#161b22] border border-[#21262d] p-5 rounded-xl hover:bg-[#1c2128] transition-all group cursor-default">
      <div className="text-[9px] text-[#484f58] font-black uppercase tracking-[0.2em] mb-3 group-hover:text-[#8b949e] transition-colors">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className={`text-2xl font-black font-mono tracking-tighter ${color}`}>{value}</div>
        {subValue && <span className="text-[10px] text-[#484f58] font-bold uppercase">{subValue}</span>}
      </div>
      {change && (
        <div className={`text-[10px] font-black mt-2 flex items-center gap-1 ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
          <span className="text-[8px]">{isPositive ? '▲' : '▼'}</span> {change}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ label, value, total, color }: any) {
  const percentage = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
        <span className="text-[#8b949e]">{label}</span>
        <span className="text-white">{percentage}%</span>
      </div>
      <div className="h-1 bg-[#0d1117] rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000 shadow-[0_0_8px_rgba(41,98,255,0.5)]`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
