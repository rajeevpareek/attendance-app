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

let isInitialized = false;
export const initializeData = async () => {
    if (isInitialized) return;
    
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
    
    isInitialized = true;
    console.log("In-memory database initialized and seeded.");
};

// ====================================================================================
// Data Access Functions (Exports)
// ====================================================================================

// --- Users ---
export const findUserByPhone = async (phone) => {
    return DB.users.find(u => u.phone === phone) || null;
}

export const findUserById = async (id) => {
    const user = DB.users.find(u => u.id === id);
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pinHash, ...safeUser } = user;
    return safeUser;
}

// --- Projects ---
export const getProjects = async () => {
    return DB.projects;
}

// --- Attendance ---
export const getAttendanceRecords = async () => {
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
    return DB.attendance.find(r => r.userId === userId && r.outTime === null) || null;
}

export const findRecordById = async (recordId) => {
    return DB.attendance.find(r => r.id === recordId) || null;
}

export const createAttendanceRecord = async ({ userId, projectId, coordinates }) => {
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