const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 }, () => {
  console.log('[IPL Mock WS Server] Starting on ws://localhost:8080');
});

// Mock Initial State
let currentMatch = {
  isLive: true,
  teamA: 'MI',
  teamB: 'CSK',
  runs: 132,
  wickets: 3,
  overs: 14.2,
  target: 185,
  battingTeam: 'CSK',
  bowler: 'Jasprit Bumrah',
  batsman: 'MS Dhoni',
  viewers: 142000,
  venue: 'Wankhede Stadium'
};

let orangeCap = {
  playerName: 'MS Dhoni',
  runs: 685,
  year: 2026
};

let purpleCap = {
  playerName: 'Jasprit Bumrah',
  wickets: 27,
  year: 2026
};

let stadiumAverages = {
  'Wankhede Stadium': { avgFirstInningsScore: 184, matchesHosted: 85 },
  'Eden Gardens': { avgFirstInningsScore: 179, matchesHosted: 90 },
  'M. Chinnaswamy Stadium': { avgFirstInningsScore: 191, matchesHosted: 88 }
};

wss.on('connection', (ws) => {
  console.log('[IPL Mock WS Server] Client connected');
  
  // Send initial data to client
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: {
      currentMatch,
      orangeCap,
      purpleCap,
      stadiumUpdates: stadiumAverages
    }
  }));

  // Simulate progress
  const interval = setInterval(() => {
    // 1. Live Match updates
    if (currentMatch.isLive) {
      // Add random runs (0 to 6)
      const runOutcome = [0, 1, 1, 2, 4, 6, 'W'][Math.floor(Math.random() * 7)];
      if (runOutcome === 'W') {
        currentMatch.wickets += 1;
        if (currentMatch.wickets >= 10) {
          currentMatch.isLive = false;
        }
      } else {
        currentMatch.runs += runOutcome;
        // Orange Cap increase
        if (currentMatch.batsman === 'MS Dhoni') {
          orangeCap.runs += runOutcome;
        }
      }

      // Update overs
      let balls = Math.round((currentMatch.overs % 1) * 10);
      balls += 1;
      if (balls >= 6) {
        currentMatch.overs = Math.floor(currentMatch.overs) + 1;
      } else {
        currentMatch.overs = Math.floor(currentMatch.overs) + (balls / 10);
      }

      // Live viewers count change
      currentMatch.viewers += Math.floor((Math.random() - 0.5) * 1000);
      ws.send(JSON.stringify({
        type: 'LIVE_SCORE',
        payload: currentMatch
      }));
    }

    // 2. Randomly send Orange Cap update
    if (Math.random() > 0.7) {
      if (Math.random() > 0.5) {
        orangeCap.runs += Math.floor(Math.random() * 4) + 1;
      }
      ws.send(JSON.stringify({
        type: 'ORANGE_CAP_UPDATE',
        payload: orangeCap
      }));
    }

    // 3. Randomly send Purple Cap update
    if (Math.random() > 0.8) {
      purpleCap.wickets += 1;
      ws.send(JSON.stringify({
        type: 'PURPLE_CAP_UPDATE',
        payload: purpleCap
      }));
    }

    // 4. Randomly send Stadium updates
    if (Math.random() > 0.85) {
      const venues = Object.keys(stadiumAverages);
      const chosenVenue = venues[Math.floor(Math.random() * venues.length)];
      stadiumAverages[chosenVenue].matchesHosted += 1;
      stadiumAverages[chosenVenue].avgFirstInningsScore = Math.round(
        stadiumAverages[chosenVenue].avgFirstInningsScore + (Math.random() - 0.5) * 4
      );
      ws.send(JSON.stringify({
        type: 'STADIUM_UPDATE',
        payload: {
          venue: chosenVenue,
          ...stadiumAverages[chosenVenue]
        }
      }));
    }

    // 5. Randomly send Player STAT_UPDATE leaderboard updates
    if (Math.random() > 0.45) {
      const categories = ['batting', 'bowling', 'all-rounders'];
      const chosenCat = categories[Math.floor(Math.random() * categories.length)];
      
      let playerId = '';
      let playerName = '';
      let delta = {};
      
      if (chosenCat === 'batting') {
        const battingPlayers = [
          { id: 'virat_kohli', name: 'Virat Kohli', runs: 9346 },
          { id: 'sa_yadav', name: 'SA Yadav', runs: 4581 },
          { id: 'shreyas_iyer', name: 'Shreyas Iyer', runs: 4233 },
          { id: 'gautam_gambhir', name: 'Gautam Gambhir', runs: 4217 },
          { id: 'ajinkya_rahane', name: 'Ajinkya Rahane', runs: 4074 }
        ];
        const p = battingPlayers[Math.floor(Math.random() * battingPlayers.length)];
        playerId = p.id;
        playerName = p.name;
        p.runs += Math.floor(Math.random() * 6) + 1;
        delta = {
          runs: p.runs,
          average: parseFloat((p.runs / 200).toFixed(2)),
          strike_rate: parseFloat((130 + Math.random() * 20).toFixed(2))
        };
      } else if (chosenCat === 'bowling') {
        const bowlingPlayers = [
          { id: 'ys_chahal', name: 'YS Chahal', wickets: 233 },
          { id: 'dj_bravo', name: 'DJ Bravo', wickets: 183 },
          { id: 'jj_bumrah', name: 'JJ Bumrah', wickets: 190 },
          { id: 'pp_chawla', name: 'PP Chawla', wickets: 192 },
          { id: 'b_kumar', name: 'B Kumar', wickets: 226 }
        ];
        const p = bowlingPlayers[Math.floor(Math.random() * bowlingPlayers.length)];
        playerId = p.id;
        playerName = p.name;
        p.wickets += 1;
        delta = {
          wickets: p.wickets,
          economy: parseFloat((7.0 + Math.random() * 2).toFixed(2)),
          strike_rate: parseFloat((15.0 + Math.random() * 5).toFixed(2))
        };
      } else {
        const allRounderPlayers = [
          { id: 'shane_watson', name: 'Shane Watson', runs: 3879, wickets: 92 },
          { id: 'kieron_pollard', name: 'Kieron Pollard', runs: 3710, wickets: 84 },
          { id: 'dj_bravo', name: 'DJ Bravo', runs: 1560, wickets: 183 },
          { id: 'ad_russell', name: 'AD Russell', runs: 2655, wickets: 123 },
          { id: 'ar_patel', name: 'AR Patel', runs: 2089, wickets: 139 }
        ];
        const p = allRounderPlayers[Math.floor(Math.random() * allRounderPlayers.length)];
        playerId = p.id;
        playerName = p.name;
        if (Math.random() > 0.5) {
          p.runs += Math.floor(Math.random() * 10) + 1;
        } else {
          p.wickets += 1;
        }
        delta = {
          runs: p.runs,
          wickets: p.wickets,
          score: p.runs + p.wickets * 20
        };
      }

      ws.send(JSON.stringify({
        type: 'STAT_UPDATE',
        payload: {
          panel: chosenCat,
          playerId,
          playerName,
          delta,
          newRank: Math.floor(Math.random() * 3) + 1,
          isLiveMatch: true
        }
      }));
    }

  }, 3000);

  ws.on('close', () => {
    console.log('[IPL Mock WS Server] Client disconnected');
    clearInterval(interval);
  });
});
