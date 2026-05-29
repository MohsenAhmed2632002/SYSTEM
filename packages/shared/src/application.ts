import type { ApplicationStatus } from "./enums";
import type { Candidate } from "./candidate";
import type { Offer } from "./offer";
import type { Commission } from "./commission";

// ── Base ──────────────────────────────────────────────────
export interface Application {
    id: string;
    candidateId: string;
    offerId: string;
    status: ApplicationStatus;
    source: string | null;
    assignedTo: string | null;
    createdAt: string;
    updatedAt: string;
}

// ── مع Relations (بيجي من GET /applications) ─────────────
export interface ApplicationWithRelations extends Application {
    candidate: Pick<Candidate, "id" | "name" | "phone" | "level">;
    offer: Pick<Offer, "id" | "title" | "company" | "commission">;
}

// ── مع كل Relations (بيجي من GET /applications/:id) ──────
export interface ApplicationFull extends Application {
    candidate: Candidate;
    offer: Offer;
    commission: Commission | null;
}

// ── API Requests ──────────────────────────────────────────
export interface CreateApplicationDto {
    candidateId: string;
    offerId: string;
    source?: string;
    assignedTo?: string;
}

export interface UpdateApplicationStatusDto {
    status: ApplicationStatus;
}

// ── API Responses ─────────────────────────────────────────
export interface CreateApplicationResponse {
    id: string;
    message: string;
}

export interface UpdateStatusResponse {
    success: boolean;
    message: string;
}