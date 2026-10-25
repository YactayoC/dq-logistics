export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export function isLocked(lockedUntil: Date | null, now: Date = new Date()): boolean {
    return lockedUntil !== null && lockedUntil.getTime() > now.getTime();
}

export function lockUntil(now: Date = new Date()): Date {
    return new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);
}

export class AuthError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = "AuthError";
    }
}