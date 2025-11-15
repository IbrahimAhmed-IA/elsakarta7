# Quick Start Guide

## Installation (Choose one method)

### Method 1: Automatic Setup

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Method 2: Manual Setup

```bash
npm install
npm start
```

## First Time Use

### 1. Start the Application

```bash
npm start
```

Open your browser to: **http://localhost:3000**

### 2. Create Your First Account

- Click "Sign Up"
- Fill in:
  - Username (unique)
  - Display Name (can change later)
  - Email
  - Password
- Click "Create Account"

### 3. Sign In

- Enter your username and password
- Click "Sign In"

---

## For Tournament Admins

### Create a Tournament

1. Click **"Create Tournament"** in the navigation
2. Fill in tournament details:
   - **Name**: e.g., "Spring 2025 Championship"
   - **Description**: Optional details about the tournament
   - **Start Date**: When the tournament begins
   - **Round-Robin Repeats**: How many times players face each other (1x, 2x, or 3x)
   - **Score Submission**: Choose who can submit scores
3. Click **"Create Tournament"**
4. **Save the tournament code** (e.g., "K4F8N") - share this with players!

### Manage Your Tournament

1. Go to your tournament page
2. Click **"Manage Tournament"** button
3. From the admin panel you can:
   - **Approve/Deny** join requests
   - **Eliminate** players
   - **Replace** players
   - **Promote** participants to admin

### Start the Tournament

1. Once you have approved enough players
2. Click **"Start Tournament"** on the tournament page
3. All matches will be automatically generated
4. You can now submit scores and manage rounds

---

## For Players

### Join a Tournament

1. Get a **tournament code** from the admin
2. Click **"Find Tournament"** in the navigation
3. Enter the tournament code
4. Click **"Search Tournament"**
5. Review the tournament details
6. Click **"Request to Join Tournament"**
7. Wait for admin approval

### View Your Tournaments

1. Go to **"Dashboard"** to see all your tournaments
2. Click on any tournament to view:
   - Current standings
   - Match schedule
   - Your upcoming matches

### Submit Scores (if allowed)

1. Go to the tournament page
2. Find your match in the schedule
3. Enter scores for both players
4. Click **"Submit"**
5. Standings will update automatically

---

## Common Tasks

### Change Your Display Name

1. Click **"Profile"** in the navigation
2. Update your display name
3. Click **"Update Display Name"**

### Change Your Password

1. Click **"Profile"** in the navigation
2. Fill in:
   - Current password
   - New password
   - Confirm new password
3. Click **"Update Password"**

### View Tournament Standings

- Navigate to any tournament page
- Standings show:
  - Player rank (🥇🥈🥉 for top 3)
  - Wins and losses
  - Win rate percentage
  - Active/eliminated status

### Edit Round Dates (Admin Only)

1. On the tournament page
2. Find the round you want to edit
3. Click on the date picker
4. Select a new date
5. Date updates automatically

---

## Troubleshooting

### Can't Sign In

- Check username and password are correct
- Passwords are case-sensitive
- Use "Forgot Password" if needed

### Tournament Not Found

- Double-check the tournament code
- Codes are case-insensitive
- Make sure you have the complete code (usually 6 characters)

### Can't Submit Score

- Check if you have permission (admin-only tournaments)
- Make sure the tournament has started
- Verify you're not trying to score a completed match

### Server Won't Start

- Make sure port 3000 is not already in use
- Run `npm install` again
- Check that Node.js is installed correctly

---

## Tips & Best Practices

### For Admins

- ✓ Share the tournament code before the start date
- ✓ Approve join requests promptly
- ✓ Set round dates to help players schedule
- ✓ Promote trusted participants to co-admin for help
- ✓ Use meaningful tournament names and descriptions

### For Players

- ✓ Join tournaments before the start date
- ✓ Check the schedule regularly for your matches
- ✓ Submit scores promptly after matches
- ✓ Keep your display name professional

---

## Need Help?

- Check the **README.md** for detailed documentation
- Review the code comments for technical details
- All features are documented in the main README

---

**Enjoy your tournaments! 🏆**
