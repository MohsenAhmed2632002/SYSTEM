import type { CommissionStatus } from "./enums";
import type { Candidate } from "./candidate";
import type { Offer } from "./offer";

// ── Base ──────────────────────────────────────────────────
export interface Commission {
    id: string;
    applicationId: string;
    offerId: string;
    candidateId: string;
    amount: number;
    status: CommissionStatus;
    earnedAt: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
}

// ── مع Relations (بيجي من GET /commissions) ───────────────
export interface CommissionWithRelations extends Commission {
    candidate: Pick<Candidate, "id" | "name" | "phone">;
    offer: Pick<Offer, "id" | "title" | "company">;
}

// ── API Requests ──────────────────────────────────────────
export interface UpdateCommissionStatusDto {
    status: CommissionStatus;
}

// ── API Responses ─────────────────────────────────────────
export interface UpdateCommissionResponse {
    id: string;
    status: CommissionStatus;
    message: string;
}