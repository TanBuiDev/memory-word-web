export type TimeFrame = 'weekly' | 'allTime';

export interface UserStats {
    weeklyXP: number;
    totalXP: number;
    streak: number;
    wordsLearned: number;
    lastActive?: Date | string;
}

export interface LeaderboardUser {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    stats: UserStats;
    rank: number;
}

export interface LeaderboardData {
    users: LeaderboardUser[];
    currentUserRank?: number;
    currentUser?: LeaderboardUser;
}

