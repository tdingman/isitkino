import { doc, getDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    let currentExpression = '';

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function updateHeader(expression) {
        const headerElement = document.getElementById('dynamicHeader');
        if (headerElement) {
            const titleCaseExpression = expression
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            headerElement.textContent = `Is ${titleCaseExpression} Kino?`;
        }
    }

    async function checkKino() {
        const expression = getQueryParam('q');
        if (!expression) return;

        currentExpression = expression.toLowerCase().trim();

        // Call updateHeader here with the original expression
        updateHeader(expression);

        const docRef = doc(window.db, 'expressions', currentExpression);
        try {
            console.log('Attempting to get document');
            const docSnap = await getDoc(docRef);
            console.log('Document retrieved:', docSnap);
            if (docSnap.exists()) {
                showResults(docSnap.data());
            } else {
                showVoting();
            }
        } catch (error) {
            console.error("Error getting document:", error);
            if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
                console.error("The Firestore emulator is not running. Please start it with 'firebase emulators:start'");
                showError("Firestore emulator is not running. Please start it and try again.");
            } else {
                showError("An error occurred. Please try again later.");
            }
        }
    }

    function showVoting() {
        const votingElement = document.getElementById('voting');
        const resultsElement = document.getElementById('results');
        if (votingElement) votingElement.style.display = 'block';
        if (resultsElement) resultsElement.innerHTML = '';
    }

    window.vote = async function(isKino) {
        if (!currentExpression) return;

        const docRef = doc(window.db, 'expressions', currentExpression);

        if (localStorage.getItem(`voted_${currentExpression}`)) {
            showError("You've already voted for this expression!");
            return;
        }

        try {
            await setDoc(docRef, {
                expression: currentExpression, // Store the lowercase version
                kinoVotes: increment(isKino ? 1 : 0),
                notKinoVotes: increment(isKino ? 0 : 1),
            }, { merge: true });

            localStorage.setItem(`voted_${currentExpression}`, 'true');

            const updatedDocSnap = await getDoc(docRef);
            if (updatedDocSnap.exists()) {
                showResults(updatedDocSnap.data());
            } else {
                showError("An error occurred while retrieving updated results.");
            }
        } catch (error) {
            console.error("Error voting:", error);
            showError("An error occurred while voting. Please try again later.");
        }
    }

    function showResults(data) {
        const totalVotes = data.kinoVotes + data.notKinoVotes;
        const kinoPercentage = Math.round((data.kinoVotes / totalVotes) * 100);
        const notKinoPercentage = 100 - kinoPercentage;

        const isKino = kinoPercentage >= 50;
        const verdict = isKino ? 'Yes' : 'No';
        const verdictColor = isKino ? '#2ecc71' : '#e74c3c';

        const votingElement = document.getElementById('voting');
        const resultsElement = document.getElementById('results');
        
        if (votingElement) votingElement.style.display = 'none';
        if (resultsElement) {
            resultsElement.innerHTML = `
                <h2 style="color: ${verdictColor}; font-size: 2.5em; text-align: center;">${verdict}</h2>
                <div class="bar-visualization" style="background: linear-gradient(to right, #2ecc71 ${kinoPercentage}%, #e74c3c ${kinoPercentage}%); height: 30px; margin: 20px 0;"></div>
                <p><strong>Kino:</strong> ${data.kinoVotes} votes (${kinoPercentage}%)</p>
                <p><strong>Not Kino:</strong> ${data.notKinoVotes} votes (${notKinoPercentage}%)</p>
                <p><strong>Total votes:</strong> ${totalVotes}</p>
            `;
        }
        
        // Add this line to ensure the results are visible
        if (resultsElement) resultsElement.style.display = 'block';
    }

    function showError(message) {
        const votingElement = document.getElementById('voting');
        const resultsElement = document.getElementById('results');
        if (votingElement) votingElement.style.display = 'none';
        if (resultsElement) {
            resultsElement.innerHTML = `<p class="error">${message}</p>`;
        }
    }

    checkKino();
});