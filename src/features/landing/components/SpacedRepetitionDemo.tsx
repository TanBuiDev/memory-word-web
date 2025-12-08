import { useState, useEffect } from 'react';
import { Clock, RefreshCw, TrendingUp, Brain } from 'lucide-react';

const SpacedRepetitionDemo = () => {
    const [reviewStage, setReviewStage] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [forgettingProgress, setForgettingProgress] = useState<number>(0);
    const showReviewPoints = true; // Removed useState since setShowReviewPoints wasn't used

    // Dữ liệu mô phỏng - LÀM LẠI HOÀN TOÀN ĐỂ ĐÚNG NGUYÊN LÝ
    const stages = [
        {
            id: 0,
            name: "Mới học",
            retention: 100, // Bắt đầu từ 100%
            daysToForget: 1, // Quên sau 1 ngày
            curvePoints: "M 0,50 Q 150,300 300,290", // Quên nhanh
            color: "#ef4444",
            nextReviewDay: 1
        },
        {
            id: 1,
            name: "Ôn lần 1",
            retention: 95, // Sau ôn lần 1
            daysToForget: 3, // Quên sau 3 ngày
            curvePoints: "M 0,50 Q 100,200 300,220", // Quên chậm hơn
            color: "#f59e0b",
            nextReviewDay: 3
        },
        {
            id: 2,
            name: "Ôn lần 2",
            retention: 88, // Giảm chút nhưng vẫn cao
            daysToForget: 14, // Quên sau 14 ngày
            curvePoints: "M 0,50 Q 50,150 300,150", // Quên rất chậm
            color: "#3b82f6",
            nextReviewDay: 14
        },
        {
            id: 3,
            name: "Thành thạo",
            retention: 92, // Ổn định ở mức cao
            daysToForget: 60, // Gần như không quên
            curvePoints: "M 0,50 L 150,50 L 300,60", // Gần như phẳng
            color: "#10b981",
            nextReviewDay: null
        }
    ];

    const currentStage = stages[reviewStage];

    const handleReview = () => {
        if (reviewStage < 3) {
            setIsAnimating(true);

            // Reset forgetting progress khi ôn tập
            setForgettingProgress(0);

            // Hiệu ứng chuyển stage
            setTimeout(() => {
                setReviewStage(prev => prev + 1);
                setIsAnimating(false);
            }, 800);
        } else {
            // Reset hoàn toàn
            setReviewStage(0);
            setForgettingProgress(0);
            setIsAnimating(false);
        }
    };

    // Tự động mô phỏng quên dần theo thời gian
    useEffect(() => {
        if (reviewStage < 3 && !isAnimating) {
            const interval = setInterval(() => {
                setForgettingProgress(prev => {
                    if (prev >= 100) return 100;
                    return prev + 1;
                });
            }, 50); // Tăng 1% mỗi 50ms

            return () => clearInterval(interval);
        }
    }, [reviewStage, isAnimating]);

    // Tính retention rate thực tế dựa trên forgetting progress
    const calculateActualRetention = () => {
        const baseRetention = currentStage.retention;
        const decayRate = (100 - baseRetention) / 100;
        return Math.max(baseRetention - (forgettingProgress * decayRate), baseRetention * 0.3);
    };

    const actualRetention = calculateActualRetention();

    // Tính điểm trên đường cong dựa trên forgetting progress
    const calculateCurvePoint = () => {
        const progress = forgettingProgress / 100;

        switch (reviewStage) {
            case 0: // Quên nhanh
                return {
                    x: 300 * progress,
                    y: 50 + (240 * progress * progress) // Quadratic decay
                };
            case 1: // Quên vừa
                return {
                    x: 300 * progress,
                    y: 50 + (170 * Math.sqrt(progress)) // Square root decay
                };
            case 2: // Quên chậm
                return {
                    x: 300 * progress,
                    y: 50 + (100 * Math.pow(progress, 0.5)) // Slow decay
                };
            case 3: // Hầu như không quên
                return {
                    x: 300 * progress,
                    y: 50 + (10 * progress) // Linear, very slow
                };
            default:
                return { x: 0, y: 50 };
        }
    };

    const currentPoint = calculateCurvePoint();

    // Thêm hàm tính toán vị trí
    const calculateNextReviewX = () => {
        // Tỉ lệ: 0-300 tương ứng 0-7 ngày
        const reviewIntervals = [100, 200, 280]; // X cho ngày 1, 3, 7
        return reviewIntervals[reviewStage] || 100;
    };

    // Thêm hàm tạo label
    // const getNextReviewLabel = () => {
    //     const days = currentStage.nextReviewDay;
    //     return `Ôn sau ${days} ngày`;
    // };

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl mt-4">
            {/* --- CỘT TRÁI: BIỂU ĐỒ TƯƠNG TÁC ĐÚNG NGUYÊN LÝ --- */}
            <div className="flex-1 flex flex-col">
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 relative overflow-hidden flex-1 min-h-[400px]">
                    {/* Header với thông tin stage */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                <ActivityGraphIcon /> Biểu đồ Đường cong lãng quên - DEMO THỰC TẾ
                            </h4>
                            <p className="text-sm text-gray-500">
                                Mô phỏng chính xác: Học → Quên dần → Ôn đúng lúc → Nhớ lâu
                            </p>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-full border shadow-sm text-sm font-bold"
                            style={{ color: currentStage.color }}>
                            {currentStage.name}
                        </div>
                    </div>

                    {/* Biểu đồ SVG với đầy đủ thông tin */}
                    <div className="relative h-72 w-full mt-6">
                        <svg viewBox="0 0 300 320" className="w-full h-full overflow-visible">
                            {/* Grid và trục */}
                            <line x1="0" y1="50" x2="300" y2="50" stroke="#e2e8f0" strokeDasharray="4 4" />
                            <line x1="0" y1="170" x2="300" y2="170" stroke="#e2e8f0" strokeDasharray="4 4" />
                            <line x1="0" y1="290" x2="300" y2="290" stroke="#e2e8f0" strokeDasharray="4 4" />

                            {/* Trục Y */}
                            <text x="-15" y="55" fontSize="10" fill="#94a3b8" textAnchor="end">100%</text>
                            <text x="-15" y="175" fontSize="10" fill="#94a3b8" textAnchor="end">50%</text>
                            <text x="-15" y="295" fontSize="10" fill="#94a3b8" textAnchor="end">0%</text>

                            {/* Trục X với timeline thực tế */}
                            <text x="0" y="315" fontSize="10" fill="#94a3b8" textAnchor="start">Hôm nay</text>
                            <text x="100" y="315" fontSize="10" fill="#94a3b8" textAnchor="middle">1 ngày</text>
                            <text x="200" y="315" fontSize="10" fill="#94a3b8" textAnchor="middle">3 ngày</text>
                            <text x="300" y="315" fontSize="10" fill="#94a3b8" textAnchor="end">7+ ngày</text>

                            {/* Đường timeline các lần ôn trong tương lai */}
                            {showReviewPoints && reviewStage < 3 && (
                                <>
                                    <line
                                        x1={calculateNextReviewX()}
                                        y1="40"
                                        x2={calculateNextReviewX()}
                                        y2="310"
                                        stroke="#fbbf24"
                                        strokeWidth="1"
                                        strokeDasharray="3,3"
                                        opacity="0.5"
                                    />
                                    <text
                                        x={calculateNextReviewX()}
                                        y="35"
                                        fontSize="8"
                                        fill="#f59e0b"
                                        textAnchor="middle"
                                    >
                                        {/* {getNextReviewLabel()} */}
                                    </text>
                                    <circle
                                        cx={calculateNextReviewX()}
                                        cy="50"
                                        r="4"
                                        fill="#fbbf24"
                                        className="animate-pulse"
                                    />
                                </>
                            )}

                            {/* Đường cong HIỆN TẠI với điểm di chuyển */}
                            <path
                                d={currentStage.curvePoints}
                                fill="none"
                                stroke={currentStage.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="transition-all duration-500"
                                opacity="0.7"
                            />

                            {/* Điểm HIỆN TẠI đang di chuyển (quên dần) */}
                            <circle
                                cx={currentPoint.x}
                                cy={currentPoint.y}
                                r="5"
                                fill={currentStage.color}
                                className="transition-all duration-100"
                            >
                                <animate
                                    attributeName="r"
                                    values="5;7;5"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </circle>

                            {/* Đường kết nối từ điểm hiện tại đến trục Y */}
                            <line
                                x1={currentPoint.x}
                                y1={currentPoint.y}
                                x2={currentPoint.x}
                                y2="310"
                                stroke="#94a3b8"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                                opacity="0.5"
                            />

                            {/* Hiển thị giá trị retention hiện tại */}
                            <rect x={currentPoint.x - 25} y={currentPoint.y - 30} width="50" height="20" rx="4" fill="white" stroke="#cbd5e1" strokeWidth="1" />
                            <text x={currentPoint.x} y={currentPoint.y - 17} fontSize="9" fill="#374151" textAnchor="middle" fontWeight="bold">
                                {Math.round(actualRetention)}%
                            </text>
                        </svg>

                        {/* Thanh tiến trình quên */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Đang quên dần...</span>
                                <span>{forgettingProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-linear-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-300"
                                    style={{ width: `${forgettingProgress}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Sau {currentStage.daysToForget} ngày không ôn: Còn ~{Math.round(currentStage.retention * 0.3)}% trí nhớ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Control Bar với thông tin thực tế */}
                <div className="mt-6 flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            {reviewStage < 3 ? (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {forgettingProgress < 50
                                                ? "🧠 Đang nhớ tốt, nhưng sẽ quên dần..."
                                                : forgettingProgress < 80
                                                    ? "⚠️ Đã quên khá nhiều, cần ôn sớm!"
                                                    : "🔥 Sắp quên hết! Ôn tập ngay!"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Thời điểm ôn tối ưu: Sau {currentStage.nextReviewDay} ngày
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">✅ Đã vào trí nhớ dài hạn!</p>
                                        <p className="text-xs text-gray-500">Có thể nhớ đến {currentStage.daysToForget} ngày</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleReview}
                        disabled={isAnimating}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                            ${reviewStage === 3
                                ? "bg-gray-800 hover:bg-gray-900"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            } ${isAnimating ? 'animate-pulse' : ''}`}
                    >
                        {isAnimating ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang xử lý...
                            </span>
                        ) : reviewStage === 3 ? (
                            <><RefreshCw size={18} /> Demo lại từ đầu</>
                        ) : (
                            <><Brain size={18} /> Ôn tập ngay (Tăng {currentStage.nextReviewDay} ngày nhớ)</>
                        )}
                    </button>
                </div>
            </div>

            {/* --- CỘT PHẢI: THÔNG SỐ & GIẢI THÍCH CHI TIẾT --- */}
            <div className="lg:w-2/5 flex flex-col gap-6">
                {/* Hiệu quả hiện tại */}
                <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-xl shadow-sm">
                    <h5 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} /> Hiệu quả ghi nhớ HIỆN TẠI
                    </h5>

                    <div className="space-y-5">
                        {/* Retention Gauge */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Khả năng nhớ hiện tại</span>
                                <span className="text-2xl font-bold" style={{ color: currentStage.color }}>
                                    {Math.round(actualRetention)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="h-3 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${actualRetention}%`,
                                        backgroundColor: currentStage.color
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0% (Quên hết)</span>
                                <span>50% (Nhớ một nửa)</span>
                                <span>100% (Nhớ hoàn toàn)</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-indigo-100">
                                <div className="text-xs text-gray-500 mb-1">Thời gian nhớ ước tính</div>
                                <div className="text-xl font-bold text-indigo-700">
                                    ~{currentStage.daysToForget} ngày
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-indigo-100">
                                <div className="text-xs text-gray-500 mb-1">Số lần đã ôn</div>
                                <div className="text-xl font-bold text-indigo-700">{reviewStage} lần</div>
                            </div>
                        </div>

                        {/* Timeline dự kiến */}
                        <div className="mt-4 pt-4 border-t border-indigo-100">
                            <div className="text-xs font-medium text-gray-700 mb-2">Lộ trình ôn tập tối ưu:</div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="text-center">
                                    <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto">1</div>
                                    <div className="mt-1">Ngày 1</div>
                                </div>
                                <div className="h-1 flex-1 bg-linear-to-r from-red-400 to-yellow-400"></div>
                                <div className="text-center">
                                    <div className={`w-6 h-6 rounded-full ${reviewStage >= 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200'} flex items-center justify-center mx-auto`}>2</div>
                                    <div className="mt-1">Ngày 3</div>
                                </div>
                                <div className="h-1 flex-1 bg-linear-to-r from-yellow-400 to-blue-400"></div>
                                <div className="text-center">
                                    <div className={`w-6 h-6 rounded-full ${reviewStage >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'} flex items-center justify-center mx-auto`}>3</div>
                                    <div className="mt-1">Ngày 14</div>
                                </div>
                                <div className="h-1 flex-1 bg-linear-to-r from-blue-400 to-green-400"></div>
                                <div className="text-center">
                                    <div className={`w-6 h-6 rounded-full ${reviewStage >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'} flex items-center justify-center mx-auto`}>✓</div>
                                    <div className="mt-1">Thành thạo</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Giải thích khoa học */}
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-orange-500" />
                        Khoa học đằng sau Spaced Repetition
                    </h5>

                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="text-sm font-medium text-blue-800 mb-1">🧠 Hiệu ứng lãng quên của Ebbinghaus</div>
                            <p className="text-xs text-gray-600">
                                Sau 1 ngày: nhớ ~33% • Sau 1 tuần: nhớ ~25% • Sau 1 tháng: nhớ ~21%
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Quên một chút giúp nhớ lâu hơn</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        <span className="font-semibold">"Desirable Difficulty"</span>: Não cần thử thách vừa phải để củng cố trí nhớ.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Khoảng cách ôn tăng dần theo cấp số nhân</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Công thức: Khoảng cách mới = Khoảng cách cũ × 2.5<br />
                                        Ví dụ: 1 ngày → 3 ngày → 7 ngày → 18 ngày
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">AI cá nhân hóa dựa trên SSA-LSTM</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        MemoryWord phân tích hành vi học của bạn để tính toán thời điểm ôn tập chính xác cho từng từ vựng.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500 italic">
                                💡 <span className="font-medium">Mẹo:</span> Ôn tập đúng thời điểm "sắp quên" giúp tiết kiệm 70% thời gian học mà vẫn đạt 95% hiệu quả ghi nhớ.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Icon Component
const ActivityGraphIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
        <path d="M3 3v18h18" />
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
);

export default SpacedRepetitionDemo;