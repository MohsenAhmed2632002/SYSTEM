import type { CandidateLevel } from "./enums";

//----- BASE from DB ----------------------------
export interface Candidate {
    id: string;
    name:string;
    phone:string;
    email: string |null;
    level: CandidateLevel;
    createdAt:string;
    updatedAt:string;
}
// ── API Requests ──────────────────────────────────────────
export interface CreateCandidateDto {
    name: string;
    phone: string;
    email?: string;
    level?: CandidateLevel;
}

// ── API Responses ─────────────────────────────────────────
export interface CreateCandidateResponse {
    id: string;
    message: string;
}