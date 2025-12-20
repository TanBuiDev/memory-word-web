
import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  Brush,
  ReferenceLine,
  Area
} from 'recharts';
import { RecallHistoryPoint } from '../types';

interface TradingChartProps {
  data: RecallHistoryPoint[];
  xDomain: [number, number];
  yDomain: [number, number];
  onDomainChange: (xDomain: [number, number], yDomain: [number, number]) => void;
  onReset: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(label);
    return (
      <div className="bg-[#1e222d] border border-[#363a45] p-3 rounded shadow-2xl text-xs font-mono">
        <div className="text-[#d1d4dc] mb-2 border-b border-[#363a45] pb-1">
          {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-[#868993]">Probability</span>
          <span className="text-[#2962ff] font-bold">{(data.pRecall * 100).toFixed(2)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#868993]">Outcome</span>
          <span className={data.correct ? 'text-[#089981]' : 'text-[#f23645]'}>
            {data.correct ? 'SUCCESS' : 'FAILED'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const TradingChart: React.FC<TradingChartProps> = ({ data, xDomain, yDomain, onDomainChange, onReset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);

  const formattedData = useMemo(() => {
    return [...data].sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  // Convert pixel coordinates to data values
  const pixelToData = useCallback((x: number, y: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    
    // Estimate chart area margins (matching Recharts default)
    const padding = { left: 10, right: 10, top: 60, bottom: 50 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const relX = (x - padding.left) / chartWidth;
    const relY = 1 - (y - padding.top) / chartHeight; // Y is inverted in pixels

    const dataX = xDomain[0] + relX * (xDomain[1] - xDomain[0]);
    const dataY = yDomain[0] + relY * (yDomain[1] - yDomain[0]);

    return { x: dataX, y: Math.max(0, Math.min(1, dataY)) };
  }, [xDomain, yDomain]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    
    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const pivot = pixelToData(mouseX, mouseY);
    
    const newXDomain: [number, number] = [
      pivot.x - (pivot.x - xDomain[0]) * zoomFactor,
      pivot.x + (xDomain[1] - pivot.x) * zoomFactor
    ];
    
    const newYDomain: [number, number] = [
      Math.max(0, pivot.y - (pivot.y - yDomain[0]) * zoomFactor),
      Math.min(1, pivot.y + (yDomain[1] - pivot.y) * zoomFactor)
    ];

    onDomainChange(newXDomain, newYDomain);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragEnd({ x, y });

    if (isPanning) {
      const startData = pixelToData(dragStart.x, dragStart.y);
      const currentData = pixelToData(x, y);
      
      const dx = startData.x - currentData.x;
      const dy = startData.y - currentData.y;

      onDomainChange(
        [xDomain[0] + dx, xDomain[1] + dx],
        [Math.max(0, yDomain[0] + dy), Math.min(1, yDomain[1] + dy)]
      );
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && dragStart && dragEnd) {
      const p1 = pixelToData(Math.min(dragStart.x, dragEnd.x), Math.max(dragStart.y, dragEnd.y));
      const p2 = pixelToData(Math.max(dragStart.x, dragEnd.x), Math.min(dragStart.y, dragEnd.y));
      
      if (Math.abs(dragStart.x - dragEnd.x) > 5) {
        onDomainChange([p1.x, p2.x], [p1.y, p2.y]);
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
      className="relative w-full h-full bg-[#131722] rounded-xl overflow-hidden border border-[#2a2e39] group select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isSelecting ? 'crosshair' : isPanning ? 'grabbing' : 'crosshair' }}
    >
      {/* Zoom rectangle overlay */}
      {isSelecting && dragStart && dragEnd && (
        <div
          className="absolute border border-[#2962ff] bg-[#2962ff]/10 pointer-events-none z-50"
          style={{
            left: Math.min(dragStart.x, dragEnd.x),
            top: Math.min(dragStart.y, dragEnd.y),
            width: Math.abs(dragEnd.x - dragStart.x),
            height: Math.abs(dragEnd.y - dragStart.y),
          }}
        />
      )}

      {/* Chart Header Info (Floating) */}
      <div className="absolute top-4 left-6 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="text-[#d1d4dc] font-bold text-lg tracking-tight uppercase">Recall Probability</span>
          <span className="bg-[#2a2e39] text-[#2962ff] px-2 py-0.5 rounded text-[10px] font-bold">LIVE</span>
        </div>
        <div className="flex gap-4 mt-1 text-[11px] font-mono">
          <div className="flex gap-1">
            <span className="text-[#868993]">MIN:</span>
            <span className="text-[#f23645] font-semibold">{(Math.min(...data.map(d => d.pRecall)) * 100).toFixed(2)}%</span>
          </div>
          <div className="flex gap-1">
            <span className="text-[#868993]">MAX:</span>
            <span className="text-[#089981] font-semibold">{(Math.max(...data.map(d => d.pRecall)) * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-6 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[10px] text-[#868993] text-right mb-1 font-mono uppercase">Controls</div>
        <div className="flex gap-1">
          <button 
            onClick={onReset}
            className="px-3 h-7 flex items-center justify-center bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc] rounded border border-[#434651] text-[10px] font-bold tracking-widest"
          >
            RESET VIEW
          </button>
        </div>
        <div className="text-[9px] text-[#5d606b] mt-1 text-right">
          Scroll to Zoom • Drag to Pan • Shift+Drag to Select
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={formattedData}
          margin={{ top: 60, right: 10, left: 10, bottom: 50 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2962ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2962ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="0" 
            stroke="#2a2e39" 
            vertical={true} 
            horizontal={true}
          />

          <XAxis
            dataKey="timestamp"
            type="number"
            domain={xDomain}
            tickFormatter={(ts) => {
              const date = new Date(ts);
              return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
            }}
            stroke="#434651"
            tick={{ fill: '#868993', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickLine={{ stroke: '#434651' }}
            axisLine={{ stroke: '#2a2e39' }}
            minTickGap={30}
            allowDataOverflow
          />

          <YAxis
            domain={yDomain}
            orientation="right"
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            stroke="#434651"
            tick={{ fill: '#868993', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickLine={{ stroke: '#434651' }}
            axisLine={{ stroke: '#2a2e39' }}
            allowDataOverflow
          />

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#5d606b', strokeWidth: 1, strokeDasharray: '3 3' }}
            isAnimationActive={false}
          />

          <Area 
            type="monotone" 
            dataKey="pRecall" 
            stroke="none" 
            fillOpacity={1} 
            fill="url(#lineGradient)" 
            isAnimationActive={true}
          />

          <Line
            type="monotone"
            dataKey="pRecall"
            stroke="#2962ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#2962ff', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={true}
          />

          <Scatter
            dataKey="pRecall"
            shape={(props: any) => {
              const { cx, cy, payload } = props;
              const color = payload.correct ? '#089981' : '#f23645';
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={3} 
                  fill={color} 
                  stroke="#131722" 
                  strokeWidth={1} 
                />
              );
            }}
          />

          <ReferenceLine y={0.5} stroke="#363a45" strokeDasharray="3 3" />

          <Brush
            dataKey="timestamp"
            height={30}
            stroke="#2a2e39"
            fill="#1e222d"
            travellerWidth={10}
            tickFormatter={() => ''}
            startIndex={0}
            onChange={(e: any) => {
              if (e && e.startIndex !== undefined) {
                 const startTs = formattedData[e.startIndex]?.timestamp;
                 const endTs = formattedData[e.endIndex]?.timestamp;
                 if (startTs && endTs) onDomainChange([startTs, endTs], yDomain);
              }
            }}
          >
            <ComposedChart data={formattedData}>
              <Area dataKey="pRecall" stroke="none" fill="#2962ff" fillOpacity={0.2} />
            </ComposedChart>
          </Brush>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;
