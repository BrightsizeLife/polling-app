# Claude Code Project Guide - Daily Task Manager

## 🔧 Development Philosophy

### Small Batches Rule
- **One feature per branch** - Never mix multiple changes
- **Commit every 15-30 minutes** - Small, frequent saves
- **Test before moving on** - Make sure each piece works
- **Merge quickly** - Don't let branches live too long

### Branch Strategy
```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/google-oauth-setup
# Work on ONLY Google OAuth setup

# When done:
git add .
git commit -m "feat: add Google OAuth configuration"
git push origin feature/google-oauth-setup
# Create PR, merge, delete branch
```

## 📚 Learning Mode ON
Since Derek is learning the codebase:

### Heavy Comments Required
```javascript
// ❌ Bad - no explanation
const user = auth.currentUser;

// ✅ Good - explains what's happening
// Get the currently logged-in user from Firebase Auth
// This will be null if no one is signed in
const user = auth.currentUser;
```

### "Explain Like I'm 10" Summaries
After every code change, provide:
1. **What we just did** (in simple terms)
2. **Why we did it** (the purpose)
3. **How it fits** (connection to bigger picture)
4. **Code snippet** with annotations

Example:
> **What we just did:** We added a button that says "Sign in with Google"
> **Why:** So users can log in using their Google account instead of creating a new password
> **How it fits:** This is step 1 of our fancy new sign-in system
> ```jsx
> <button onClick={signInWithGoogle}>
>   🔑 Sign in with Google  {/* The button users click */}
> </button>
> ```

## 🚀 Modern DevOps Workflow (Vercel + GitHub)

### Production Deployment Pipeline
```
GitHub Push → Vercel Build → Automatic Deploy → Live URL
├── TypeScript compilation
├── ESLint validation  
├── Automatic preview URLs for PRs
└── Zero-downtime production deploys
```

### Branch Strategy with CI/CD
```bash
# Feature development
git checkout -b feature/new-feature
# Work and commit changes
git push origin feature/new-feature
# Vercel automatically creates preview URL

# Production deployment
git checkout main
git merge feature/new-feature
git push origin main
# Vercel automatically deploys to production
```

### Environment Management
- **Production:** main branch → production domain
- **Preview:** feature branches → temporary preview URLs
- **Local:** localhost development with hot reload

### Infrastructure Stack
- **Hosting:** Vercel (TypeScript-optimized)
- **Database:** Supabase (PostgreSQL with real-time)
- **Authentication:** Firebase Auth (keep existing code)
- **Monitoring:** Vercel Analytics + Sentry
- **Domain:** Custom domain with automatic SSL

## 🔥 Firebase Commands Reference

### Local Development
```bash
# Start local Vite development server
npm run dev
# Usually runs on http://localhost:5173

# Build for production testing
npm run build

# Preview production build locally
npm run preview
```

### Preview Deployments (Testing)
```bash
# Create preview channel with unique URL
firebase hosting:channel:deploy CHANNEL_NAME

# Examples:
firebase hosting:channel:deploy feature-auth
firebase hosting:channel:deploy testing-v2
firebase hosting:channel:deploy demo-client

# List all preview channels
firebase hosting:channel:list

# Delete a preview channel
firebase hosting:channel:delete CHANNEL_NAME
```

### Production Deployment
```bash
# Deploy to live site
firebase deploy

# Deploy only hosting (faster)
firebase deploy --only hosting

# Deploy with custom message
firebase deploy -m "Added Google OAuth authentication"
```

### Authentication Preview URLs
Firebase creates unique URLs for each preview:
- Format: `https://PROJECT_ID--CHANNEL_NAME-RANDOM_HASH.web.app`
- Each preview has its own auth domain
- Perfect for testing auth flows safely

## 📁 Project Structure Guide

```
daily-task-manager/
├── claude.md              # This guide - Claude Code reference
├── src/                   # Source code (React components, utilities)
├── public/                # Static assets
├── vite.config.js         # Vite build configuration
├── vite.config.ts         # TypeScript Vite config
├── firebase.json          # Firebase hosting configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # Code linting rules
└── index.html             # Main HTML entry point
```

