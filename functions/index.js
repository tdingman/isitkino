const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.leaderboard = functions.https.onRequest(async (request, response) => {
  try {
    const db = admin.firestore();
    const expressionsRef = db.collection('expressions');
    const snapshot = await expressionsRef.orderBy('kinoVotes', 'desc').limit(10).get();

    const leaderboardData = snapshot.docs.map(doc => ({
      expression: doc.id,
      kinoVotes: doc.data().kinoVotes || 0,
      notKinoVotes: doc.data().notKinoVotes || 0
    }));

    response.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    response.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
  }
});