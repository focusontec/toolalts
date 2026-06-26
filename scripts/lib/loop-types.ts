// ─── Loop Engine Types ──────────────────────────────────────────────
// Shared types for scripts/loop-engine.ts and related modules.

export interface FieldCheck {
  field: string;
  storedValue: string;
  actualValue: string;
  verdict: "ACCURATE" | "OUTDATED" | "INCORRECT" | "UNVERIFIABLE" | "MISSING";
  source: string;
  note: string;
}

export interface DataAuditResult {
  slug: string;
  name: string;
  accuracyScore: number;
  fieldChecks: FieldCheck[];
  recommendations: string[];
  concerns: string[];
  auditedAt: string;
}

export interface ContentAuditResult {
  slug: string;
  type: "comparison" | "blog" | "report";
  qualityScore: number;
  accuracyScore: number;
  seoScore: number;
  issues: { severity: "high" | "medium" | "low"; message: string }[];
  strengths: string[];
  recommendations: string[];
  auditedAt: string;
}

export interface AuditResults {
  data: DataAuditResult[];
  content: ContentAuditResult[];
}

// ─── Fix Plan ──────────────────────────────────────────────────────

export type FixStrategy =
  | "llm-rewrite"
  | "delegate-sync-stars"
  | "delegate-scrape-pricing"
  | "delegate-enrich-features"
  | "escalate";

export interface FieldFix {
  slug: string;
  field: string;
  strategy: FixStrategy;
  currentValue: any;
  newValue?: any;
  evidence?: string;
  reason: string;
}

export interface ContentFix {
  slug: string;
  type: "comparison" | "report" | "blog";
  action: "regenerate" | "patch" | "escalate";
  reason: string;
  toolASlug?: string;
  toolBSlug?: string;
}

export interface FixPlan {
  dataFixes: FieldFix[];
  contentFixes: ContentFix[];
}

// ─── Loop State ────────────────────────────────────────────────────

export interface ReAuditResult {
  slug: string;
  previousAccuracy: number;
  currentAccuracy: number;
  previousContentScore: number;
  currentContentScore: number;
  delta: number;
}

export interface LoopIteration {
  iteration: number;
  startedAt: string;
  completedAt: string;
  fixesApplied: number;
  fixesFailed: number;
  escalated: number;
  reAuditResults: ReAuditResult[];
  stopCondition:
    | "all-pass"
    | "max-iterations"
    | "cost-cap"
    | "no-progress"
    | "continue";
}

export interface FixLogEntry {
  iteration: number;
  slug: string;
  field: string;
  strategy: FixStrategy;
  previousValue: any;
  newValue?: any;
  evidence?: string;
  success: boolean;
  error?: string;
}

export interface LoopState {
  runId: string;
  startedAt: string;
  maxIterations: number;
  currentIteration: number;
  iterations: LoopIteration[];
  totalCostCap: number;
  llmCallsUsed: number;
  slugsProcessed: string[];
  status: "running" | "completed" | "failed" | "cost-capped";
  fixLog: FixLogEntry[];
}

// ─── CLI Args ──────────────────────────────────────────────────────

export interface LoopEngineArgs {
  slug?: string;
  maxIterations: number;
  dryRun: boolean;
  resume: boolean;
  mode: "all" | "data" | "content";
}
