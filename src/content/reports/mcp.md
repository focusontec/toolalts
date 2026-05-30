---
slug: "mcp"
name: "MCP Defender"
decision: "APPROVE"
confidence: 90
category: "developer-tools"
processedAt: "2026-05-20T10:41:17.340Z"
---

# AI Verification Report: MCP Defender

## Decision: APPROVE (90/100 confidence)

| Metric | Score |
|--------|-------|
| Verification Score | 90/100 |
| Quality Score | 85/100 |
| Consistency Score | 90/100 |

## Proposed Metadata

- **Website**: https://mcpdefender.com
- **GitHub**: https://github.com/MCP-Defender/MCP-Defender
- **Category**: developer-tools
- **Tagline**: Desktop app that automatically scans and blocks malicious MCP traffic in AI apps like Cursor, Claude, VS Code and Windsurf.
- **Features**: AI Firewall for MCP tool calls, Threat Detection with LLM-powered analysis, Prompt Injection protection, Credential Theft prevention, Arbitrary Code Execution blocking, Remote Command Injection detection, Supports Cursor/Claude/VS Code/Windsurf, Open source AGPL-3.0
- **Pricing**: Free ($0) — open source, AGPL-3.0
- **GitHub Stars**: 250
- **Open Source**: Yes

## Notes

MCP Defender was acquired by Docker Inc. The GitHub repository (MCP-Defender/MCP-Defender) has 250 stars, 42 forks, and 7 releases. It was previously rejected due to the verification script failing to locate the GitHub repository (the slug "mcp" did not match the repo name "MCP-Defender").

## Full Analysis

MCP Defender is an open-source desktop security application discovered via Hacker News. It acts as a secure proxy between AI applications (Cursor, Claude, VS Code, Windsurf) and MCP servers, analyzing all communications for potential threats in real-time.

The project has a GitHub repository at MCP-Defender/MCP-Defender with 250 stars and 42 forks, indicating solid community adoption. It has 7 releases with the latest (v1.1.2) from August 2025. The application is built with TypeScript (92.9%) using Electron and React with ShadCN UI.

Key security features include: prompt injection detection, credential theft prevention, arbitrary code execution blocking, and remote command injection detection. The tool uses multiple layers of defense including advanced LLM analysis and deterministic signatures.

The project was acquired by Docker Inc., which validates its significance in the AI security space. It is licensed under AGPL-3.0 and remains open source. Given the strong community signals, corporate acquisition, active development, and clear functionality, this tool is approved for inclusion.
