import { type AttendanceRecord, type Coordinates, type Project, type User, UserRole } from './types';
import * as db from './server/db';
import * as auth from './server/auth';

// Initialize the database on first load
db.initializeData();

// ====================================================================================
// Authentication
// ====================================================================================

const getToken = (): string | null => {
    return localStorage.getItem('authToken');
}

/**
 * Logs a user in by calling the backend, which validates credentials.
 * On success, it returns the user object and a JWT.
 */
export const login = async (phone: string, pin: string): Promise<{ user: User, token: string }> => {
    const userWithPin = await db.findUserByPhone(phone);
    if (!userWithPin) {
        throw new Error('Invalid phone number or PIN.');
    }

    const isMatch = await auth.comparePin(pin, userWithPin.pinHash);
    if (!isMatch) {
        throw new Error('Invalid phone number or PIN.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pinHash, ...safeUser } = userWithPin;
    const token = await auth.generateToken(safeUser);

    return { user: safeUser, token };
};

/**
 * Gets the currently logged-in user's data by validating their token.
 */
export const getSelf = async (): Promise<User | null> => {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = await auth.verifyToken(token);
        // The payload contains the full user object we put in it
        return payload as User;
    } catch (error) {
        console.error("Token verification failed", error);
        throw new Error("Session expired. Please log in again.");
    }
};

// ====================================================================================
// Projects API
// ====================================================================================

export const getProjects = async (): Promise<Project[]> => {
    await getSelf(); // Acts as an authentication check
    return db.getProjects();
};


// ====================================================================================
// Attendance API
// ====================================================================================

/**
 * Fetches all attendance records (Admin only).
 */
export const getAttendanceRecords = async (): Promise<any[]> => {
    const user = await getSelf();
    if (user?.role !== UserRole.ADMIN) {
        throw new Error("Access denied.");
    }
    return db.getAttendanceRecords();
};

/**
 * Finds the currently active (not clocked out) record for the logged-in user.
 */
export const getActiveRecordForUser = async (): Promise<AttendanceRecord | null> => {
    const user = await getSelf();
    if (!user) throw new Error("Not authenticated");
    return db.findActiveRecordByUserId(user.id);
};

/**
 * Creates a new attendance record for a clock-in event.
 */
export const clockIn = async (projectId: number, coordinates: Coordinates): Promise<AttendanceRecord> => {
    const user = await getSelf();
    if (!user) throw new Error("Not authenticated");
    
    const activeRecord = await db.findActiveRecordByUserId(user.id);
    if (activeRecord) {
        throw new Error('User is already clocked in.');
    }
    
    return db.createAttendanceRecord({ userId: user.id, projectId, coordinates });
};

/**
 * Updates an existing attendance record for a clock-out event.
 */
export const clockOut = async (recordId: string, coordinates: Coordinates): Promise<AttendanceRecord> => {
    const user = await getSelf();
    if (!user) throw new Error("Not authenticated");

    const record = await db.findRecordById(recordId);
    if (!record || record.userId !== user.id) {
        throw new Error('Active record not found or permission denied.');
    }

    return db.updateAttendanceRecord({ recordId, coordinates });
};