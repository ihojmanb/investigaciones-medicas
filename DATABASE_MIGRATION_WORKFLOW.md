# Database Migration Workflow

## Understanding Supabase Commands

### Key Difference
- `npx supabase db reset` = **LOCAL** database (safe for testing)
- `npx supabase db push` = **REMOTE** database (affects staging/production)

### Command Reference
```bash
# LOCAL DATABASE
npx supabase db reset          # Resets local DB and applies all migrations
npx supabase db start          # Starts local Supabase instance
npx supabase db stop           # Stops local Supabase instance

# REMOTE DATABASE  
npx supabase db push           # Pushes migrations to remote/staging
npx supabase db pull           # Pulls schema from remote to local

# UTILITIES
npx supabase db diff           # Shows pending changes before push
npx supabase db lint           # Checks migrations for errors
```

## Best Practices Workflow

### 1. Feature Branch Development (Recommended)

```bash
# 1. Create feature branch for database changes
git checkout -b feature/fix-table-permissions

# 2. Create your migration file
# Example: supabase/migrations/YYYYMMDD_HHMMSS_description.sql

# 3. TEST LOCALLY FIRST (ALWAYS!)
npx supabase db reset

# 4. Test your application thoroughly
# - Run your app: npm run dev
# - Test the affected functionality
# - Check for any errors in console

# 5. If issues found, fix migration and repeat step 3

# 6. Once satisfied, commit your changes
git add .
git commit -m "Fix: table permissions for user management"

# 7. Merge to develop branch
git checkout develop
git merge feature/fix-table-permissions

# 8. ONLY NOW push to remote
npx supabase db push
```

### 2. Direct Development (Less Safe)

```bash
# 1. Create migration file

# 2. TEST LOCALLY FIRST
npx supabase db reset

# 3. Test application functionality

# 4. If satisfied, push to remote
npx supabase db push

# 5. Commit changes
git add . && git commit -m "Migration: description"
```

## What Went Wrong & How to Avoid

### The Problem
1. Created migration file: `20250927000001_fix_patients_rls.sql`
2. Ran `npx supabase db push` immediately
3. This pushed to **remote** database, not local
4. Local app was still using old policies → permission errors

### Prevention
- **ALWAYS** run `npx supabase db reset` before `npx supabase db push`
- Think of `db reset` as your "test" and `db push` as your "deploy"

## Environment Management

### Local Development
```bash
# Start local Supabase
npx supabase start

# Your app connects to: localhost:54321 (API) and localhost:54322 (DB)
# Dashboard: http://localhost:54323
```

### Remote/Staging
```bash
# Your app connects to: your-project.supabase.co
# Dashboard: https://supabase.com/dashboard/project/your-project
```

### Migration States
- **Local**: Migrations in `supabase/migrations/` applied via `db reset`
- **Remote**: Migrations pushed via `db push`

## Common Scenarios

### Scenario 1: New Migration
```bash
# 1. Create migration file
# 2. npx supabase db reset    # Test locally
# 3. Test app functionality
# 4. npx supabase db push     # Deploy to remote
```

### Scenario 2: Fix Broken Migration
```bash
# 1. Edit migration file
# 2. npx supabase db reset    # Test fix locally
# 3. Test app functionality
# 4. npx supabase db push     # Deploy fix to remote
```

### Scenario 3: Rollback Migration
```bash
# 1. Create new migration that reverts changes
# 2. npx supabase db reset    # Test rollback locally
# 3. npx supabase db push     # Deploy rollback to remote
```

## Branch Strategy

### Recommended Branch Flow
```
main (production-ready)
├── develop (staging)
    ├── feature/user-management
    ├── feature/fix-patients-rls  ← Database changes here
    └── feature/new-reports
```

### Why Use Feature Branches for DB Changes
1. **Isolation**: Database changes don't affect other developers
2. **Testing**: Can test migrations thoroughly before merging
3. **Rollback**: Easy to abandon if migration causes issues
4. **Review**: Team can review database changes before deployment

## Troubleshooting

### Problem: Local and Remote Out of Sync
```bash
# Solution: Reset local to match remote
npx supabase db pull        # Pull remote schema
npx supabase db reset       # Apply to local
```

### Problem: Migration Error on Push
```bash
# Solution: Fix locally first
# 1. Edit migration file
# 2. npx supabase db reset   # Test fix
# 3. npx supabase db push    # Try again
```

### Problem: Need to Undo Remote Migration
```bash
# Solution: Create reversal migration
# 1. Create new migration that undoes changes
# 2. npx supabase db reset   # Test locally
# 3. npx supabase db push    # Deploy reversal
```

## Quick Reference Checklist

### Before Any Database Change
- [ ] Am I on a feature branch?
- [ ] Have I tested locally with `db reset`?
- [ ] Does my app work with the changes?
- [ ] Have I committed my changes?

### Database Migration Steps
1. [ ] Create migration file
2. [ ] `npx supabase db reset` (LOCAL TEST)
3. [ ] Test application functionality
4. [ ] Fix any issues and repeat steps 2-3
5. [ ] `npx supabase db push` (REMOTE DEPLOY)
6. [ ] Commit changes to git

### Emergency Commands
```bash
# Reset everything locally
npx supabase db reset

# See what would be pushed before pushing
npx supabase db diff

# Check migration syntax
npx supabase db lint
```

## Remember
- **Local first, remote second**
- **Test before deploy**
- **Feature branches for safety**
- **Commit after successful deployment**