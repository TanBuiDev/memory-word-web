import { useState } from 'react';
import { Search, Zap, BarChart2, ArrowRight, RefreshCw, Brain } from 'lucide-react';

const SmartVocabularyDemo = () => {
    const [selectedWordId, setSelectedWordId] = useState<string>("good");
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [showMemoryScore, setShowMemoryScore] = useState<boolean>(false);

    const vocabularyDatabase = {
        good: {
            basic: "Good",
            context: "The performance was good.",
            alternatives: [
                {
                    word: "Stellar",
                    level: "C2",
                    nuance: "Xuất sắc, như các vì sao",
                    score: 98,
                    memoryScore: 92,  // Điểm ghi nhớ từ SSA-LSTM
                    nextReview: "3 ngày",  // Thời điểm ôn tập tiếp theo
                    difficulty: "Khó"  // Độ khó của từ
                },
                {
                    word: "Exceptional",
                    level: "C1",
                    nuance: "Ngoại hạng, hiếm có",
                    score: 92,
                    memoryScore: 88,
                    nextReview: "2 ngày",
                    difficulty: "Trung bình"
                },
                {
                    word: "Satisfactory",
                    level: "B2",
                    nuance: "Vừa đủ, chấp nhận được",
                    score: 75,
                    memoryScore: 95,
                    nextReview: "7 ngày",
                    difficulty: "Dễ"
                },
            ],
            metrics: {
                popularity: 95,
                formality: 20,
                complexity: 10,
                forgettingRate: 65,  // Tỉ lệ quên (cần cải thiện)
                learningPriority: "Cao"  // Ưu tiên học
            },
            ssaOptimized: true,  // Đã được SSA tối ưu
            memoryStrength: 72  // Độ mạnh trí nhớ hiện tại
        },
        happy: {
            basic: "Happy",
            context: "She felt happy about the news.",
            alternatives: [
                {
                    word: "Elated",
                    level: "C2",
                    nuance: "Phấn khích tột độ",
                    score: 96,
                    memoryScore: 85,
                    nextReview: "4 ngày",
                    difficulty: "Khó"
                },
                {
                    word: "Delighted",
                    level: "C1",
                    nuance: "Vui sướng, hài lòng",
                    score: 88,
                    memoryScore: 91,
                    nextReview: "5 ngày",
                    difficulty: "Trung bình"
                },
                {
                    word: "Content",
                    level: "B2",
                    nuance: "An lòng, mãn nguyện",
                    score: 70,
                    memoryScore: 96,
                    nextReview: "10 ngày",
                    difficulty: "Dễ"
                },
            ],
            metrics: {
                popularity: 90,
                formality: 30,
                complexity: 15,
                forgettingRate: 45,
                learningPriority: "Trung bình"
            },
            ssaOptimized: true,
            memoryStrength: 85
        },
        important: {
            basic: "Important",
            context: "This is an important decision.",
            alternatives: [
                {
                    word: "Crucial",
                    level: "C1",
                    nuance: "Quyết định đến thành bại",
                    score: 95,
                    memoryScore: 78,
                    nextReview: "2 ngày",
                    difficulty: "Khó"
                },
                {
                    word: "Pivotal",
                    level: "C2",
                    nuance: "Then chốt, xoay chuyển cục diện",
                    score: 94,
                    memoryScore: 82,
                    nextReview: "3 ngày",
                    difficulty: "Khó"
                },
                {
                    word: "Significant",
                    level: "B2",
                    nuance: "Đáng kể, có ý nghĩa",
                    score: 82,
                    memoryScore: 94,
                    nextReview: "6 ngày",
                    difficulty: "Trung bình"
                },
            ],
            metrics: {
                popularity: 85,
                formality: 50,
                complexity: 25,
                forgettingRate: 55,
                learningPriority: "Cao"
            },
            ssaOptimized: true,
            memoryStrength: 68
        }
    };

    const currentData = vocabularyDatabase[selectedWordId as keyof typeof vocabularyDatabase];

    const handleWordChange = (id: string) => {
        setIsAnalyzing(true);
        setSelectedWordId(id);
        setTimeout(() => setIsAnalyzing(false), 600);
    };

    const handleToggleMemoryScore = () => {
        setShowMemoryScore(!showMemoryScore);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl mt-4">

            {/* --- CỘT TRÁI: INPUT & SSA-LSTM INSIGHTS --- */}
            <div className="lg:w-2/5 flex flex-col gap-6">
                {/* Header với tên hệ thống */}
                <div className="bg-linear-to-r from-indigo-900 to-purple-900 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="font-bold text-lg flex items-center gap-2">
                                <Brain className="text-indigo-300" size={22} />
                                SSA-LSTM Vocabulary Optimizer
                            </h5>
                            <p className="text-sm text-indigo-200 mt-1">Tối ưu hóa từ vựng bằng AI thích ứng</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${currentData.ssaOptimized ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'}`}>
                            {currentData.ssaOptimized ? '✓ Đã tối ưu SSA' : 'Đang tối ưu hóa'}
                        </div>
                    </div>
                </div>

                {/* Word Selector với SSA Insights */}
                <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-300">
                    <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Search size={20} /> Chọn từ cần tối ưu
                    </h5>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {Object.keys(vocabularyDatabase).map((key) => {
                            const wordData = vocabularyDatabase[key as keyof typeof vocabularyDatabase];
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleWordChange(key)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-2 relative overflow-hidden
                                        ${selectedWordId === key
                                            ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105"
                                            : "bg-white text-gray-600 hover:bg-indigo-50 border border-gray-300"
                                        }`}
                                >
                                    <span>{key}</span>
                                    {wordData.ssaOptimized && (
                                        <div className={`w-2 h-2 rounded-full ${wordData.memoryStrength > 80 ? 'bg-green-500' : wordData.memoryStrength > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Memory Strength Indicator */}
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Độ mạnh trí nhớ hiện tại</span>
                            <span className={`font-bold ${currentData.memoryStrength > 80 ? 'text-green-600' : currentData.memoryStrength > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {currentData.memoryStrength}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${currentData.memoryStrength > 80 ? 'bg-linear-to-r from-green-500 to-emerald-500' :
                                    currentData.memoryStrength > 60 ? 'bg-linear-to-r from-yellow-500 to-orange-500' :
                                        'bg-linear-to-r from-red-500 to-pink-500'
                                    }`}
                                style={{ width: `${currentData.memoryStrength}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Dễ quên</span>
                            <span>Ổn định</span>
                            <span>Vững chắc</span>
                        </div>
                    </div>
                </div>

                {/* SSA-LSTM Analysis Card */}
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
                    <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <Brain size={20} className="text-blue-600" />
                        Phân tích SSA-LSTM
                    </h5>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <div className="text-xs text-blue-700 font-medium">Tỉ lệ quên</div>
                                <div className="text-xl font-bold text-blue-900">{currentData.metrics.forgettingRate}%</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <div className="text-xs text-blue-700 font-medium">Ưu tiên học</div>
                                <div className={`text-sm font-bold ${currentData.metrics.learningPriority === 'Cao' ? 'text-red-600' : currentData.metrics.learningPriority === 'Trung bình' ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {currentData.metrics.learningPriority}
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-blue-800">
                            <p className="mb-2">🔍 <span className="font-medium">Phân tích hành vi học:</span> Từ này có tỉ lệ quên {currentData.metrics.forgettingRate}%</p>
                            <p>🎯 <span className="font-medium">Đề xuất của AI:</span> {currentData.metrics.learningPriority === 'Cao' ? 'Cần ôn tập thường xuyên' : 'Có thể ôn tập với khoảng cách dài hơn'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CỘT GIỮA: AI PROCESSING VISUAL --- */}
            <div className="hidden lg:flex flex-col items-center justify-center w-20">
                <div className={`relative w-14 h-14 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white transition-all duration-700 ${isAnalyzing ? "scale-125 shadow-lg shadow-indigo-400/50" : ""}`}>
                    {isAnalyzing ? (
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <ArrowRight size={26} className="animate-pulse" />
                    )}
                </div>
                <div className="mt-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-1">SSA-LSTM đang xử lý</div>
                    <div className="text-[10px] text-gray-400">Tối ưu hóa hyperparameters</div>
                </div>
            </div>

            {/* --- CỘT PHẢI: AI RECOMMENDATIONS với Memory Insights --- */}
            <div className="flex-1 bg-linear-to-br from-gray-900 to-gray-950 rounded-xl p-6 text-white relative overflow-hidden">
                {/* Background effect với gradient SSA-LSTM theme */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-r from-blue-600 to-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-bold text-xl flex items-center gap-2">
                                <Zap className="text-yellow-400 fill-current" size={22} />
                                Đề xuất từ SSA-LSTM
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">Tối ưu hóa cho ghi nhớ lâu dài</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAnalyzing && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-indigo-300">AI đang phân tích...</span>
                                </div>
                            )}
                            <button
                                onClick={handleToggleMemoryScore}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors
                                    ${showMemoryScore
                                        ? "bg-indigo-800 text-indigo-100"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    }`}
                            >
                                <Brain size={12} />
                                {showMemoryScore ? "Xem điểm phù hợp" : "Xem điểm ghi nhớ"}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {currentData.alternatives.map((alt, idx) => (
                            <div
                                key={idx}
                                className={`group p-5 rounded-xl border transition-all duration-500 cursor-default
                                    ${isAnalyzing
                                        ? "opacity-50 translate-x-4 border-gray-800 bg-gray-900/30"
                                        : "opacity-100 translate-x-0 border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-indigo-500"
                                    }
                                `}
                                style={{ transitionDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <h5 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                {alt.word}
                                            </h5>
                                            <span className={`text-xs px-2 py-1 rounded font-bold
                                                ${alt.level === 'C2' ? 'bg-linear-to-r from-purple-900 to-purple-800 text-purple-100' :
                                                    alt.level === 'C1' ? 'bg-linear-to-r from-indigo-900 to-indigo-800 text-indigo-100' :
                                                        'bg-linear-to-r from-blue-900 to-blue-800 text-blue-100'}
                                            `}>
                                                {alt.level}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded border ${alt.difficulty === 'Khó' ? 'border-red-500 text-red-400 bg-red-900/20' :
                                                alt.difficulty === 'Trung bình' ? 'border-yellow-500 text-yellow-400 bg-yellow-900/20' :
                                                    'border-green-500 text-green-400 bg-green-900/20'
                                                }`}>
                                                {alt.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-3">{alt.nuance}</p>

                                        {/* Memory & Review Info */}
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-gray-400">Ôn tập sau:</span>
                                                <span className="font-medium text-blue-300">{alt.nextReview}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-gray-400">Độ khó:</span>
                                                <span className={`font-medium ${alt.difficulty === 'Khó' ? 'text-red-300' :
                                                    alt.difficulty === 'Trung bình' ? 'text-yellow-300' :
                                                        'text-green-300'
                                                    }`}>
                                                    {alt.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Display */}
                                    <div className="text-right ml-4">
                                        <div className={`text-3xl font-bold mb-1 ${showMemoryScore ? 'text-cyan-400' : 'text-green-400'}`}>
                                            {showMemoryScore ? alt.memoryScore : alt.score}
                                        </div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">
                                            {showMemoryScore ? "Điểm ghi nhớ" : "Điểm phù hợp"}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            {showMemoryScore ?
                                                alt.memoryScore > 90 ? "Dễ nhớ" :
                                                    alt.memoryScore > 80 ? "Trung bình" : "Khó nhớ" :
                                                alt.score > 90 ? "Hoàn hảo" :
                                                    alt.score > 80 ? "Tốt" : "Khá"
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Dual Progress Bars */}
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Độ phù hợp ngữ cảnh</span>
                                            <span>{alt.score}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                                                style={{ width: isAnalyzing ? '0%' : `${alt.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Khả năng ghi nhớ (SSA-LSTM)</span>
                                            <span>{alt.memoryScore}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                                                style={{ width: isAnalyzing ? '0%' : `${alt.memoryScore}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer với SSA-LSTM Features */}
                    <div className="mt-8 pt-4 border-t border-gray-800">
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-indigo-900/50 rounded">
                                    <Brain size={14} className="text-indigo-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-400">SSA Optimized</div>
                                    <div className="text-[10px]">Hyperparameters tối ưu</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-purple-900/50 rounded">
                                    <BarChart2 size={14} className="text-purple-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-400">LSTM Memory</div>
                                    <div className="text-[10px]">Phân tích chuỗi thời gian</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-blue-900/50 rounded">
                                    <RefreshCw size={14} className="text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-400">Spaced Repetition</div>
                                    <div className="text-[10px]">Lịch ôn tập thông minh</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SmartVocabularyDemo;