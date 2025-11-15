# Round-Robin Tournament Manager

A complete web application for managing round-robin tournaments with distinct user roles, tournament codes, and comprehensive admin controls. Now deployable with Supabase!

## Features

### User Authentication
- Sign up with username, email, and password
- Sign in functionality
- Password reset/change capability
- User profile management with editable display name

### User Roles
- **Player (Default)**: Search for tournaments, join via code, view schedules and standings
- **Admin**: Create tournaments, manage participants, control scoring, and oversee matches
- **Head Admin**: Tournament creator with additional privileges (promote users to admin)

### Tournament Management

#### Admin Features
- Create tournaments with:
  - Custom name and description
  - Start date
  - Round-robin repeat count (1x, 2x, 3x)
  - Unique shareable tournament code
  - Score submission rules (admin-only or player-allowed)
- Approve/deny join requests
- Eliminate players (auto-forfeit remaining matches)
- Replace players mid-tournament
- Promote participants to admin role
- Edit round dates
- Start tournament (auto-generates all matches)

#### Player Features
- Search for tournaments by code
- Request to join tournaments
- View tournament schedules grouped by rounds
- View real-time standings/leaderboard
- Submit scores (if allowed by tournament settings)

### Tournament Display
- Player list with elimination status
- Match schedule grouped by rounds with editable dates
- Standings table with:
  - Rank (with medals for top 3)
  - Wins/Losses
  - Win rate percentage
  - Player status (active/eliminated)
- Real-time updates after score submissions

## Technology Stack

### Backend
- **Node.js** with Express
- **Supabase** PostgreSQL database
- **bcrypt** for password hashing
- **CORS** enabled for API access

### Frontend
- Modern HTML5/CSS3/JavaScript
- Inter font from Google Fonts
- Responsive design (mobile-first)
- Light mode (Player interface) / Dark mode (Admin interface)

### Deployment
- **Supabase** for database hosting
- **Railway**, **Vercel**, or **Render** for application hosting
- Environment-based configuration

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Supabase account

### Quick Deployment

For production deployment, see [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for step-by-step instructions.

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd tournament-manager
   npm install
   ```

2. **Database Setup**
   - Create a Supabase project
   - Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor
   - Copy your connection string from Supabase Settings > Database

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase connection string:
   ```
   SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   NODE_ENV=development
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open your browser and navigate to: `http://localhost:3000`

## Usage Guide

### Getting Started

1. **Create an Account**
   - Navigate to the signup page
   - Enter username, display name, email, and password
   - Sign in with your credentials

2. **As a Player**
   - Go to "Find Tournament" page
   - Enter a tournament code (provided by tournament admin)
   - Request to join and wait for approval
   - View tournament page once approved

3. **As an Admin**
   - Go to "Create Tournament" page
   - Fill in tournament details
   - Share the generated code with players
   - Manage join requests from the admin panel
   - Start tournament when ready to generate matches
   - Update scores and manage participants

### Tournament Workflow

1. **Pre-Tournament**
   - Admin creates tournament
   - Players join using tournament code
   - Admin approves/denies requests
   - Admin can promote trusted participants to co-admins

2. **Tournament Start**
   - Admin clicks "Start Tournament"
   - System auto-generates all round-robin matches
   - Matches are grouped into logical rounds

3. **During Tournament**
   - Admins/Players submit match scores (based on settings)
   - Standings update automatically
   - Admins can eliminate players (forfeits remaining matches)
   - Admins can replace players if needed
   - Round dates can be edited by admins

4. **Viewing Progress**
   - Real-time leaderboard with rankings
   - Match schedule by round
   - Player statistics (wins, losses, win rate)

## Database Schema

### Tables
- **users**: User accounts (username, password, email, display_name)
- **tournaments**: Tournament details (name, description, start_date, code, settings)
- **tournament_admins**: Admin assignments (many-to-many)
- **participants**: Tournament participants (status: pending/approved/denied)
- **matches**: All tournament matches (scores, status, round info)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/update-password` - Update password

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId/display-name` - Update display name
- `GET /api/users/search/:query` - Search users

### Tournaments
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/:tournamentId` - Get tournament details
- `GET /api/tournaments/code/:code` - Find tournament by code
- `POST /api/tournaments/:tournamentId/join` - Request to join
- `POST /api/tournaments/:tournamentId/start` - Start tournament
- `GET /api/tournaments/:tournamentId/participants` - Get participants
- `GET /api/tournaments/:tournamentId/matches` - Get matches
- `PUT /api/tournaments/:tournamentId/participants/:userId/eliminate` - Eliminate player
- `PUT /api/tournaments/:tournamentId/participants/:oldUserId/replace` - Replace player

### Admin
- `GET /api/tournaments/:tournamentId/pending-requests` - Get pending requests
- `PUT /api/tournaments/:tournamentId/requests/:requestId` - Approve/deny request
- `POST /api/tournaments/:tournamentId/admins` - Promote to admin
- `PUT /api/tournaments/:tournamentId/rounds/:roundNumber/date` - Update round date

### Matches
- `PUT /api/matches/:matchId/score` - Submit match score

## Design System

### Colors
- **Primary**: #0066FF (Interactive elements)
- **Success**: #10B981 (Approvals, wins)
- **Warning**: #F59E0B (Pending status)
- **Error**: #EF4444 (Denials, errors)

### Typography
- **Font**: Inter
- **Scales**: 64px (H1), 40px (H2), 24px (H3), 16px (Body), 14px (Small), 12px (Micro)

### Spacing
- 8px, 16px, 24px, 32px, 48px, 64px, 96px (4px grid system)

### Interface Modes
- **Light Mode**: Player interface (clean, spacious)
- **Dark Mode**: Admin interface (focused, high-contrast)

## File Structure

```
/workspace
├── backend/
│   ├── server.js              # Express server & API routes
│   ├── database-supabase.js   # Supabase database setup
│   └── package.json           # Backend dependencies
├── frontend/
│   ├── index.html             # Sign in page
│   ├── signup.html            # Sign up page
│   ├── dashboard.html         # User dashboard
│   ├── profile.html           # User profile
│   ├── create-tournament.html # Create tournament (admin)
│   ├── find-tournament.html   # Find & join tournament
│   ├── tournament.html        # Tournament view (matches, standings)
│   ├── admin-panel.html       # Admin management panel
│   ├── css/
│   │   └── styles.css         # Complete styling
│   └── js/
│       └── auth.js            # Authentication helpers
├── supabase-setup.sql         # Database schema setup
├── .env.example               # Environment variables template
├── vercel.json                # Vercel deployment config
├── package.json               # Main dependencies
└── README.md
```

## Security Notes

- Passwords are hashed using bcrypt (salt rounds: 10)
- No JWT/session tokens (simple database authentication)
- CORS enabled for local development
- Input validation on both client and server side

## Future Enhancements

Potential features to add:
- Email service integration for password reset
- Match notifications
- Tournament brackets/playoffs after round-robin
- Player statistics and history
- Tournament templates
- Export functionality (PDF, CSV)
- Real-time updates using WebSockets
- File uploads for player avatars
- Tournament chat/comments

## Support

For issues or questions, please refer to the code comments or create an issue in the repository.

## Author

**MiniMax Agent**

## License

MIT License - Free to use and modify
