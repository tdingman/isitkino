// Initialize Firebase (replace with your own config)
const firebaseConfig = {
    // Your Firebase configuration object
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
let currentPhrase = '';

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function checkKino() {
    const phrase = getQueryParam('q');
    if (!phrase) return;

    currentPhrase = phrase.toLowerCase();
    document.getElementById('phrase').textContent = `Phrase: "${phrase}"`;

    const docRef = db.collection('phrases').doc(currentPhrase);
    const doc = await docRef.get();

    if (doc.exists) {
        showResults(doc.data());
    } else {
        showVoting()
    }
}

function showVoting() {
    document.getElementById('voting').style.display = 'block';
    document.getElementById('results').innerHTML = '';
}

async function vote(isKino) {
    if (!currentPhrase) return;

    const docRef = db.collection('phrases').doc(currentPhrase);

    // Check if the user has already voted
    if (localStorage.getItem(`voted_${currentPhrase}`)) {
      alert("You've already voted for this phrase!");
      return;
    }

    await docRef.set({
        phrase: currentPhrase,
        kinoVotes: firebase.firestore.FieldValue.increment(isKino ? 1 : 0),
        notKinoVotes: firebase.firestore.FieldValue.increment(isKino ? 0 : 1),
    }, { merge: true });

    // Mark as voted in localStorage
    localStorage.setItem(`voted_${currentPhrase}`, 'true');

    const updatedDoc = await docRef.get();
    showResults(updatedDoc.data());
}

function showResults(data) {
    const totalVotes = data.kinoVotes + data.notKinoVotes;
    const kinoPercentage = (data.kinoVotes / totalVotes * 100).toFixed(2);
    const notKinoPercentage = (data.notKinoVotes / totalVotes * 100).toFixed(2);

    document.getElementById('voting').style.display = 'none';
    document.getElementById('results').innerHTML = `
        <h2>Results for "${data.phrase}"</h2>
        <p>Kino: ${data.kinoVotes} votes (${kinoPercentage}%)</p>
        <p>Not Kino: ${data.notKinoVotes} votes (${notKinoPercentage}%)</p>
        <p>Total votes: ${totalVotes}</p>
    `;
}

// Check for a phrase in the URL when the page loads
window.onload = checkKino;