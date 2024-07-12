const leaderboardTable = document.getElementById('leaderboardTable');

// Leaderboard API URL
const LEADERBOARD_API = 'https://script.google.com/macros/s/AKfycbzhvH0_3uk4IGc1Njt0-IyVNtopQqtQfdALrPI-jqiT6WttJkRX_MP2vZNw4nwk6EuL/exec';

function submitLeaderboardScore(name, score) {
    fetch(LEADERBOARD_API, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, score }),
    }).then(() => {
        fetchLeaderboard();
    });
}

function fetchLeaderboard() {
    fetch(LEADERBOARD_API)
        .then(response => response.json())
        .then(data => {
            const rows = data.slice(1, 6); // Get top 5 scores
            leaderboardTable.innerHTML = `
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
            `;
            rows.forEach(row => {
                leaderboardTable.innerHTML += `
                    <tr>
                        <td>${row[0]}</td>
                        <td>${row[1]}</td>
                        <td>${row[2]}</td>
                    </tr>
                `;
            });
        });
}

// Initial leaderboard fetch
fetchLeaderboard();