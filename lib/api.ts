/* ── UdaanScore API Client ─────────────────────────────────── */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${txt}`);
  }
  return res.json();
}

/* ── Types ────────────────────────────────────────────────── */
export type ScorePayload = {
  bills: number;
  upi: number;
  cashflow: number;
  savings: number;
  location: number;
  quiz: number;
};

export type ScoreResult = {
  trust_score: number;
  risk_band: string;
  loan_limit: number;
  confidence: string;
  reasons: string[];
};

export type FraudFlag = {
  flag: string;
  detail: string;
  severity: "High" | "Medium" | "Low";
  icon: string;
};

export type FraudResult = {
  borrower_name: string;
  fraud_score: number;
  risk_level: string;
  badge_color: string;
  recommendation: string;
  flags_detected: number;
  flags: FraudFlag[];
  verified: boolean;
  auto_approved: boolean;
};

export type ExplainFactor = {
  factor: string;
  detail: string;
  impact?: string;
  action?: string;
};

export type ExplainResult = {
  borrower_name: string;
  trust_score: number;
  verdict: string;
  verdict_emoji: string;
  risk_band: string;
  positive_factors: ExplainFactor[];
  negative_factors: ExplainFactor[];
  improvement_suggestions: ExplainFactor[];
  score_breakdown: Record<string, string>;
};

export type NanoStage = {
  stage: number;
  loan_amount: number;
  label: string;
  min_score_required: number;
  score_boost_on_repay: number;
  description: string;
  status: "completed" | "active" | "unlocked" | "locked";
};

export type NanoLadderResult = {
  borrower_name: string;
  trust_score: number;
  current_stage: number;
  current_loan_limit: number;
  ladder: NanoStage[];
  next_unlock: {
    stage: number;
    loan_amount: number;
    score_needed: number;
    label: string;
  } | null;
};

export type CreditBuilderTask = {
  task: string;
  description: string;
  score_boost: number;
  priority: string;
  time_estimate: string;
};

export type CreditBuilderResult = {
  borrower_name: string;
  current_score: number;
  milestone_target: number;
  potential_boost: number;
  tasks: CreditBuilderTask[];
};

export type BorrowerProfile = {
  id: number;
  name: string;
  age: number;
  occupation: string;
  city: string;
  trust_score: number;
  risk_band: string;
  loan_limit: number;
  confidence: string;
  bills_score: number;
  upi_score: number;
  cashflow_score: number;
  savings_score: number;
  location_score: number;
  quiz_score: number;
  nano_loan_stage: number;
  total_loans_repaid: number;
  monthly_income: number;
};

export type RepayResult = {
  message: string;
  borrower: string;
  old_score: number;
  new_score: number;
  score_boost: number;
  new_risk_band: string;
  new_loan_limit: number;
};

export type SimulateInput = {
  borrower_name: string;
  pay_bills_on_time?: boolean;
  increase_savings?: boolean;
  increase_upi_transactions?: boolean;
  avoid_cash_withdrawals?: boolean;
  complete_assessment?: boolean;
};

/* ── Score Engine ─────────────────────────────────────────── */
export const calculateServerScore = (payload: ScorePayload) =>
  apiFetch<ScoreResult>("/score/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/* ── Borrowers ────────────────────────────────────────────── */
export const getBorrower = (name: string) =>
  apiFetch<BorrowerProfile>(`/borrowers/${encodeURIComponent(name)}`);

export const getAllBorrowers = () =>
  apiFetch<{ total: number; borrowers: BorrowerProfile[] }>("/borrowers/");

export const repayLoan = (borrower_name: string, loan_amount: number) =>
  apiFetch<RepayResult>("/borrowers/repay-loan", {
    method: "POST",
    body: JSON.stringify({ borrower_name, loan_amount }),
  });

/* ── Features ─────────────────────────────────────────────── */
export const getNanoLadder = (borrower_name: string) =>
  apiFetch<NanoLadderResult>(
    `/features/nano-ladder/${encodeURIComponent(borrower_name)}`
  );

export const getCreditBuilder = (borrower_name: string) =>
  apiFetch<CreditBuilderResult>(
    `/features/credit-builder/${encodeURIComponent(borrower_name)}`
  );

export const simulateScore = (data: SimulateInput) =>
  apiFetch<{
    current_score: number;
    predicted_score: number;
    score_boost: number;
    new_risk_band: string;
    new_loan_limit: number;
    improvements: string[];
  }>("/features/simulate-score", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ── Vault ────────────────────────────────────────────────── */
export const getConsent = (borrower_name: string) =>
  apiFetch<Record<string, unknown>>(
    `/vault/consent/${encodeURIComponent(borrower_name)}`
  );

export const updateConsent = (
  borrower_name: string,
  fields: Partial<{
    bank_data: boolean;
    upi_data: boolean;
    utility_bills: boolean;
    gst_data: boolean;
    location_data: boolean;
    psychometric_data: boolean;
  }>
) =>
  apiFetch<Record<string, unknown>>("/vault/consent/update", {
    method: "POST",
    body: JSON.stringify({ borrower_name, ...fields }),
  });

export const revokeConsent = (borrower_name: string) =>
  apiFetch<Record<string, unknown>>(
    `/vault/consent/revoke/${encodeURIComponent(borrower_name)}`,
    { method: "DELETE" }
  );

export const getExplanation = (borrower_name: string) =>
  apiFetch<ExplainResult>(
    `/vault/explain/${encodeURIComponent(borrower_name)}`
  );

export const getFraudCheck = (borrower_name: string) =>
  apiFetch<FraudResult>(
    `/vault/fraud-check/${encodeURIComponent(borrower_name)}`
  );

/* ── Demo ─────────────────────────────────────────────────── */
export const getRajuStory = () =>
  apiFetch<Record<string, unknown>>("/demo/raju-story");
