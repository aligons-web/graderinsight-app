---
name: Portal and desktop boundary
description: The durable product boundary between the GraderInsight web portal and local desktop grader.
---

The web app is only an account, subscription, downloads, onboarding, and rubric-template portal. Assignment imports, student data, AI grading, result review, and report generation belong exclusively in the local desktop app.

**Why:** Student work must remain on the educator's computer; duplicating grading workflows in the web app conflicts with the product architecture and privacy model.

**How to apply:** Reject or redesign web features that upload, store, grade, or analyze student submissions. Web features may manage reusable rubric templates and downloadable desktop resources.

The existing subscription-protected Anonymizer download is temporary. A later migration will adapt that subscription handling for the batch-grading desktop app and remove the legacy `anonymizer.zip` asset.

**Why:** The Anonymizer handler is being preserved only to avoid prematurely breaking existing functionality; it is not the intended long-term downloadable product.

**How to apply:** Do not remove or repurpose the legacy handler until that later migration is explicitly requested. When it is, preserve subscription and expiration checks while switching the downloadable product.