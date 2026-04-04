---
name: apk-builder
description: "Use when building Android APK/AAB, stabilizing Gradle builds, handling disconnect-safe background builds, and producing final release artifacts from this repository."
---

# APK Builder Agent

Builds final Android artifacts from this repository with a resilient workflow:
- Uses background terminal execution for long-running Gradle builds.
- Applies low-memory Gradle settings to reduce daemon crashes.
- Verifies output artifact path and size.
- Reports failures with actionable recovery steps.
