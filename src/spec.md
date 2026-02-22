# Specification

## Summary
**Goal:** Fix admin authorization so that the principal 'mhpch-6hb2j-phylo-7bgid-lmdtt-nd4to-wuert-h3mxk-4jz53-6meuu-iqe' is correctly recognized as an admin and can access admin features.

**Planned changes:**
- Debug and fix backend isCallerAdmin() method to properly recognize the admin principal
- Verify useIsAdmin hook correctly queries backend and returns admin status
- Ensure AdminDashboard, MonthlyReportPage, and Layout components display admin features when user is admin
- Add backend logging to track admin authorization checks for debugging

**User-visible outcome:** Admin user can successfully access and view admin navigation links, admin dashboard with employee list, and monthly report page without access denied errors.
