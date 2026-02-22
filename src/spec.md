# Specification

## Summary
**Goal:** Add comprehensive diagnostic logging throughout the authentication and authorization flow to identify why admin features are not displaying for the authenticated principal.

**Planned changes:**
- Add extensive console logging to backend main.mo showing admin HashSet initialization, contents, and every isCallerAdmin() call with caller principal and comparison result
- Add detailed logging to frontend useIsAdmin hook showing query execution, actor state, raw backend response, and any errors
- Add console logging to AdminDashboard component showing mount events, isAdmin value, loading state, and UI rendering decisions
- Add console logging to Layout component showing authentication state, isAdmin value, and navigation menu item visibility
- Verify and add logging to backend migration.mo to confirm admin principals are preserved during canister upgrades

**User-visible outcome:** Developer can view comprehensive console logs in both frontend and backend to diagnose why the admin principal is not seeing admin features, enabling identification and resolution of the authorization issue.
