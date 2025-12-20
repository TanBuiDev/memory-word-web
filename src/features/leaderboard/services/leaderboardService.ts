import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import type { LeaderboardUser, TimeFrame } from '../types';

/**
 * Fetches leaderboard data from Firestore
 * Optimized to only fetch top 30 users to minimize read costs
 */
export async function fetchLeaderboard(
    timeFrame: TimeFrame,
    currentUserId?: string
): Promise<{ users: LeaderboardUser[]; currentUserRank?: number; currentUser?: LeaderboardUser }> {
    try {
        const usersRef = collection(db, 'users');
        const xpField = timeFrame === 'weekly' ? 'stats.weeklyXP' : 'stats.totalXP';
        
        // Fetch top 30 users ordered by XP
        const q = query(
            usersRef,
            orderBy(xpField, 'desc'),
            limit(30)
        );

        const querySnapshot = await getDocs(q);
        const users: LeaderboardUser[] = [];
        let currentUserRank: number | undefined;
        let currentUser: LeaderboardUser | undefined;

        querySnapshot.forEach((docSnapshot, index) => {
            const data = docSnapshot.data();
            const user: LeaderboardUser = {
                id: docSnapshot.id,
                displayName: data.displayName || 'Anonymous',
                email: data.email || '',
                photoURL: data.photoURL || undefined,
                stats: {
                    weeklyXP: data.stats?.weeklyXP || 0,
                    totalXP: data.stats?.totalXP || 0,
                    streak: data.stats?.streak || 0,
                    wordsLearned: data.stats?.wordsLearned || 0,
                    lastActive: data.stats?.lastActive || undefined,
                },
                rank: index + 1,
            };

            users.push(user);

            // Check if this is the current user
            if (currentUserId && docSnapshot.id === currentUserId) {
                currentUserRank = index + 1;
                currentUser = user;
            }
        });

        // If current user is not in top 30, fetch their data separately
        if (currentUserId && !currentUser) {
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUserId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const xp = timeFrame === 'weekly' 
                        ? (data.stats?.weeklyXP || 0)
                        : (data.stats?.totalXP || 0);

                    // For rank calculation, we'll estimate based on the last user's XP
                    // In a production app, you might want to use a more sophisticated approach
                    // like maintaining a separate rankings collection or using Cloud Functions
                    const lastUserXP = users.length > 0 
                        ? (timeFrame === 'weekly' ? users[users.length - 1].stats.weeklyXP : users[users.length - 1].stats.totalXP)
                        : 0;
                    
                    // If user's XP is less than the 30th user, they're ranked below 30
                    // We'll set a placeholder rank of 31+ to indicate they're not in top 30
                    currentUserRank = xp >= lastUserXP ? 31 : undefined;

                    currentUser = {
                        id: userDoc.id,
                        displayName: data.displayName || 'Anonymous',
                        email: data.email || '',
                        photoURL: data.photoURL || undefined,
                        stats: {
                            weeklyXP: data.stats?.weeklyXP || 0,
                            totalXP: data.stats?.totalXP || 0,
                            streak: data.stats?.streak || 0,
                            wordsLearned: data.stats?.wordsLearned || 0,
                            lastActive: data.stats?.lastActive || undefined,
                        },
                        rank: currentUserRank || 31,
                    };
                }
            } catch (error) {
                console.error('Error fetching current user data:', error);
            }
        }

        return {
            users,
            currentUserRank,
            currentUser,
        };
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
}

