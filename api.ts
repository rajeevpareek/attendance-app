import { type AttendanceRecord, type Coordinates } from './types';

// In-memory array to simulate a database
let MOCK_ATTENDANCE_DB: AttendanceRecord[] = [];

// Simulate network delay
const API_DELAY = 500;

/**
 * Fetches all attendance records.
 * @returns A promise that resolves to an array of all attendance records.
 */
export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Return a deep copy to prevent direct mutation
      resolve(JSON.parse(JSON.stringify(MOCK_ATTENDANCE_DB)));
    }, API_DELAY);
  });
};

/**
 * Fetches the currently active (not clocked out) record for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the active attendance record, or null if none is found.
 */
export const getActiveRecordForUser = async (userId: number): Promise<AttendanceRecord | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const record = MOCK_ATTENDANCE_DB.find(rec => rec.userId === userId && rec.outTime === null);
            resolve(record ? { ...record } : null);
        }, API_DELAY);
    });
};


/**
 * Creates a new "Clock In" attendance record.
 * @param userId The ID of the user clocking in.
 * @param projectId The ID of the project selected.
 * @param coordinates The geolocation coordinates at clock-in.
 * @returns A promise that resolves to the newly created attendance record.
 */
export const clockIn = async (userId: number, projectId: number, coordinates: Coordinates): Promise<AttendanceRecord> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newRecord: AttendanceRecord = {
                id: `rec_${userId}_${new Date().getTime()}`,
                userId,
                projectId,
                inTime: new Date().toISOString(),
                outTime: null,
                inCoordinates: coordinates,
                outCoordinates: null,
            };
            MOCK_ATTENDANCE_DB.push(newRecord);
            resolve({ ...newRecord });
        }, API_DELAY);
    });
};

/**
 * Updates an existing record to "Clock Out".
 * @param recordId The ID of the record to update.
 * @param coordinates The geolocation coordinates at clock-out.
 * @returns A promise that resolves to the updated attendance record.
 */
export const clockOut = async (recordId: string, coordinates: Coordinates): Promise<AttendanceRecord | null> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const recordIndex = MOCK_ATTENDANCE_DB.findIndex(rec => rec.id === recordId);
            if (recordIndex !== -1) {
                MOCK_ATTENDANCE_DB[recordIndex] = {
                    ...MOCK_ATTENDANCE_DB[recordIndex],
                    outTime: new Date().toISOString(),
                    outCoordinates: coordinates,
                };
                resolve({ ...MOCK_ATTENDANCE_DB[recordIndex] });
            } else {
                reject(new Error("Record not found."));
            }
        }, API_DELAY);
    });
};