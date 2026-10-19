# Security follow-up — 19 October 2026

This is a browser-only demonstration using synthetic data and localStorage role selection. Client-side role gates are demonstration controls, not server authorization. Use a separate authenticated backend and trusted data controls before storing real investigations, personal data or enforcement evidence. CI checks JavaScript syntax without running the demo or image-generation scripts.

The new baseline scans the current checked-out tree, not historical commits. Do not interpret a green check as proof that historical credentials were revoked. No production deployment or provider credential test was performed.

Repository rulesets, required PR checks, secret scanning/push protection, Dependabot alerts, account 2FA, and token/SSH-key hygiene require verification in GitHub settings. These settings were not mutated by this PR. Apply required checks only after their first verified successful run, so existing deployments are not unexpectedly blocked.
