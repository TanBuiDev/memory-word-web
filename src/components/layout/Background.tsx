const Background = () => {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:bg-slate-950 transition-colors duration-300">
            {/* 1. Enhanced Grid Pattern */}
            <div className="absolute h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            {/* 2. Animated Gradient Blobs */}
            <div className="absolute left-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-400/20 via-purple-400/15 to-pink-400/10 blur-[120px] animate-pulse-glow"></div>
            <div className="absolute right-0 bottom-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-400/20 via-blue-400/15 to-cyan-400/10 blur-[120px] animate-pulse-glow animation-delay-1000"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10 blur-[100px] animate-pulse-glow animation-delay-500"></div>

            {/* 3. Subtle Overlay for Content Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/60 dark:via-slate-950/40 dark:to-slate-950/60 backdrop-blur-[0.5px]"></div>
        </div>
    );
};

export default Background;