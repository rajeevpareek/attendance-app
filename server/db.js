
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

// ====================================================================================
// In-Memory Database Store
// ====================================================================================

const DB = {
  users: [],
  projects: [],
  attendance: [],
};

const MOCK_USERS_RAW = [
  { id: 1, name: 'John Doe', phone: '1112223333', pin: '1234', role: UserRole.STAFF },
  { id: 2, name: 'Jane Smith', phone: '4445556666', pin: '5678', role: UserRole.STAFF },
  { id: 3, name: 'Admin User', phone: '9998887777', pin: '0000', role: UserRole.ADMIN },
];

const MOCK_PROJECTS = [
  { id: 101, name: 'Downtown Tower Installation' },
  { id: 102, name: 'Suburb Shopping Mall Setup' },
  { id: 103, name: 'Corporate HQ Renovation' },
];

// ====================================================================================
// Initialization Logic
// ====================================================================================

let initializationPromise = null;

const performInitialization = async () => {
    // Hash pins and store users
    DB.users = await Promise.all(MOCK_USERS_RAW.map(async (user) => {
        const pinHash = await bcrypt.hash(user.pin, 10);
        return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            pinHash: pinHash,
        };
    }));

    DB.projects = MOCK_PROJECTS;
    DB.attendance = [];
    
    console.log("In-memory database initialized and seeded.");
};

/**
 * Ensures that the database is initialized.
 * This function creates a single promise on the first call and returns it on all subsequent calls,
 * guaranteeing the initialization logic runs only once.
 * @returns {Promise<void>}
 */
export const ensureInitialized = () => {
    if (!initializationPromise) {
        initializationPromise = performInitialization();
    }
    return initializationPromise;
};


// ====================================================================================
// Data Access Functions (Exports)
// Every function now awaits initialization to ensure safety.
// ====================================================================================

// --- Users ---
export const findUserByPhone = async (phone) => {
    await ensureInitialized();
    return DB.users.find(u => u.phone === phone) || null;
}

export const findUserById = async (id) => {
    await ensureInitialized();
    const user = DB.users.find(u => u.id === id);
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pinHash, ...safeUser } = user;
    return safeUser;
}

// --- Projects ---
export const getProjects = async () => {
    await ensureInitialized();
    return DB.projects;
}

// --- Attendance ---
export const getAttendanceRecords = async () => {
    await ensureInitialized();
    // Enhance records with names, like a server-side JOIN would
    return DB.attendance.map(rec => {
        const staff = DB.users.find(u => u.id === rec.userId);
        const project = DB.projects.find(p => p.id === rec.projectId);
        return {
            ...rec,
            staffName: staff?.name || 'Unknown User',
            projectName: project?.name || 'Unassigned',
        };
    }).sort((a, b) => new Date(b.inTime).getTime() - new Date(a.inTime).getTime());
}

export const findActiveRecordByUserId = async (userId) => {
    await ensureInitialized();
    return DB.attendance.find(r => r.userId === userId && r.outTime === null) || null;
}

export const findRecordById = async (recordId) => {
    await ensureInitialized();
    return DB.attendance.find(r => r.id === recordId) || null;
}

export const createAttendanceRecord = async ({ userId, projectId, coordinates }) => {
    await ensureInitialized();
    const newRecord = {
        id: `rec_${userId}_${Date.now()}`,
        userId,
        projectId,
        inTime: new Date().toISOString(),
        outTime: null,
        inCoordinates: coordinates,
        outCoordinates: null,
    };
    DB.attendance.push(newRecord);
    return newRecord;
}

export const updateAttendanceRecord = async ({ recordId, coordinates }) => {
    await ensureInitialized();
    let updatedRecord = null;
    DB.attendance = DB.attendance.map(rec => {
        if (rec.id === recordId) {
            updatedRecord = {
                ...rec,
                outTime: new Date().toISOString(),
                outCoordinates: coordinates,
            };
            return updatedRecord;
        }
        return rec;
    });

    if (updatedRecord) {
        return updatedRecord;
    } else {
        throw new Error("Record not found to update.");
    }
}
