# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅ Active |
| < 1.0   | ❌ Pre-release |

## Reporting a Vulnerability

We take security seriously at PlanIT.IO. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities.
2. Email us at **security@planit.io** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix development | Within 30 days (critical), 90 days (non-critical) |
| Public disclosure | After fix is deployed |

### What to Expect

- We will acknowledge your report within 48 hours.
- We will provide an initial assessment within 5 business days.
- We will keep you informed of progress toward a fix.
- We will credit you in the security advisory (unless you prefer anonymity).

## Security Practices

- All dependencies are audited regularly via automated CI checks.
- Code is scanned with static analysis tools (CodeQL).
- All releases are code-signed.
- Data is encrypted at rest (AES-256) and in transit (TLS 1.3).
- Authentication uses bcrypt password hashing and JWT with short-lived tokens.
- The application follows the principle of least privilege (Tauri capability-based permissions).

## Scope

This policy applies to the PlanIT.IO desktop application and all backend services in this repository.
