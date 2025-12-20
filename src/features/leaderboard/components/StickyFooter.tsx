import { Trophy, TrendingUp, User } from 'lucide-react';
import type { LeaderboardUser, TimeFrame } from '../types';

interface StickyFooterProps {
    currentUser?: LeaderboardUser;
    timeFrame: TimeFrame;
}

export default function StickyFooter({ currentUser, timeFrame }: StickyFooterProps) {
    if (!currentUser) return null;

    const xp = timeFrame === 'weekly' 
        ? currentUser.stats.weeklyXP 
        : currentUser.stats.totalXP;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 backdrop-blur-md border-t border-indigo-400/50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    {/* Left: Rank & Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                                {currentUser.photoURL ? (
                                    <img
                                        src={currentUser.photoURL}
                                        alt={currentUser.displayName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-6 w-6 text-white" />
                                )}
                            </div>
                            <div>
                                <div className="text-xs text-white/80 font-medium">Your Rank</div>
                                <div className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Trophy className="h-5 w-5" />
                                    #{currentUser.rank}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Name */}
                    <div className="flex-1 text-center hidden sm:block">
                        <div className="text-sm text-white/90 font-medium">{currentUser.displayName}</div>
                    </div>

                    {/* Right: XP */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-xs text-white/80 font-medium">Total XP</div>
                            <div className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                {xp.toLocaleString()}
                            </div>
                        </div>
                        {currentUser.stats.streak > 0 && (
                            <div className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full border border-white/30">
                                <span className="text-lg">🔥</span>
                                <span className="text-sm font-bold text-white">{currentUser.stats.streak}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

