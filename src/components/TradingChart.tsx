import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Scatter,
    ReferenceLine,
    Area
} from 'recharts';

// --- TYPES ---

export interface RecallHistoryPoint {
    timestamp: number;
    pRecall: number;
    correct: boolean;
}

interface FormattedDataPoint extends RecallHistoryPoint {
    index: number;
}

interface TradingChartProps {
    data: RecallHistoryPoint[];
    xDomain: [number, number];
    yDomain: [number, number];
    onDomainChange: (x: [number, number], y: [number, number]) => void;
    onReset: () => void;
}

// Custom Tooltip với style Light Mode chuyên nghiệp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, formattedData }: any) => {
    if (active && payload && payload.length) {
        const index = Math.round(label as number);
        const dataPoint = formattedData[index];
        if (!dataPoint) return null;

        const date = new Date(dataPoint.timestamp);
        return (
            <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-xl text-xs font-mono backdrop-blur-md bg-opacity-95 ring-1 ring-gray-100 z-50">
                <div className="text-gray-700 mb-2 border-b border-gray-200 pb-1 flex justify-between gap-4">
                    <span>{date.toLocaleDateString('vi-VN')}</span>
                    <span className="text-gray-500">{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between gap-6 mb-1">
                    <span className="text-gray-500">XÁC SUẤT NHỚ</span>
                    <span className="text-indigo-600 font-bold">{(dataPoint.pRecall * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between gap-6">
                    <span className="text-gray-500">KẾT QUẢ</span>
                    <span className={dataPoint.correct ? 'text-green-600' : 'text-red-500'}>
                        {dataPoint.correct ? 'ĐÚNG ✓' : 'SAI ✗'}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

// --- MAIN COMPONENT ---

const TradingChart: React.FC<TradingChartProps> = ({ data, xDomain, yDomain, onDomainChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    const ZOOM_SPEED = 0.1;

    // Transform data to add index field and sort by timestamp
    const formattedData = useMemo(() => {
        const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
        return sorted.map((point, index) => ({
            ...point,
            index
        })) as FormattedDataPoint[];
    }, [data]);

    // Chuyển đổi tọa độ pixel (chuột) thành tọa độ dữ liệu (Index/PRecall)
    const pixelToData = useCallback((x: number, y: number) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();

        // Margin phải khớp với margin của ComposedChart bên dưới
        const padding = { left: 10, right: 10, top: 80, bottom: 60 };

        const chartWidth = rect.width - padding.left - padding.right;
        const chartHeight = rect.height - padding.top - padding.bottom;

        const relX = (x - padding.left) / chartWidth;
        const relY = 1 - (y - padding.top) / chartHeight;

        const dataX = xDomain[0] + relX * (xDomain[1] - xDomain[0]);
        const dataY = yDomain[0] + relY * (yDomain[1] - yDomain[0]);

        return { x: dataX, y: Math.max(0, Math.min(1, dataY)) };
    }, [xDomain, yDomain]);

    // Xử lý Zoom bằng lăn chuột (index-based)
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = containerRef.current!.getBoundingClientRect();
        const pivot = pixelToData(e.clientX - rect.left, e.clientY - rect.top);

        // Zoom direction: scroll down = zoom out, scroll up = zoom in
        const zoomDelta = e.deltaY > 0 ? ZOOM_SPEED : -ZOOM_SPEED;
        const currentRange = xDomain[1] - xDomain[0];
        const newRange = currentRange * (1 + zoomDelta);

        // Clamp to valid index range
        const minIndex = -0.5;
        const maxIndex = formattedData.length > 0 ? formattedData.length - 0.5 : 5;

        // Calculate new domain centered on pivot point
        const halfRange = newRange / 2;
        let newMin = pivot.x - halfRange;
        let newMax = pivot.x + halfRange;

        // Adjust if out of bounds
        if (newMin < minIndex) {
            newMin = minIndex;
            newMax = Math.min(maxIndex, minIndex + newRange);
        } else if (newMax > maxIndex) {
            newMax = maxIndex;
            newMin = Math.max(minIndex, maxIndex - newRange);
        }

        const newX: [number, number] = [newMin, newMax];
        const newY: [number, number] = [
            Math.max(0, pivot.y - (pivot.y - yDomain[0]) * (1 + zoomDelta)),
            Math.min(1, pivot.y + (yDomain[1] - pivot.y) * (1 + zoomDelta))
        ];

        onDomainChange(newX, newY);
    };

    // Bắt đầu kéo chuột
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left mouse button
        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setDragStart({ x, y });
        setDragEnd({ x, y });
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
            setIsSelecting(true);
        } else {
            setIsPanning(true);
        }
    };

    // Di chuyển chuột
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });
        if (!dragStart) return;
        setDragEnd({ x, y });

        if (isPanning) {
            const startData = pixelToData(dragStart.x, dragStart.y);
            const currentData = pixelToData(x, y);
            const dx = startData.x - currentData.x;
            const dy = startData.y - currentData.y;

            // Bounds for index domain
            const minIndex = -0.5;
            const maxIndex = formattedData.length > 0 ? formattedData.length - 0.5 : 5;
            const range = xDomain[1] - xDomain[0];

            let newXMin = xDomain[0] + dx;
            let newXMax = xDomain[1] + dx;

            // Clamp to valid index range
            if (newXMin < minIndex) {
                newXMin = minIndex;
                newXMax = minIndex + range;
            } else if (newXMax > maxIndex) {
                newXMax = maxIndex;
                newXMin = maxIndex - range;
            }

            onDomainChange(
                [newXMin, newXMax],
                [Math.max(0, yDomain[0] + dy), Math.min(1, yDomain[1] + dy)]
            );
            setDragStart({ x, y }); // Update start position for smooth panning
        }
    };

    // Thả chuột
    const handleMouseUp = () => {
        if (isSelecting && dragStart && dragEnd && Math.abs(dragStart.x - dragEnd.x) > 10) {
            const p1 = pixelToData(Math.min(dragStart.x, dragEnd.x), Math.max(dragStart.y, dragEnd.y));
            const p2 = pixelToData(Math.max(dragStart.x, dragEnd.x), Math.min(dragStart.y, dragEnd.y));

            // Ensure selection bounds are valid for indices
            const minIndex = -0.5;
            const maxIndex = formattedData.length > 0 ? formattedData.length - 0.5 : 5;
            const newXMin = Math.max(minIndex, Math.min(p1.x, p2.x));
            const newXMax = Math.min(maxIndex, Math.max(p1.x, p2.x));

            // Ensure minimum range
            if (newXMax - newXMin < 0.1) {
                const center = (newXMin + newXMax) / 2;
                onDomainChange([center - 0.5, center + 0.5], [p1.y, p2.y]);
            } else {
                onDomainChange([newXMin, newXMax], [p1.y, p2.y]);
            }
        }
        setIsPanning(false);
        setIsSelecting(false);
        setDragStart(null);
        setDragEnd(null);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-white rounded-xl overflow-hidden border border-gray-200 group select-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { handleMouseUp(); setMousePos(null); }}
            onContextMenu={(e) => e.preventDefault()}
            style={{
                cursor: isSelecting ? 'crosshair' : isPanning ? 'grabbing' : 'grab',
                overscrollBehavior: 'contain'
            }}
        >
            {/* Crosshair Lines (Hiệu ứng chữ thập khi di chuột) */}
            {mousePos && !isPanning && (
                <>
                    <div className="absolute top-0 bottom-0 border-l border-gray-300 border-dashed pointer-events-none z-0" style={{ left: mousePos.x }} />
                    <div className="absolute left-0 right-0 border-t border-gray-300 border-dashed pointer-events-none z-0" style={{ top: mousePos.y }} />
                </>
            )}

            {/* Selection Box (Vùng chọn khi giữ Shift) */}
            {isSelecting && dragStart && dragEnd && (
                <div
                    className="absolute border-2 border-indigo-500 bg-indigo-100 bg-opacity-30 pointer-events-none z-50"
                    style={{
                        left: Math.min(dragStart.x, dragEnd.x),
                        top: Math.min(dragStart.y, dragEnd.y),
                        width: Math.abs(dragEnd.x - dragStart.x),
                        height: Math.abs(dragEnd.y - dragStart.y),
                    }}
                />
            )}

            {/* Watermark/Logo */}
            <div className="absolute top-4 left-6 z-10 pointer-events-none">
                <div className="flex items-center gap-3">
                    <span className="text-gray-800 font-bold text-lg tracking-tight">Biểu đồ P-Recall</span>
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-[9px] font-bold border border-indigo-200">LIVE</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formattedData} margin={{ top: 80, right: 10, left: 10, bottom: 60 }}>
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" />

                    <XAxis
                        dataKey="index"
                        type="number"
                        domain={xDomain}
                        tickFormatter={(index) => {
                            const idx = Math.round(index);
                            const dataPoint = formattedData[idx];
                            if (!dataPoint) return '';
                            const date = new Date(dataPoint.timestamp);
                            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                        }}
                        stroke="#9ca3af"
                        tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'system-ui' }}
                        allowDataOverflow
                    />

                    <YAxis
                        domain={yDomain}
                        orientation="right"
                        tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                        stroke="#9ca3af"
                        tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'system-ui' }}
                        allowDataOverflow
                    />

                    <Tooltip
                        content={<CustomTooltip formattedData={formattedData} />}
                        cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        isAnimationActive={false}
                    />

                    <Area type="monotone" dataKey="pRecall" stroke="none" fill="url(#lineGradient)" />
                    <Line
                        type="monotone"
                        dataKey="pRecall"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    />

                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Scatter dataKey="pRecall" shape={(props: any) => {
                        const { cx, cy, payload } = props;
                        const color = payload.correct ? '#10b981' : '#ef4444';
                        return <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1.5} />;
                    }} />

                    <ReferenceLine y={0.5} stroke="#d1d5db" strokeDasharray="3 3" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TradingChart;
