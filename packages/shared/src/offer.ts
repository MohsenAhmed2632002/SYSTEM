// ── Base ──────────────────────────────────────────────────
export interface Offer {
    id: string;
    title: string;
    company: string | null;
    description: string | null;
    commission: number;
    commissionDelay: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ── API Requests ──────────────────────────────────────────
export interface CreateOfferDto {
    title: string;
    company?: string;
    description?: string;
    commission?: number;
    commissionDelay?: number;
    isActive?: boolean;
}

export type UpdateOfferDto = Partial<CreateOfferDto>;

// ── API Responses ─────────────────────────────────────────
export interface OfferWithCount extends Offer {
    _count: { applications: number };
}

export interface CreateOfferResponse {
    id: string;
    message: string;
}