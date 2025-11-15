const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./database-supabase');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Helper function to generate unique tournament code
function generateTournamentCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============ AUTH ROUTES ============

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password, displayName } = req.body;

  if (!username || !email || !password || !displayName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query(
      'INSERT INTO users (username, email, password, display_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, displayName],
      (err, result) => {
        if (err) {
          if (err.message.includes('UNIQUE') || err.code === '23505') {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }
        res.json({ 
          success: true, 
          userId: result.rows[0].id,
          username,
          displayName
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Sign In
app.post('/api/auth/signin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.query('SELECT * FROM users WHERE username = $1', [username], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = result.rows[0];

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Update Password
app.post('/api/auth/update-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  db.query('SELECT * FROM users WHERE id = $1', [userId], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];

    try {
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating password' });
        }
        res.json({ success: true });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// ============ USER ROUTES ============

// Get User Profile
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params;

  db.query('SELECT id, username, display_name, email FROM users WHERE id = $1', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  });
});

// Update Display Name
app.put('/api/users/:userId/display-name', (req, res) => {
  const { userId } = req.params;
  const { displayName } = req.body;

  if (!displayName) {
    return res.status(400).json({ error: 'Display name is required' });
  }

  db.query('UPDATE users SET display_name = $1 WHERE id = $2', [displayName, userId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating display name' });
    }
    res.json({ success: true, displayName });
  });
});

// ============ TOURNAMENT ROUTES ============

// Create Tournament
app.post('/api/tournaments', (req, res) => {
  const { name, description, startDate, roundRepeats, scoreSubmissionRule, creatorId } = req.body;

  let code = generateTournamentCode();
  
  // Check if code already exists and generate new one if needed
  const insertTournament = () => {
    db.query(
      `INSERT INTO tournaments (name, description, start_date, round_repeats, code, creator_id, score_submission_rule) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name, description, startDate, roundRepeats, code, creatorId, scoreSubmissionRule],
      (err, result) => {
        if (err) {
          if (err.code === '23505') { // Unique constraint violation
            code = generateTournamentCode();
            insertTournament();
          } else {
            return res.status(500).json({ error: 'Error creating tournament' });
          }
        } else {
          const tournamentId = result.rows[0].id;
          
          // Add creator as head admin
          db.query(
            'INSERT INTO tournament_admins (tournament_id, user_id, is_head_admin) VALUES ($1, $2, $3)',
            [tournamentId, creatorId, true],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error setting admin' });
              }
              res.json({ success: true, tournamentId, code });
            }
          );
        }
      }
    );
  };

  insertTournament();
});

// Get Tournament by Code
app.get('/api/tournaments/code/:code', (req, res) => {
  const { code } = req.params;

  db.query(
    `SELECT t.*, u.display_name as creator_name 
     FROM tournaments t 
     JOIN users u ON t.creator_id = u.id 
     WHERE t.code = $1`,
    [code],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tournament not found' });
      }
      res.json(result.rows[0]);
    }
  );
});

// Get Tournament Details
app.get('/api/tournaments/:tournamentId', (req, res) => {
  const { tournamentId } = req.params;

  db.query(
    `SELECT t.*, u.display_name as creator_name 
     FROM tournaments t 
     JOIN users u ON t.creator_id = u.id 
     WHERE t.id = $1`,
    [tournamentId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tournament not found' });
      }
      res.json(result.rows[0]);
    }
  );
});

// Request to Join Tournament
app.post('/api/tournaments/:tournamentId/join', (req, res) => {
  const { tournamentId } = req.params;
  const { userId } = req.body;

  db.query(
    'INSERT INTO participants (tournament_id, user_id, status) VALUES ($1, $2, $3)',
    [tournamentId, userId, 'pending'],
    (err, result) => {
      if (err) {
        if (err.code === '23505') { // Unique constraint violation
          return res.status(400).json({ error: 'Already requested to join' });
        }
        return res.status(500).json({ error: 'Error joining tournament' });
      }
      res.json({ success: true });
    }
  );
});

// Get User's Tournaments
app.get('/api/users/:userId/tournaments', (req, res) => {
  const { userId } = req.params;

  db.query(
    `SELECT DISTINCT t.*, p.status as participation_status, p.eliminated,
     (SELECT COUNT(*) FROM participants WHERE tournament_id = t.id AND status = 'approved') as participant_count
     FROM tournaments t
     LEFT JOIN participants p ON t.id = p.tournament_id AND p.user_id = $1
     LEFT JOIN tournament_admins ta ON t.id = ta.tournament_id AND ta.user_id = $1
     WHERE p.user_id = $1 OR ta.user_id = $1
     ORDER BY t.created_at DESC`,
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(result.rows);
    }
  );
});

// Get Pending Join Requests
app.get('/api/tournaments/:tournamentId/pending-requests', (req, res) => {
  const { tournamentId } = req.params;

  db.query(
    `SELECT p.id, p.user_id, p.joined_at, u.display_name, u.username
     FROM participants p
     JOIN users u ON p.user_id = u.id
     WHERE p.tournament_id = $1 AND p.status = 'pending'
     ORDER BY p.joined_at ASC`,
    [tournamentId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(result.rows);
    }
  );
});

// Approve/Deny Join Request
app.put('/api/tournaments/:tournamentId/requests/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'approve' or 'deny'

  const newStatus = action === 'approve' ? 'approved' : 'denied';

  db.query(
    'UPDATE participants SET status = $1 WHERE id = $2',
    [newStatus, requestId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating request' });
      }
      res.json({ success: true });
    }
  );
});

// Get Tournament Participants
app.get('/api/tournaments/:tournamentId/participants', (req, res) => {
  const { tournamentId } = req.params;

  db.query(
    `SELECT p.*, u.display_name, u.username,
     (SELECT COUNT(*) FROM matches WHERE tournament_id = $1 AND winner_id = p.user_id AND status = 'completed') as wins,
     (SELECT COUNT(*) FROM matches WHERE tournament_id = $1 AND (player1_id = p.user_id OR player2_id = p.user_id) AND winner_id != p.user_id AND status = 'completed' AND winner_id IS NOT NULL) as losses
     FROM participants p
     JOIN users u ON p.user_id = u.id
     WHERE p.tournament_id = $1 AND p.status = 'approved'
     ORDER BY wins DESC, losses ASC`,
    [tournamentId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(result.rows);
    }
  );
});

// Check if User is Admin
app.get('/api/tournaments/:tournamentId/is-admin/:userId', (req, res) => {
  const { tournamentId, userId } = req.params;

  db.query(
    'SELECT * FROM tournament_admins WHERE tournament_id = $1 AND user_id = $2',
    [tournamentId, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json({ 
        isAdmin: result.rows.length > 0,
        isHeadAdmin: result.rows.length > 0 ? result.rows[0].is_head_admin : false
      });
    }
  );
});

// Promote User to Admin
app.post('/api/tournaments/:tournamentId/admins', (req, res) => {
  const { tournamentId } = req.params;
  const { userId } = req.body;

  db.query(
    'INSERT INTO tournament_admins (tournament_id, user_id, is_head_admin) VALUES ($1, $2, $3)',
    [tournamentId, userId, false],
    (err, result) => {
      if (err) {
        if (err.code === '23505') { // Unique constraint violation
          return res.status(400).json({ error: 'User is already an admin' });
        }
        return res.status(500).json({ error: 'Error promoting user' });
      }
      res.json({ success: true });
    }
  );
});

// Start Tournament (Generate Matches)
app.post('/api/tournaments/:tournamentId/start', (req, res) => {
  const { tournamentId } = req.params;

  // Get tournament details
  db.query('SELECT * FROM tournaments WHERE id = $1', [tournamentId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    const tournament = result.rows[0];

    // Get approved participants
    db.query(
      'SELECT user_id FROM participants WHERE tournament_id = $1 AND status = $2',
      [tournamentId, 'approved'],
      (err, participantsResult) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching participants' });
        }

        const participants = participantsResult.rows;
        if (participants.length < 2) {
          return res.status(400).json({ error: 'Need at least 2 participants' });
        }

        // Generate round-robin matches
        const players = participants.map(p => p.user_id);
        const matches = [];
        let roundNumber = 1;

        for (let repeat = 0; repeat < tournament.round_repeats; repeat++) {
          for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
              matches.push({
                player1: players[i],
                player2: players[j],
                round: roundNumber
              });
              
              // Group matches into rounds (each player plays once per round)
              if (matches.filter(m => m.round === roundNumber).length >= Math.floor(players.length / 2)) {
                roundNumber++;
              }
            }
          }
        }

        // Insert matches into database
        const insertMatch = (match, callback) => {
          db.query(
            'INSERT INTO matches (tournament_id, player1_id, player2_id, round_number, status) VALUES ($1, $2, $3, $4, $5)',
            [tournamentId, match.player1, match.player2, match.round, 'scheduled'],
            callback
          );
        };

        // Insert all matches
        let insertedCount = 0;
        const totalMatches = matches.length;

        matches.forEach(match => {
          insertMatch(match, (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error creating matches' });
            }
            
            insertedCount++;
            if (insertedCount === totalMatches) {
              // All matches inserted, update tournament status
              db.query(
                'UPDATE tournaments SET status = $1 WHERE id = $2',
                ['active', tournamentId],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Error updating tournament' });
                  }
                  res.json({ success: true, matchCount: matches.length });
                }
              );
            }
          });
        });
      }
    );
  });
});

// Get Tournament Matches
app.get('/api/tournaments/:tournamentId/matches', (req, res) => {
  const { tournamentId } = req.params;

  db.query(
    `SELECT m.*,
     u1.display_name as player1_name, u2.display_name as player2_name,
     u1.username as player1_username, u2.username as player2_username,
     p1.eliminated as player1_eliminated, p2.eliminated as player2_eliminated
     FROM matches m
     JOIN users u1 ON m.player1_id = u1.id
     JOIN users u2 ON m.player2_id = u2.id
     LEFT JOIN participants p1 ON m.player1_id = p1.user_id AND m.tournament_id = p1.tournament_id
     LEFT JOIN participants p2 ON m.player2_id = p2.user_id AND m.tournament_id = p2.tournament_id
     WHERE m.tournament_id = $1
     ORDER BY m.round_number ASC, m.id ASC`,
    [tournamentId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(result.rows);
    }
  );
});

// Update Match Score
app.put('/api/matches/:matchId/score', (req, res) => {
  const { matchId } = req.params;
  const { player1Score, player2Score } = req.body;

  let winner = null;
  let status = 'completed';

  if (player1Score > player2Score) {
    db.query('SELECT player1_id FROM matches WHERE id = $1', [matchId], (err, result) => {
      if (result.rows.length > 0) winner = result.rows[0].player1_id;
      updateMatch();
    });
  } else if (player2Score > player1Score) {
    db.query('SELECT player2_id FROM matches WHERE id = $1', [matchId], (err, result) => {
      if (result.rows.length > 0) winner = result.rows[0].player2_id;
      updateMatch();
    });
  } else {
    updateMatch();
  }

  function updateMatch() {
    db.query(
      'UPDATE matches SET player1_score = $1, player2_score = $2, winner_id = $3, status = $4 WHERE id = $5',
      [player1Score, player2Score, winner, status, matchId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating match' });
        }
        res.json({ success: true });
      }
    );
  }
});

// Update Round Date
app.put('/api/tournaments/:tournamentId/rounds/:roundNumber/date', (req, res) => {
  const { tournamentId, roundNumber } = req.params;
  const { date } = req.body;

  db.query(
    'UPDATE matches SET round_date = $1 WHERE tournament_id = $2 AND round_number = $3',
    [date, tournamentId, roundNumber],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating round date' });
      }
      res.json({ success: true });
    }
  );
});

// Eliminate Player
app.put('/api/tournaments/:tournamentId/participants/:userId/eliminate', (req, res) => {
  const { tournamentId, userId } = req.params;

  // Mark player as eliminated
  db.query(
    'UPDATE participants SET eliminated = $1 WHERE tournament_id = $2 AND user_id = $3',
    [true, tournamentId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error eliminating player' });
      }

      // Forfeit all unplayed matches
      db.query(
        `UPDATE matches 
         SET status = $1, 
             winner_id = CASE 
               WHEN player1_id = $2 THEN player2_id 
               WHEN player2_id = $2 THEN player1_id 
             END
         WHERE tournament_id = $3 
         AND (player1_id = $2 OR player2_id = $2) 
         AND status = $4`,
        ['forfeited', userId, tournamentId, 'scheduled'],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error forfeiting matches' });
          }
          res.json({ success: true });
        }
      );
    }
  );
});

// Replace Player
app.put('/api/tournaments/:tournamentId/participants/:oldUserId/replace', (req, res) => {
  const { tournamentId, oldUserId } = req.params;
  const { newUserId } = req.body;

  // Update participant record
  db.query(
    'UPDATE participants SET user_id = $1 WHERE tournament_id = $2 AND user_id = $3',
    [newUserId, tournamentId, oldUserId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error replacing player' });
      }

      // Update all matches
      db.query(
        `UPDATE matches 
         SET player1_id = CASE WHEN player1_id = $1 THEN $2 ELSE player1_id END,
             player2_id = CASE WHEN player2_id = $1 THEN $2 ELSE player2_id END,
             winner_id = CASE WHEN winner_id = $1 THEN $2 ELSE winner_id END
         WHERE tournament_id = $3 AND (player1_id = $1 OR player2_id = $1)`,
        [oldUserId, newUserId, tournamentId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating matches' });
          }
          res.json({ success: true });
        }
      );
    }
  );
});

// Search Users (for replacing players)
app.get('/api/users/search/:query', (req, res) => {
  const { query } = req.params;

  db.query(
    'SELECT id, username, display_name FROM users WHERE username LIKE $1 OR display_name LIKE $1 LIMIT 10',
    [`%${query}%`],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(result.rows);
    }
  );
});

// Serve frontend files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
