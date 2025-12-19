import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebase"
import type { User } from "firebase/auth"
import type { Word } from "../types/word"
import { getUserProgress } from "../utils/streakService"
import { getUserAnalytics, searchUserWords, getWordRecallData, type RecallHistoryPoint } from "../utils/analyticsService"
import TradingChart from "../components/TradingChart"
import { useDebounce } from "../hooks/useDebounce"
import memoaiLogo from "../assets/memoai-logo-transparent.png"

// --- TYPES CHO UI ---
interface UserProgressUI {
    currentStreak: number;
    totalWordsStudied: number;
    todayProgress: number;
    dailyGoal: number;
}

interface AnalyticsDataUI {
    totalCorrect: number;
    overallAccuracy: number;
    uniqueWordsStudied: number;
    hardestWordIds: string[];
}

interface StatProps {
    label: string;
    value: string | number;
    subValue?: string;
    change?: string;
    isPositive?: boolean;
    color?: string;
}

// --- SUB-COMPONENT: Stat Card với Light Theme ---
const Stat = ({ label, value, subValue, change, isPositive, color = "text-gray-800" }: StatProps) => (
    <div className="bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all group shadow-sm">
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 group-hover:text-indigo-600">{label}</div>
        <div className="flex items-baseline gap-2">
            <div className={`text-xl font-black font-mono tracking-tighter ${color}`}>{value}</div>
            {subValue && <span className="text-xs text-gray-500 font-semibold uppercase">{subValue}</span>}
        </div>
        {change && <div className={`text-xs font-bold mt-2 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}><span>{isPositive ? '▲' : '▼'}</span> {change}</div>}
    </div>
);

export default function Analytics({ user }: { user: User }) {
    // --- STATE ---
    const [progress, setProgress] = useState<UserProgressUI | null>(null)
    const [analytics, setAnalytics] = useState<AnalyticsDataUI | null>(null)
    const [loading, setLoading] = useState(true)

    // Search & Chart State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Word[]>([]);
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);
    const [recallHistory, setRecallHistory] = useState<RecallHistoryPoint[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [hardestWordsDetails, setHardestWordsDetails] = useState<Word[]>([]);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Chart Domain State
    const [xDomain, setXDomain] = useState<[number, number]>([0, 0]);
    const [yDomain, setYDomain] = useState<[number, number]>([0, 1]);

    // --- EFFECT 1: Load Initial Data (Firebase) ---
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                const [progressData, analyticsData] = await Promise.all([
                    getUserProgress(user.uid),
                    getUserAnalytics(user.uid)
                ])

                setProgress({
                    currentStreak: progressData.currentStreak,
                    totalWordsStudied: progressData.totalWordsStudied,
                    todayProgress: progressData.todayProgress,
                    dailyGoal: progressData.dailyGoal
                })

                setAnalytics({
                    totalCorrect: analyticsData.totalCorrect,
                    overallAccuracy: analyticsData.overallAccuracy,
                    uniqueWordsStudied: analyticsData.uniqueWordsStudied,
                    hardestWordIds: analyticsData.hardestWordIds
                })

                // Fetch chi tiết các từ khó nhất để hiển thị tên
                if (analyticsData.hardestWordIds.length > 0) {
                    const wordsRef = collection(db, "words")
                    // Firestore không hỗ trợ where("__name__", "in", ...), cần lấy tất cả rồi filter
                    const q = query(wordsRef, where("userId", "==", user.uid));
                    const snapshot = await getDocs(q);
                    const allWords = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Word));
                    const hardWords = allWords.filter(w => analyticsData.hardestWordIds.includes(w.id));
                    setHardestWordsDetails(hardWords.slice(0, 10));
                }

            } catch (error) {
                console.error("Error loading analytics:", error)
            } finally {
                setLoading(false)
            }
        }
        if (user) loadData()
    }, [user])

    // --- EFFECT 2: Search Words (Firebase) ---
    useEffect(() => {
        if (debouncedSearchTerm) {
            searchUserWords(user.uid, debouncedSearchTerm).then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchTerm, user.uid]);

    // --- EFFECT 3: Load History for Chart (Firebase) ---
    useEffect(() => {
        if (selectedWord) {
            setHistoryLoading(true);
            getWordRecallData(user.uid, selectedWord.id, selectedWord.p_recall)
                .then((data) => {
                    const history = data.history;
                    setRecallHistory(history);

                    // Auto-zoom chart to data range (index-based)
                    if (history.length > 0) {
                        // Set domain based on array length with padding
                        setXDomain([-0.5, history.length - 0.5]);
                    } else {
                        // Default domain when no data
                        setXDomain([0, 5]);
                    }
                    setYDomain([0, 1]);
                })
                .finally(() => setHistoryLoading(false));
        }
    }, [selectedWord, user.uid]);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin text-6xl mb-4">📊</div>
                <p className="text-indigo-600 font-bold text-xl">Đang tải dữ liệu...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-800 p-6">
            <div className="max-w-[1500px] mx-auto space-y-6">

                {/* HEADER */}
                <div className="flex items-center justify-between gap-6 border-b border-gray-200 pb-6 bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <img src={memoaiLogo} alt="MemoryWord Logo" className="h-12 w-auto" />
                        <div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">MemoryWord Analytics</h1>
                            <p className="text-sm text-gray-500 font-medium">Phân tích tiến độ học từ vựng</p>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm từ vựng..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-800 shadow-sm"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                {searchResults.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => { setSelectedWord(w); setSearchTerm(''); setSearchResults([]); }}
                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-100 last:border-0 transition-all flex justify-between items-center group"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm group-hover:text-indigo-600">{w.term}</div>
                                            <div className="text-xs text-gray-500">{w.shortMeaning}</div>
                                        </div>
                                        <span className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100">XEM</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Stat label="TỪ ĐÃ HỌC" value={analytics?.uniqueWordsStudied || 0} />
                    <Stat
                        label="TỶ LỆ NHỚ"
                        value={`${Math.round((analytics?.overallAccuracy || 0) * 100)}%`}
                        isPositive={analytics ? analytics.overallAccuracy > 0.7 : undefined}
                        change={analytics && analytics.overallAccuracy > 0.7 ? "TỐT" : "THẤP"}
                    />
                    <Stat label="CHUỖI NGÀY" value={progress?.currentStreak || 0} subValue="ngày" isPositive />
                    <Stat label="TỔNG LƯỢT" value={progress?.totalWordsStudied || 0} />
                    <Stat label="MỤC TIÊU" value={`${progress?.todayProgress}/${progress?.dailyGoal}`} />
                    <Stat label="CÂU ĐÚNG" value={analytics?.totalCorrect || 0} color="text-green-600" />
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* CHART SECTION */}
                    <div className="lg:col-span-9 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg relative">
                            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                                        <button
                                            onClick={() => {
                                                const h = (yDomain[1] - yDomain[0]) * 0.8 / 2;
                                                const c = (yDomain[0] + yDomain[1]) / 2;
                                                setYDomain([Math.max(0, c - h), Math.min(1, c + h)]);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-indigo-600 font-bold hover:bg-indigo-50 rounded text-xs"
                                            title="Phóng to trục Y"
                                        >
                                            Y+
                                        </button>
                                        <button
                                            onClick={() => {
                                                const h = (yDomain[1] - yDomain[0]) * 1.2 / 2;
                                                const c = (yDomain[0] + yDomain[1]) / 2;
                                                setYDomain([Math.max(0, c - h), Math.min(1, c + h)]);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-100 rounded text-xs"
                                            title="Thu nhỏ trục Y"
                                        >
                                            Y-
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (recallHistory.length) {
                                                setXDomain([-0.5, recallHistory.length - 0.5]);
                                            } else {
                                                setXDomain([0, 5]);
                                            }
                                            setYDomain([0, 1]);
                                        }}
                                        className="px-4 h-10 bg-indigo-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all hover:bg-indigo-700 shadow-sm"
                                    >
                                        Đặt lại
                                    </button>
                                </div>
                                {selectedWord && (
                                    <div className="text-xs font-mono text-right">
                                        <span className="text-gray-500">ĐANG XEM:</span>
                                        <span className="text-gray-800 font-bold ml-2">{selectedWord.term.toUpperCase()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="h-[600px] relative bg-white">
                                {selectedWord ? (
                                    <TradingChart
                                        data={recallHistory}
                                        xDomain={xDomain}
                                        yDomain={yDomain}
                                        onDomainChange={(x: [number, number], y: [number, number]) => { setXDomain(x); setYDomain(y); }}
                                        onReset={() => { }}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-6">
                                        <div className="w-24 h-24 bg-white border border-gray-200 rounded-full flex items-center justify-center text-4xl shadow-lg">📈</div>
                                        <h3 className="text-2xl font-bold text-gray-800">Chọn từ vựng để xem biểu đồ</h3>
                                        <p className="text-gray-600 max-w-sm text-sm leading-relaxed">
                                            Sử dụng thanh tìm kiếm ở trên để chọn một từ vựng và xem biểu đồ P-Recall theo thời gian của từ đó.
                                        </p>
                                    </div>
                                )}
                                {historyLoading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-indigo-600 font-bold tracking-wider">
                                        ĐANG TẢI DỮ LIỆU...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR: Alerts & Strategy */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Hardest Words Alert */}
                        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                Từ cần ôn lại
                            </h3>
                            <div className="space-y-3">
                                {hardestWordsDetails.length > 0 ? hardestWordsDetails.map(word => (
                                    <div key={word.id} className="p-3 bg-red-50 border border-red-200 rounded-xl group hover:border-red-400 transition-all cursor-pointer">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs text-red-600 tracking-wider uppercase">Cần ôn</span>
                                        </div>
                                        <div className="text-sm text-gray-800 font-bold uppercase tracking-tight">{word.term}</div>
                                        <div className="text-xs text-gray-600 truncate">{word.shortMeaning}</div>
                                        <button className="mt-3 w-full py-1.5 bg-white group-hover:bg-red-600 group-hover:text-white text-red-600 rounded-lg font-bold text-xs transition-all uppercase">
                                            Ôn lại
                                        </button>
                                    </div>
                                )) : (
                                    <div className="text-center text-xs text-gray-400 py-4">Không có từ cần ôn</div>
                                )}
                            </div>
                        </div>

                        {/* Strategy / Recommendation */}
                        <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-4">Khuyến nghị</div>
                            <h3 className="text-xl font-bold mb-2">
                                {progress && progress.currentStreak > 3 ? "Tiến độ tốt! 🎉" : "Tiếp tục cố gắng! 💪"}
                            </h3>
                            <p className="text-xs opacity-90 leading-relaxed mb-6">
                                {analytics && analytics.overallAccuracy > 0.8
                                    ? "Tỷ lệ nhớ của bạn rất cao. Hãy thử thách bản thân với nhiều từ mới hơn!"
                                    : "Tỷ lệ nhớ đang ổn định. Hãy tập trung củng cố các từ hiện có để tăng độ bền vững."}
                            </p>
                            <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wider shadow-lg">
                                Bắt đầu học
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
