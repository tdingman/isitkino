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
          <a href="/results?q=${encodeURIComponent(vote)}">${vote}</a>
        </li>
      `).join('');

      myVotes.innerHTML = `
        <h3>Expressions you've voted on:</h3>
        <ul>${voteItems}</ul>
      `;
    }
  }
});