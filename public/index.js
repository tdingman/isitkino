document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('searchForm');
  const toggleVotes = document.getElementById('toggleVotes');
  const myVotes = document.getElementById('myVotes');

  // Set initial state
  myVotes.style.display = 'none';

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const expression = this.elements.q.value.toLowerCase().trim();
    window.location.href = `/results?q=${encodeURIComponent(expression)}`;
  });

  toggleVotes.addEventListener('click', function() {
    if (myVotes.style.display === 'none') {
      displayVotes();
      myVotes.style.display = 'block';
      toggleVotes.textContent = 'Hide My Votes';
    } else {
      myVotes.style.display = 'none';
      toggleVotes.textContent = 'Show My Votes';
    }
  });

  function toTitleCase(str) {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  function displayVotes() {
    const votes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('voted_')) {
        votes.push(key.replace('voted_', ''));
      }
    }

    if (votes.length === 0) {
      myVotes.innerHTML = '<p>You haven\'t voted on any expressions yet.</p>';
    } else {
      const voteItems = votes.map(vote => `
        <li>
          <a href="/results?q=${encodeURIComponent(vote)}">${toTitleCase(vote)}</a>
        </li>
      `).join('');

      myVotes.innerHTML = `
        <h3>Expressions you've voted on:</h3>
        <ul>${voteItems}</ul>
      `;
    }
  }

  // Add this new function to fetch and display the leaderboard
  async function displayLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      const leaderboardData = await response.json();
      
      // Sort by total votes descending
      leaderboardData.sort((a, b) => (b.kinoVotes + b.notKinoVotes) - (a.kinoVotes + a.notKinoVotes));
      
      const leaderboardContent = document.getElementById('leaderboardContent');
      leaderboardContent.innerHTML = leaderboardData.slice(0, 10).map((item, index) => {
        const totalVotes = item.kinoVotes + item.notKinoVotes;
        const kinoPercentage = Math.round((item.kinoVotes / totalVotes) * 100);

        let verdict = kinoPercentage > 50 ? 'Yes' : (kinoPercentage < 50 ? 'No' : 'Maybe');
        let verdictColor = kinoPercentage > 50 ? '#2ecc71' : (kinoPercentage < 50 ? '#e74c3c' : '#808080');

        return `
          <div class="leaderboard-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="flex: 1;">${index + 1}. ${toTitleCase(item.expression)}</span>
            <div style="display: flex; flex-direction: column; align-items: center; width: 100px;">
              <span style="color: ${verdictColor}; margin-bottom: 2px;">${verdict}</span>
              <div class="bar-visualization" style="width: 100%; background: linear-gradient(to right, #2ecc71 ${kinoPercentage}%, #e74c3c ${kinoPercentage}%); height: 10px;"></div>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      document.getElementById('leaderboardContent').innerHTML = '<p>Error loading leaderboard. Please try again later.</p>';
    }
  }

  // Call displayLeaderboard at the end of the DOMContentLoaded event
  displayLeaderboard();
});