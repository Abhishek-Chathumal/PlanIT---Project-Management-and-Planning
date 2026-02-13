# ADR-001: Use Tauri v2 for Desktop Shell

**Date:** 2026-02-12
**Status:** Accepted
**Deciders:** PlanIT.IO Team

## Context

PlanIT.IO requires a cross-platform desktop application shell that runs on Windows, macOS, and Linux. The application must be resource-efficient (low RAM, small installer), secure by default, and performant (fast startup, smooth UI). The two leading options are Electron and Tauri v2.

## Decision

We will use **Tauri v2** as the desktop application shell.

## Consequences

### Positive
- Installer size ~5-10MB vs Electron's ~80-200MB
- Idle RAM ~30-40MB vs Electron's ~200-300MB
- Startup time < 0.5s vs Electron's 1-2s
- Capability-based security model (nothing enabled by default)
- Rust core provides memory safety and zero-cost abstractions
- Built-in signed auto-updater
- Uses OS native WebView, reducing attack surface

### Negative
- Requires Rust toolchain on developer machines
- Smaller ecosystem compared to Electron
- Minor rendering inconsistencies possible across OS WebViews
- Steeper learning curve for Rust-based customization

### Risks
- OS WebView bugs could affect specific platforms
- Fewer examples and community resources vs Electron
