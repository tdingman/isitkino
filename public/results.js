document.addEventListener('DOMContentLoaded', function() {
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
        const phraseElement = document.getElementById('phrase');
        if (phraseElement) {
            phraseElement.textContent = `Expression: "${phrase}"`;
        }

        const docRef = db.collection('phrases').doc(currentPhrase);
        try {
            console.log('Attempting to get document');
            const doc = await docRef.get();
            console.log('Document retrieved:', doc);
            if (doc.exists) {
                showResults(doc.data());
            } else {
                showVoting();
            }
        } catch (error) {
            console.error("Error getting document:", error);
            console.error("Error details:", error.code, error.message);
        }
    }

    function showVoting() {
        const votingElement = document.getElementById('voting');
        const resultsElement = document.getElementById('results');
        if (votingElement) votingElement.style.display = 'block';
        if (resultsElement) resultsElement.innerHTML = '';
    }

    window.vote = async function(isKino) {
        if (!currentPhrase) return;

        const docRef = db.collection('phrases').doc(currentPhrase);

        if (localStorage.getItem(`voted_${currentPhrase}`)) {
            alert("You've already voted for this expression!");
            return;
        }

        try {
            await docRef.set({
                phrase: currentPhrase,
                kinoVotes: firebase.firestore.FieldValue.increment(isKino ? 1 : 0),
                notKinoVotes: firebase.firestore.FieldValue.increment(isKino ? 0 : 1),
            }, { merge: true });

            localStorage.setItem(`voted_${currentPhrase}`, 'true');

            const updatedDoc = await docRef.get();
            showResults(updatedDoc.data());
        } catch (error) {
            console.error("Error voting:", error);
        }
    }

    function showResults(data) {
        const totalVotes = data.kinoVotes + data.notKinoVotes;
        const kinoPercentage = (data.kinoVotes / totalVotes * 100).toFixed(2);
        const notKinoPercentage = (data.notKinoVotes / totalVotes * 100).toFixed(2);

        const votingElement = document.getElementById('voting');
        const resultsElement = document.getElementById('results');
        
        if (votingElement) votingElement.style.display = 'none';
        if (resultsElement) {
            resultsElement.innerHTML = `
                <h2>Results for "${data.phrase}"</h2>
                <p>Kino: ${data.kinoVotes} votes (${kinoPercentage}%)</p>
                <p>Not Kino: ${data.notKinoVotes} votes (${notKinoPercentage}%)</p>
                <p>Total votes: ${totalVotes}</p>
            `;
        }
    }

    checkKino();
});