### Key Files Claude Should Know About:
- `src/` - All React components and utilities live here
- `firebase.json` - Firebase hosting and deployment config
- `vite.config.js/ts` - Build tool configuration (hot reload, etc.)
- `package.json` - Check this for existing dependencies
- `index.html` - Main entry point (Vite serves this)

### Derek's Preferences:
- **Heavy comments** on all new code
- **Small, frequent commits** every 15-30 minutes
- **Mobile-first responsive design**
- **Accessibility** considerations for all components
- **Error handling** for all user interactions
```bash
# Undo last commit (if not pushed)
git reset --soft HEAD~1

# Switch back to main if stuck
git checkout main

# Delete a problematic branch
git branch -D branch-name

# See what changed
git status
git diff
```

## 🎯 Plan-Review-Execute Workflow

### Development Process
Instead of jumping straight into implementation:

1. **Plan Request:** Give Claude Code your requirements
2. **Plan Proposal:** Claude Code provides detailed implementation plan
3. **Plan Review:** You approve, modify, or reject the plan
4. **Execute:** Claude Code implements the approved plan

### Plan Format Requirements
Claude Code should provide:
- **Scope:** What files will be changed
- **Technical approach:** Key implementation decisions
- **Testing strategy:** How to verify the changes work
- **Rollback plan:** How to revert if something breaks
- **Time estimate:** Rough complexity assessment

### Example Workflow
```
You: "Fix mobile zoom issue on task input"

Claude: "PLAN PROPOSAL:
- Add viewport meta tag with user-scalable=no
- Update CSS for input elements with font-size 16px minimum
- Test on iOS Safari and Android Chrome
- Rollback: Remove meta tag if desktop UX suffers
- Estimated: 15-20 minutes implementation"

You: "Approved, but skip user-scalable=no - just fix font size"

Claude: "Executing modified plan..."
```

This prevents misunderstandings and reduces token waste on incorrect implementations.

### When Starting a New Session
Always give Claude context by sharing:

```
Hi Claude! Here's what's happening:

WHAT I JUST FINISHED:
- Completed Google OAuth setup in Batch 1
- Added firebase Google provider configuration
- Created googleSignIn() function that works

WHAT WENT RIGHT:
- Authentication works in console testing
- No errors in Firebase configuration
- All commits successful

WHAT WENT WRONG:
- Button styling looks weird on mobile
- Getting a warning about async/await in console
- Preview deployment took longer than expected

WHAT I NEED HELP WITH NOW:
- Starting Batch 2: Create the actual Google sign-in button
- Fix that async/await warning
- Make sure the button is mobile-responsive

CURRENT BRANCH: feature/google-signin-button
LAST COMMIT: "feat: add Google OAuth provider configuration"
```

### During Development
Keep Claude updated:
- **Share error messages** - copy/paste the full error
- **Describe weird behavior** - "the button works but looks broken"
- **Ask for explanations** - "I don't understand this useEffect hook"
- **Request examples** - "show me how this pattern works in other places"

### When Things Break
```
HELP! Something broke:

ERROR MESSAGE: [paste the full error]
WHAT I WAS DOING: Adding the Google button component
WHAT I EXPECTED: Button appears and opens Google login
WHAT ACTUALLY HAPPENED: Page goes blank, console shows error
FILES I TOUCHED: GoogleSignInButton.jsx, auth.js

Please help me debug this step by step.
```

## 💡 Pro Tips for Derek
1. **Read error messages carefully** - they're usually helpful
2. **Use browser dev tools** - F12 is your friend
3. **Test in private/incognito** - avoids cached login issues
4. **Ask Claude to explain ANY confusing code**
5. **Take breaks** - complex auth flows can be mentally taxing
6. **Always give Claude context** - the more details, the better help
7. **Share your screen mentally** - describe what you see

---
*Remember: Small steps, frequent commits, heavy comments, always give Claude context about what's working/broken!*