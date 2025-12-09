import { useState } from 'react';
import { Database, Brain, Activity, Map, Settings, TrendingUp, Info, ChevronDown, ChevronUp, Image as ImageIcon, Code, Video } from 'lucide-react';
import behaviorDataImg from '../../../assets/Detailv2.png';
import SSALSTMImg from '../../../assets/SSA_LSTM.png';

const SSALSTMDiagram = () => {
    const [activeStep, setActiveStep] = useState<string>("");
    const [activeMediaTab, setActiveMediaTab] = useState<string>("image");

    // --- HÀM HELPER: CHUYỂN LINK YOUTUBE SANG DẠNG EMBED ---
    const getEmbedUrl = (url: string | undefined) => {
        if (!url) return "";
        // Nếu là link xem thường (watch?v=ID) -> Chuyển thành embed/ID
        if (url.includes("watch?v=")) {
            return url.replace("watch?v=", "embed/");
        }
        // Nếu là link rút gọn (youtu.be/ID) -> Chuyển thành youtube.com/embed/ID
        if (url.includes("youtu.be/")) {
            return url.replace("youtu.be/", "youtube.com/embed/");
        }
        return url; // Nếu đã là link embed hoặc link khác thì giữ nguyên
    };

    // Dữ liệu Steps
    const steps = [
        {
            id: "data",
            title: "1. English Learner Behavior Data",
            icon: <Database size={20} />,
            desc: "Thu thập dữ liệu Big Data từ lịch sử học tập: thời gian phản hồi, số lần quên, kết quả bài kiểm tra.",
            detailedDesc: "Hệ thống thu thập dữ liệu hành vi học tập từ người dùng, bao gồm: thời gian phản hồi cho mỗi từ vựng, số lần quên/lần nhớ, kết quả bài kiểm tra, tần suất học tập, và thời gian học mỗi phiên. Dữ liệu được xử lý real-time và lưu trữ trong cơ sở dữ liệu NoSQL để phân tích nâng cao.",
            position: { x: 50, y: 150 },
            chartData: [100, 80, 60, 25, 20, 0],
            analyticsData: [0, 25, 10, 10, 20, 10, 15, 56, 25],
            stats: ["2,500+ data points", "Real-time tracking", "Multi-dimensional analysis"],
            media: {
                image: behaviorDataImg,
                code: `// Sample data collection code
const collectLearningData = (userId, wordId, response) => {
    return {
        userId,
        wordId,
        responseTime: response.time,
        correct: response.correct,
        timestamp: Date.now(),
        difficulty: calculateDifficulty(wordId),
        sessionId: getCurrentSession()
    };
};`,
                // 3. CẬP NHẬT VIDEO LIÊN QUAN (Big Data in Education)
                video: "https://www.youtube.com/watch?v=_AHtsFE9UDM"
            }
        },
        {
            id: "ssa",
            title: "2. SSA Hyperparameter Optimization",
            icon: <Activity size={20} />,
            desc: "Sparrow Search Algorithm (SSA) tìm kiếm các tham số tốt nhất để cấu hình cho mạng LSTM.",
            detailedDesc: "Thuật toán SSA (Sparrow Search Algorithm) được áp dụng để tối ưu hóa 9 hyperparameters chính của mô hình LSTM: learning rate, dropout rate, số units trong mỗi layer, batch size, và các tham số regularization. SSA sử dụng cơ chế tìm kiếm toàn cục dựa trên hành vi của chim sẻ để tránh bị mắc kẹt ở cực trị địa phương.",
            position: { x: 280, y: 50 },
            optimizationData: [0, 2, 3, 2, 4, 6, 5, 9, 10],
            stats: ["9 hyperparameters", "Global optimization", "Fast convergence"],
            media: {
                image: behaviorDataImg,
                code: `# SSA Algorithm Implementation
def sparrow_search_algorithm(population, iterations):
    best_solution = None
    for i in range(iterations):
        for sparrow in population:
            # Exploration phase
            if random() < 0.5:
                sparrow.position = explore(sparrow)
            # Exploitation phase  
            else:
                sparrow.position = exploit(sparrow, best_solution)
            
            # Update best solution
            if fitness(sparrow) > fitness(best_solution):
                best_solution = sparrow
    return best_solution`,
                video: "https://www.youtube.com/watch?v=TNrCbOFwPmU"
            }
        },
        {
            id: "lstm",
            title: "3. SSA-LSTM Model",
            icon: <Brain size={20} />,
            desc: "Mô hình LSTM được tối ưu hóa bởi SSA, phân tích và dự đoán khả năng ghi nhớ trong tương lai.",
            detailedDesc: "Mô hình LSTM (Long Short-Term Memory) với kiến trúc 3 layers được tối ưu hóa bởi SSA. Mô hình xử lý chuỗi thời gian của dữ liệu học tập, học các pattern quên/nhớ của từng người dùng. Với các gates (input, forget, output), LSTM có thể nhớ thông tin dài hạn và bỏ qua thông tin không quan trọng, tối ưu cho việc dự đoán thời điểm quên từ vựng.",
            position: { x: 280, y: 150 },
            improvement: "+38%",
            stats: ["Time-series analysis", "Memory patterns", "Adaptive learning"],
            media: {
                image: SSALSTMImg,
                code: `# LSTM Model with SSA-optimized parameters
class SSALSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size, 
            hidden_size,  # SSA optimized: 128
            num_layers,   # SSA optimized: 3
            batch_first=True,
            dropout=0.2   # SSA optimized dropout
        )
        self.fc = nn.Linear(hidden_size, 1)
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        return torch.sigmoid(self.fc(lstm_out[:, -1, :]))`,
                video: "https://www.youtube.com/embed/YCzL96nL7j0"
            }
        },
        {
            id: "output",
            title: "4. Improved Prediction & Generalization",
            icon: <Map size={20} />,
            desc: "Kết quả là lộ trình học tập được cá nhân hóa với độ chính xác và khả năng tổng quát hóa được cải thiện.",
            detailedDesc: "Hệ thống tạo ra lộ trình học tập cá nhân hóa cho từng người dùng với độ chính xác 92%. Dựa trên dự đoán của mô hình SSA-LSTM, hệ thống đề xuất thời điểm tối ưu để ôn tập từng từ vựng, đảm bảo ghi nhớ lâu dài với effort tối thiểu. Khả năng tổng quát hóa được cải thiện 38% so với mô hình LSTM truyền thống.",
            position: { x: 500, y: 150 },
            accuracy: "92%",
            stats: ["Personalized roadmap", "Higher accuracy", "Better generalization"],
            media: {
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800",
                code: `// Generate personalized learning path
function generateLearningPath(userId, predictions) {
    const path = [];
    predictions.forEach((word, index) => {
        const optimalTime = calculateOptimalReviewTime(
            word.difficulty,
            word.memoryStrength,
            user.learningPattern
        );
        path.push({
            wordId: word.id,
            reviewTime: optimalTime,
            confidence: word.confidence
        });
    });
    return optimizeSchedule(path);
}`,
                video: "https://www.youtube.com/watch?v=wAM19axO3IM"
            }
        }
    ];

    // Hàm vẽ biểu đồ đơn giản
    const renderMiniChart = (data: number[] | undefined, type: 'line' | 'bar' = 'line', width = 40, height = 20) => {
        if (!data || data.length === 0) {
            return (
                <svg width={width} height={height} className="opacity-50">
                    <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="8" fill="currentColor">
                        No data
                    </text>
                </svg>
            );
        }

        const maxValue = Math.max(...data);
        if (maxValue === 0) return null;

        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - (value / maxValue) * height;
            return `${x},${y}`;
        }).join(' ');

        if (type === 'line') {
            return (
                <svg width={width} height={height} className="opacity-80">
                    <polyline
                        points={points}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-blue-500"
                    />
                    {data.map((_, i) => (
                        <circle
                            key={i}
                            cx={(i / (data.length - 1)) * width}
                            cy={height - (data[i] / maxValue) * height}
                            r="1"
                            fill="currentColor"
                            className="text-blue-500"
                        />
                    ))}
                </svg>
            );
        } else {
            return (
                <svg width={width} height={height} className="opacity-80">
                    {data.map((value, index) => {
                        const barWidth = Math.max(1, width / data.length - 1);
                        const barHeight = (value / maxValue) * height;
                        return (
                            <rect
                                key={index}
                                x={index * (barWidth + 1)}
                                y={height - barHeight}
                                width={barWidth}
                                height={barHeight}
                                fill="currentColor"
                                className="text-green-500"
                            />
                        );
                    })}
                </svg>
            );
        }
    };

    // Hàm toggle step
    const toggleStep = (stepId: string) => {
        if (activeStep === stepId) {
            setActiveStep("");
        } else {
            setActiveStep(stepId);
        }
    };

    // Lấy step hiện tại đang active
    const currentStep = steps.find(step => step.id === activeStep);

    return (
        <div className="relative bg-linear-to-br from-gray-900 to-indigo-950 p-4 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="flex flex-col gap-6">
                {/* --- TIÊU ĐỀ --- */}
                <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        <Settings className="text-indigo-400 animate-spin-slow" />
                        Cơ chế hoạt động SSA-LSTM
                        <Info className="text-blue-400" size={20} />
                    </h3>
                    <p className="text-gray-300 text-sm">
                        Click vào các khối trong sơ đồ hoặc các mục dưới đây để xem chi tiết
                    </p>
                </div>

                {/* --- PHẦN 1: SƠ ĐỒ SVG LỚN --- */}
                <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 relative overflow-hidden min-h-[380px] flex items-center justify-center p-4">
                    <svg viewBox="0 0 900 450" className="w-full h-full max-w-4xl select-none">
                        {/* Background Grid Pattern */}
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(75, 85, 99, 0.3)" strokeWidth="1" />
                            </pattern>
                            <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto">
                                <polygon points="0 0, 12 4, 0 8" fill="#60a5fa" />
                            </marker>
                            <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
                            </linearGradient>
                            <linearGradient id="ssaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#db2777" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#be185d" stopOpacity="0.9" />
                            </linearGradient>
                            <linearGradient id="lstmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.9" />
                            </linearGradient>
                            <linearGradient id="outputGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                            </linearGradient>
                        </defs>

                        {/* Grid Background */}
                        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.2" />

                        {/* Các đường nối */}
                        <line x1="210" y1="310" x2="375" y2="310" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#arrowhead)">
                            <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                        </line>

                        <line x1="500" y1="150" x2="500" y2="245" stroke="#f472b6" strokeWidth="3" strokeDasharray="5,5" markerEnd="url(#arrowhead)">
                            <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
                        </line>

                        <line x1="620" y1="310" x2="755" y2="310" stroke="#34d399" strokeWidth="3" markerEnd="url(#arrowhead)">
                            <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                        </line>

                        {/* DATA BLOCK */}
                        <g
                            onClick={() => toggleStep("data")}
                            className="cursor-pointer hover:opacity-90 transition-all duration-300 group"
                        >
                            <rect
                                x="10" y="250" width="200" height="120" rx="15"
                                fill="url(#dataGradient)"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                className="transition-all duration-300 group-hover:stroke-blue-400 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                                filter="drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))"
                            />

                            <foreignObject x="35" y="260" width="40" height="40">
                                <div className="text-white">
                                    <Database size={40} />
                                </div>
                            </foreignObject>
                            <text x="85" y="280" textAnchor="start" fontSize="14" fill="#dbeafe" fontWeight="bold">
                                English Learner
                            </text>
                            <text x="85" y="300" textAnchor="start" fontSize="14" fill="#dbeafe" fontWeight="bold">
                                Behavior Data
                            </text>

                            <foreignObject x="35" y="310" width="50" height="30">
                                <div className="text-blue-400">
                                    {renderMiniChart(steps[0].chartData, 'line', 50, 30)}
                                </div>
                            </foreignObject>
                            <foreignObject x="95" y="310" width="50" height="30">
                                <div className="text-green-400">
                                    {renderMiniChart(steps[0].analyticsData, 'bar', 50, 30)}
                                </div>
                            </foreignObject>

                            <text x="125" y="360" textAnchor="middle" fontSize="12" fill="#93c5fd" fontWeight="bold">
                                Data Analytics
                            </text>
                        </g>

                        {/* SSA BLOCK */}
                        <g
                            onClick={() => toggleStep("ssa")}
                            className="cursor-pointer hover:opacity-90 transition-all duration-300 group"
                        >
                            <circle
                                cx="500" cy="80" r="70"
                                fill="url(#ssaGradient)"
                                stroke="#db2777"
                                strokeWidth="3"
                                className="transition-all duration-300 group-hover:stroke-pink-400 group-hover:shadow-[0_0_30px_rgba(219,39,119,0.6)]"
                                filter="drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))"
                            />

                            <foreignObject x="470" y="50" width="65" height="40">
                                <div className="text-white text-center">
                                    <div className="font-bold text-xl">SSA</div>
                                    <div className="text-sm mt-[-5px]">Algorithm</div>
                                </div>
                            </foreignObject>

                            <text x="590" y="85" textAnchor="start" fontSize="14" fill="#fbcfe8" fontWeight="bold">
                                Hyperparameter Optimization
                            </text>

                            <foreignObject x="460" y="90" width="100" height="40">
                                <div className="text-pink-300">
                                    {renderMiniChart(steps[1].optimizationData, 'line', 100, 35)}
                                </div>
                            </foreignObject>
                        </g>

                        {/* SSA-LSTM MODEL BLOCK */}
                        <g
                            onClick={() => toggleStep("lstm")}
                            className="cursor-pointer hover:opacity-90 transition-all duration-300 group"
                        >
                            <rect
                                x="380" y="250" width="240" height="120" rx="18"
                                fill="url(#lstmGradient)"
                                stroke="#8b5cf6"
                                strokeWidth="4"
                                className="transition-all duration-300 group-hover:stroke-purple-400 group-hover:shadow-[0_0_35px_rgba(139,92,246,0.7)]"
                                filter="drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5))"
                            />

                            <foreignObject x="400" y="260" width="40" height="40">
                                <div className="text-white">
                                    <Brain size={40} />
                                </div>
                            </foreignObject>

                            <text x="450" y="275" textAnchor="start" fontSize="16" fill="#ede9fe" fontWeight="bold">
                                SSA-LSTM
                            </text>
                            <text x="450" y="295" textAnchor="start" fontSize="14" fill="#ede9fe">
                                Model
                            </text>

                            <rect x="400" y="310" width="50" height="25" rx="6" fill="#10b981" />
                            <text x="425" y="327" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
                                +38%
                            </text>

                            <text x="400" y="350" textAnchor="start" fontSize="13" fill="#c4b5fd" fontWeight="bold">
                                Improved Accuracy & Efficiency
                            </text>
                        </g>

                        {/* OUTPUT BLOCK */}
                        <g
                            onClick={() => toggleStep("output")}
                            className="cursor-pointer hover:opacity-90 transition-all duration-300 group"
                        >
                            <rect
                                x="760" y="250" width="140" height="150" rx="15"
                                fill="url(#outputGradient)"
                                stroke="#10b981"
                                strokeWidth="3"
                                className="transition-all duration-300 group-hover:stroke-emerald-400 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                                filter="drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))"
                            />

                            <foreignObject x="770" y="265" width="40" height="40">
                                <div className="text-white">
                                    <TrendingUp size={40} />
                                </div>
                            </foreignObject>

                            <text x="820" y="280" textAnchor="start" fontSize="14" fill="#d1fae5" fontWeight="bold">
                                Improved
                            </text>
                            <text x="820" y="300" textAnchor="start" fontSize="14" fill="#d1fae5" fontWeight="bold">
                                Prediction
                            </text>

                            <circle cx="830" cy="350" r="35" fill="rgba(255,255,255,0.1)" stroke="#34d399" strokeWidth="3" />
                            <text x="830" y="350" textAnchor="middle" fontSize="16" fill="#34d399" fontWeight="bold">
                                92%
                            </text>
                            <text x="830" y="365" textAnchor="middle" fontSize="11" fill="#a7f3d0">
                                Accuracy
                            </text>
                        </g>
                    </svg>

                    <div className="absolute bottom-3 right-3 text-xs text-gray-300 italic flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span>Click vào các khối để xem chi tiết</span>
                    </div>
                </div>

                {/* --- PHẦN 2: ACCORDION DETAILS --- */}
                <div className="bg-linear-to-r from-gray-800/70 to-gray-900/70 rounded-2xl border border-gray-700 p-5">
                    <h4 className="text-white font-bold mb-5 flex items-center gap-3 text-xl">
                        <Settings className="text-indigo-400 animate-spin-slow" />
                        Chi tiết quy trình SSA-LSTM
                        <span className="text-sm text-gray-400 font-normal ml-auto">
                            {activeStep ? `Đang xem: ${currentStep?.title}` : "Chọn một bước để xem chi tiết"}
                        </span>
                    </h4>

                    {/* 4 DÒNG ACCORDION */}
                    <div className="space-y-3">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`rounded-xl border transition-all duration-300 overflow-hidden
                                    ${activeStep === step.id
                                        ? "bg-linear-to-br from-gray-800 to-gray-900 border-indigo-500 shadow-lg"
                                        : "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                                    }`}
                            >
                                <div
                                    onClick={() => toggleStep(step.id)}
                                    className="p-4 cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${activeStep === step.id
                                            ? "bg-linear-to-br from-indigo-600 to-purple-600 text-white shadow-md"
                                            : "bg-gray-700 text-gray-300"
                                            }`}>
                                            {step.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className={`font-bold text-lg ${activeStep === step.id ? "text-white" : "text-gray-200"}`}>
                                                {step.title}
                                            </h5>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {step.stats?.map((stat, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 bg-gray-700/50 rounded text-gray-300">
                                                        {stat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-indigo-400">
                                        {activeStep === step.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {activeStep === step.id && (
                                    <div className="px-4 pb-4 pt-0 animate-fadeIn">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                                <div className="mb-3">
                                                    <h6 className="text-lg font-bold text-white mb-2">📋 Mô tả chi tiết</h6>
                                                    <p className="text-gray-300 leading-relaxed text-sm">
                                                        {step.detailedDesc || step.desc}
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    {step.id === "data" && (
                                                        <>
                                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                                <span>Dữ liệu được thu thập real-time từ 2,500+ users</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                <span>Xử lý với tốc độ 10,000 records/giây</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {step.id === "ssa" && (
                                                        <>
                                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                                                                <span>Tối ưu hóa 9 hyperparameters quan trọng</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                                <span>Giảm 40% thời gian training so với grid search</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {step.id === "lstm" && (
                                                        <>
                                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                                <span>Kiến trúc 3 layers với 128 units mỗi layer</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                <span>Cải thiện 38% hiệu suất so với LSTM baseline</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {step.id === "output" && (
                                                        <>
                                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                <span>Độ chính xác dự đoán: 92% (cao hơn 15% so với phương pháp truyền thống)</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                                <span>Personalized learning path cho từng user</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h6 className="text-lg font-bold text-white mb-2">🎨 Tài nguyên minh họa</h6>

                                                <div className="flex border-b border-gray-700 mb-3">
                                                    <button
                                                        onClick={() => setActiveMediaTab("image")}
                                                        className={`px-3 py-1.5 font-medium flex items-center gap-1.5 text-sm ${activeMediaTab === "image"
                                                            ? "text-blue-400 border-b-2 border-blue-400"
                                                            : "text-gray-400 hover:text-gray-300"
                                                            }`}
                                                    >
                                                        <ImageIcon size={14} /> Ảnh
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveMediaTab("code")}
                                                        className={`px-3 py-1.5 font-medium flex items-center gap-1.5 text-sm ${activeMediaTab === "code"
                                                            ? "text-green-400 border-b-2 border-green-400"
                                                            : "text-gray-400 hover:text-gray-300"
                                                            }`}
                                                    >
                                                        <Code size={14} /> Code
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveMediaTab("video")}
                                                        className={`px-3 py-1.5 font-medium flex items-center gap-1.5 text-sm ${activeMediaTab === "video"
                                                            ? "text-red-400 border-b-2 border-red-400"
                                                            : "text-gray-400 hover:text-gray-300"
                                                            }`}
                                                    >
                                                        <Video size={14} /> Video
                                                    </button>
                                                </div>

                                                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                                                    {activeMediaTab === "image" && (
                                                        <div>
                                                            <div className="aspect-video bg-gray-800 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                                                                <img
                                                                    src={step.media?.image}
                                                                    alt={step.title}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = "https://via.placeholder.com/800x450/1f2937/6b7280?text=Demo+Image";
                                                                    }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-400 text-center">
                                                                Hình ảnh minh họa cho {step.title.toLowerCase()}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {activeMediaTab === "code" && (
                                                        <div>
                                                            <div className="bg-gray-950 rounded-lg p-3 overflow-x-auto max-h-40">
                                                                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                                                                    <code>{step.media?.code}</code>
                                                                </pre>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Code sample cho {step.title.toLowerCase()}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {activeMediaTab === "video" && (
                                                        <div>
                                                            <div className="aspect-video bg-gray-800 rounded-lg mb-2 overflow-hidden">
                                                                <iframe
                                                                    src={getEmbedUrl(step.media?.video)}
                                                                    title={step.title}
                                                                    className="w-full h-full"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                ></iframe>
                                                            </div>
                                                            <p className="text-xs text-gray-400 text-center">
                                                                Video giải thích {step.title.toLowerCase()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Thông tin tổng kết */}
                    <div className="mt-5 p-3 bg-gray-800/40 rounded-xl border border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                                <div className="p-1.5 rounded-lg bg-blue-900/50">
                                    <Activity className="text-blue-400" size={16} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-300">Processing Speed</div>
                                    <div className="text-base font-bold text-white">Real-time</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                                <div className="p-1.5 rounded-lg bg-purple-900/50">
                                    <Brain className="text-purple-400" size={16} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-300">Model Accuracy</div>
                                    <div className="text-base font-bold text-white">92% ↑</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                                <div className="p-1.5 rounded-lg bg-emerald-900/50">
                                    <TrendingUp className="text-emerald-400" size={16} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-300">Performance Gain</div>
                                    <div className="text-base font-bold text-white">+38%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SSALSTMDiagram;