import type {
  AttendanceCorrectionRequest,
  AttendanceRecord,
  AttendanceReport,
  Branch,
  CurrentUserResponse,
  Employee,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  Notification,
  Role,
  TokenResponse,
} from '@/src/types';

function isoDaysAgo(days: number, h = 9, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export const demoBranches: Branch[] = [
  {
    id: 'b1-0000-0000-0000-000000000001',
    code: 'TIR-HQ',
    name: 'Tirupur HQ',
    address: '123 Avinashi Road, Tirupur',
    timeZone: 'Asia/Kolkata',
    latitude: 11.0168,
    longitude: 76.9558,
    geofenceRadiusMeters: 150,
    activeManager: { employeeId: 'emp-mgr-0001', displayName: 'Ramesh Kumar' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'b1-0000-0000-0000-000000000002',
    code: 'CMB-UNT1',
    name: 'Coimbatore Unit 1',
    address: 'SIDCO Industrial Estate, Coimbatore',
    timeZone: 'Asia/Kolkata',
    latitude: 11.0168,
    longitude: 76.9558,
    geofenceRadiusMeters: 200,
    activeManager: { employeeId: 'emp-mgr-0002', displayName: 'Lakshmi Nair' },
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
];

export const demoEmployees: Employee[] = [
  {
    id: 'emp-self-0001',
    employeeCode: 'EMP-1048',
    firstName: 'Arjun',
    lastName: 'Sundaram',
    designation: 'Stitching Operator',
    employmentType: 'LABOUR',
    status: 'ACTIVE',
    joiningDate: '2023-03-15',
    workEmail: 'arjun.sundaram@inaiivotextiles.com',
    phoneNumber: '+91 98765 43210',
    gender: 'MALE',
    branch: { id: demoBranches[0].id, code: demoBranches[0].code, name: demoBranches[0].name, timeZone: demoBranches[0].timeZone },
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'emp-self-0002',
    employeeCode: 'EMP-2051',
    firstName: 'Priya',
    lastName: 'Rajan',
    designation: 'Quality Inspector',
    employmentType: 'STAFF',
    status: 'ACTIVE',
    joiningDate: '2022-07-01',
    workEmail: 'priya.rajan@inaiivotextiles.com',
    phoneNumber: '+91 90000 11111',
    gender: 'FEMALE',
    branch: { id: demoBranches[0].id, code: demoBranches[0].code, name: demoBranches[0].name, timeZone: demoBranches[0].timeZone },
    createdAt: '2022-07-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'emp-0042',
    employeeCode: 'EMP-1042',
    firstName: 'Deepak',
    lastName: 'Krishnan',
    designation: 'Cutting Section Lead',
    employmentType: 'STAFF',
    status: 'ACTIVE',
    joiningDate: '2021-11-10',
    workEmail: 'deepak.k@inaiivotextiles.com',
    phoneNumber: '+91 91234 56780',
    gender: 'MALE',
    branch: { id: demoBranches[0].id, code: demoBranches[0].code, name: demoBranches[0].name, timeZone: demoBranches[0].timeZone },
    createdAt: '2021-11-10T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'emp-0055',
    employeeCode: 'EMP-1055',
    firstName: 'Saravanan',
    lastName: 'Murugan',
    designation: 'Finishing Operator',
    employmentType: 'LABOUR',
    status: 'ACTIVE',
    joiningDate: '2023-01-20',
    workEmail: 'saravanan.m@inaiivotextiles.com',
    phoneNumber: '+91 94444 55566',
    gender: 'MALE',
    branch: { id: demoBranches[0].id, code: demoBranches[0].code, name: demoBranches[0].name, timeZone: demoBranches[0].timeZone },
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'emp-mgr-0001',
    employeeCode: 'EMP-2001',
    firstName: 'Ramesh',
    lastName: 'Kumar',
    designation: 'Branch Manager',
    employmentType: 'STAFF',
    status: 'ACTIVE',
    joiningDate: '2020-05-01',
    workEmail: 'ramesh.kumar@inaiivotextiles.com',
    phoneNumber: '+91 98000 00001',
    gender: 'MALE',
    branch: { id: demoBranches[0].id, code: demoBranches[0].code, name: demoBranches[0].name, timeZone: demoBranches[0].timeZone },
    createdAt: '2020-05-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'emp-0071',
    employeeCode: 'EMP-1071',
    firstName: 'Kavya',
    lastName: 'Subramanian',
    designation: 'Packing Supervisor',
    employmentType: 'STAFF',
    status: 'SUSPENDED',
    joiningDate: '2022-09-12',
    workEmail: 'kavya.s@inaiivotextiles.com',
    phoneNumber: '+91 93333 44445',
    gender: 'FEMALE',
    branch: { id: demoBranches[1].id, code: demoBranches[1].code, name: demoBranches[1].name, timeZone: demoBranches[1].timeZone },
    createdAt: '2022-09-12T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
];

export const demoLeaveTypes: LeaveType[] = [
  { id: 'lt-casual', code: 'CASUAL', name: 'Casual Leave', unit: 'DAY', requiresApproval: true, isActive: true },
  { id: 'lt-sick', code: 'SICK', name: 'Sick Leave', unit: 'DAY', requiresApproval: true, isActive: true },
  { id: 'lt-earned', code: 'EARNED', name: 'Earned Leave', unit: 'DAY', requiresApproval: true, isActive: true },
  { id: 'lt-comp', code: 'COMP_OFF', name: 'Compensatory Off', unit: 'DAY', requiresApproval: true, isActive: true },
];

export const demoLeaveBalances: LeaveBalance[] = [
  { leaveType: demoLeaveTypes[0], allocated: 12, used: 3, pending: 1, available: 8, unit: 'DAY' },
  { leaveType: demoLeaveTypes[1], allocated: 7, used: 1, pending: 0, available: 6, unit: 'DAY' },
  { leaveType: demoLeaveTypes[2], allocated: 15, used: 2, pending: 0, available: 13, unit: 'DAY' },
  { leaveType: demoLeaveTypes[3], allocated: 5, used: 0, pending: 0, available: 5, unit: 'DAY' },
];

function makeAttendanceRecords(employeeId: string, count: number): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceRecord['status'][] = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT', 'WEEKLY_OFF', 'HOLIDAY'];
  for (let i = 0; i < count; i++) {
    const ds = dateStr(i);
    const st = statuses[i % statuses.length];
    const isOff = st === 'WEEKLY_OFF' || st === 'HOLIDAY';
    records.push({
      id: `att-${employeeId}-${i}`,
      employeeId,
      businessDate: ds,
      checkInTime: isOff ? null : isoDaysAgo(i, st === 'LATE' ? 9 : 8, st === 'LATE' ? 15 : 5),
      checkOutTime: isOff ? null : isoDaysAgo(i, 17, 30),
      checkInSource: isOff ? null : 'BIOMETRIC',
      checkOutSource: isOff ? null : 'BIOMETRIC',
      workedMinutes: isOff ? 0 : 540 + (i % 3) * 15,
      overtimeMinutes: isOff ? 0 : (i % 4) * 30,
      status: st,
      isCorrected: i === 5,
      correctionAudit: i === 5
        ? { correctionRequestId: 'cr-demo-0001', approvedByEmployeeId: 'emp-mgr-0001', approvedAt: isoDaysAgo(4, 10), comment: 'Approved - verified with floor supervisor.' }
        : null,
    });
  }
  return records;
}

export const demoAttendanceRecords: AttendanceRecord[] = makeAttendanceRecords('emp-self-0001', 30);

export const demoBranchAttendance: AttendanceRecord[] = [
  ...makeAttendanceRecords('emp-0042', 7),
  ...makeAttendanceRecords('emp-0055', 7),
  ...makeAttendanceRecords('emp-self-0001', 7),
];

export const demoCorrections: AttendanceCorrectionRequest[] = [
  {
    id: 'cr-demo-0001',
    employeeId: 'emp-self-0001',
    employeeCode: 'EMP-1048',
    employeeName: 'Arjun Sundaram',
    branchId: demoBranches[0].id,
    businessDate: dateStr(5),
    punchType: 'CHECK_IN',
    claimedPunchTime: isoDaysAgo(5, 8, 30),
    reason: 'Biometric device failed to read fingerprint due to dye on fingers.',
    submissionLocation: { latitude: 11.0169, longitude: 76.9557, accuracyMeters: 12.5 },
    locationCapturedAt: isoDaysAgo(5, 8, 31),
    geofenceEvaluation: { distanceMeters: 45.2, allowedRadiusMeters: 150, isWithinGeofence: true },
    status: 'APPROVED',
    review: {
      reviewedByEmployeeId: 'emp-mgr-0001',
      reviewedByDisplayName: 'Ramesh Kumar',
      decision: 'APPROVE',
      reviewedAt: isoDaysAgo(4, 10),
      comment: 'Approved - verified with floor supervisor.',
      rejectionReason: null,
    },
    createdAt: isoDaysAgo(5, 8, 32),
    updatedAt: isoDaysAgo(4, 10),
  },
  {
    id: 'cr-demo-0002',
    employeeId: 'emp-0042',
    employeeCode: 'EMP-1042',
    employeeName: 'Deepak Krishnan',
    branchId: demoBranches[0].id,
    businessDate: dateStr(2),
    punchType: 'CHECK_OUT',
    claimedPunchTime: isoDaysAgo(2, 17, 45),
    reason: 'Fingerprint scanner at exit gate was unresponsive, supervisor witnessed checkout.',
    submissionLocation: { latitude: 11.0171, longitude: 76.9561, accuracyMeters: 8.0 },
    locationCapturedAt: isoDaysAgo(2, 17, 46),
    geofenceEvaluation: { distanceMeters: 20.1, allowedRadiusMeters: 150, isWithinGeofence: true },
    status: 'PENDING',
    review: null,
    createdAt: isoDaysAgo(2, 17, 47),
    updatedAt: isoDaysAgo(2, 17, 47),
  },
  {
    id: 'cr-demo-0003',
    employeeId: 'emp-0055',
    employeeCode: 'EMP-1055',
    employeeName: 'Saravanan Murugan',
    branchId: demoBranches[0].id,
    businessDate: dateStr(1),
    punchType: 'CHECK_IN',
    claimedPunchTime: isoDaysAgo(1, 8, 10),
    reason: 'Was on the factory floor when device went offline briefly.',
    submissionLocation: { latitude: 11.0165, longitude: 76.9555, accuracyMeters: 15.0 },
    locationCapturedAt: isoDaysAgo(1, 8, 12),
    geofenceEvaluation: { distanceMeters: 30.0, allowedRadiusMeters: 150, isWithinGeofence: true },
    status: 'PENDING',
    review: null,
    createdAt: isoDaysAgo(1, 8, 13),
    updatedAt: isoDaysAgo(1, 8, 13),
  },
  {
    id: 'cr-demo-0004',
    employeeId: 'emp-self-0001',
    employeeCode: 'EMP-1048',
    employeeName: 'Arjun Sundaram',
    branchId: demoBranches[0].id,
    businessDate: dateStr(10),
    punchType: 'CHECK_IN',
    claimedPunchTime: isoDaysAgo(10, 8, 5),
    reason: 'Forgot to punch in due to urgent machine setup request.',
    submissionLocation: { latitude: 11.35, longitude: 77.0, accuracyMeters: 60.0 },
    locationCapturedAt: isoDaysAgo(10, 8, 6),
    geofenceEvaluation: { distanceMeters: 38000, allowedRadiusMeters: 150, isWithinGeofence: false },
    status: 'REJECTED',
    review: {
      reviewedByEmployeeId: 'emp-mgr-0001',
      reviewedByDisplayName: 'Ramesh Kumar',
      decision: 'REJECT',
      reviewedAt: isoDaysAgo(9, 11),
      comment: null,
      rejectionReason: 'Submission location was outside the branch geofence. Please coordinate with HR.',
    },
    createdAt: isoDaysAgo(10, 8, 7),
    updatedAt: isoDaysAgo(9, 11),
  },
];

export const demoLeaveRequests: LeaveRequest[] = [
  {
    id: 'lr-demo-0001',
    employeeId: 'emp-self-0001',
    employeeCode: 'EMP-1048',
    employeeName: 'Arjun Sundaram',
    branchId: demoBranches[0].id,
    leaveType: demoLeaveTypes[0],
    startDate: dateStr(-7),
    endDate: dateStr(-6),
    dayPart: 'FULL_DAY',
    requestedUnits: 2,
    reason: 'Family function out of town.',
    status: 'PENDING',
    review: null,
    cancellation: null,
    createdAt: isoDaysAgo(3, 14),
    updatedAt: isoDaysAgo(3, 14),
  },
  {
    id: 'lr-demo-0002',
    employeeId: 'emp-0042',
    employeeCode: 'EMP-1042',
    employeeName: 'Deepak Krishnan',
    branchId: demoBranches[0].id,
    leaveType: demoLeaveTypes[1],
    startDate: dateStr(-10),
    endDate: dateStr(-10),
    dayPart: 'FULL_DAY',
    requestedUnits: 1,
    reason: 'Fever and medical rest.',
    status: 'PENDING',
    review: null,
    cancellation: null,
    createdAt: isoDaysAgo(2, 9),
    updatedAt: isoDaysAgo(2, 9),
  },
  {
    id: 'lr-demo-0003',
    employeeId: 'emp-self-0001',
    employeeCode: 'EMP-1048',
    employeeName: 'Arjun Sundaram',
    branchId: demoBranches[0].id,
    leaveType: demoLeaveTypes[2],
    startDate: dateStr(20),
    endDate: dateStr(24),
    dayPart: 'FULL_DAY',
    requestedUnits: 5,
    reason: 'Planned vacation with family.',
    status: 'APPROVED',
    review: {
      reviewedByEmployeeId: 'emp-mgr-0001',
      reviewedByDisplayName: 'Ramesh Kumar',
      decision: 'APPROVE',
      reviewedAt: isoDaysAgo(15, 11),
      comment: 'Approved. Coverage arranged.',
      rejectionReason: null,
    },
    cancellation: null,
    createdAt: isoDaysAgo(20, 10),
    updatedAt: isoDaysAgo(15, 11),
  },
  {
    id: 'lr-demo-0004',
    employeeId: 'emp-0055',
    employeeCode: 'EMP-1055',
    employeeName: 'Saravanan Murugan',
    branchId: demoBranches[0].id,
    leaveType: demoLeaveTypes[0],
    startDate: dateStr(12),
    endDate: dateStr(13),
    dayPart: 'FIRST_HALF',
    requestedUnits: 1.5,
    reason: 'Personal work.',
    status: 'REJECTED',
    review: {
      reviewedByEmployeeId: 'emp-mgr-0001',
      reviewedByDisplayName: 'Ramesh Kumar',
      decision: 'REJECT',
      reviewedAt: isoDaysAgo(8, 12),
      comment: null,
      rejectionReason: 'Insufficient staffing on those dates. Please apply for a later slot.',
    },
    cancellation: null,
    createdAt: isoDaysAgo(12, 9),
    updatedAt: isoDaysAgo(8, 12),
  },
];

export const demoNotifications: Notification[] = [
  {
    id: 'ntf-0001',
    type: 'ATTENDANCE_CORRECTION_APPROVED',
    title: 'Correction Request Approved',
    body: 'Your missed punch correction for ' + dateStr(5) + ' has been approved by Ramesh Kumar.',
    deepLink: '/corrections/cr-demo-0001',
    isRead: false,
    createdAt: isoDaysAgo(4, 10, 5),
  },
  {
    id: 'ntf-0002',
    type: 'LEAVE_REVIEW_PENDING',
    title: 'Leave Request Pending Review',
    body: 'A leave request from Deepak Krishnan awaits your review.',
    deepLink: '/leave/lr-demo-0002',
    isRead: false,
    createdAt: isoDaysAgo(2, 9, 10),
  },
  {
    id: 'ntf-0003',
    type: 'CORRECTION_REVIEW_PENDING',
    title: 'Correction Request Pending Review',
    body: 'Saravanan Murugan submitted a missed punch correction for ' + dateStr(1) + '.',
    deepLink: '/corrections/cr-demo-0003',
    isRead: true,
    createdAt: isoDaysAgo(1, 8, 15),
  },
  {
    id: 'ntf-0004',
    type: 'LEAVE_REQUEST_REJECTED',
    title: 'Leave Request Rejected',
    body: 'Your casual leave request was rejected. Reason: Insufficient staffing on those dates.',
    deepLink: '/leave/lr-demo-0004',
    isRead: true,
    createdAt: isoDaysAgo(8, 12, 5),
  },
];

export const demoAttendanceReport: AttendanceReport = {
  fromDate: dateStr(6),
  toDate: dateStr(0),
  groupBy: 'DAY',
  totals: {
    totalEmployees: 48,
    presentCount: 285,
    absentCount: 18,
    lateCount: 23,
    overtimeMinutes: 1240,
  },
  rows: [
    { key: dateStr(6), label: 'Mon', presentCount: 44, absentCount: 4, lateCount: 3, overtimeMinutes: 180 },
    { key: dateStr(5), label: 'Tue', presentCount: 46, absentCount: 2, lateCount: 5, overtimeMinutes: 210 },
    { key: dateStr(4), label: 'Wed', presentCount: 45, absentCount: 3, lateCount: 2, overtimeMinutes: 160 },
    { key: dateStr(3), label: 'Thu', presentCount: 47, absentCount: 1, lateCount: 4, overtimeMinutes: 240 },
    { key: dateStr(2), label: 'Fri', presentCount: 43, absentCount: 5, lateCount: 6, overtimeMinutes: 300 },
    { key: dateStr(1), label: 'Sat', presentCount: 40, absentCount: 3, lateCount: 3, overtimeMinutes: 150 },
    { key: dateStr(0), label: 'Sun', presentCount: 20, absentCount: 0, lateCount: 0, overtimeMinutes: 0 },
  ],
};

export function loginForRole(role: Role): { token: TokenResponse; me: CurrentUserResponse } {
  const emp =
    role === 'manager' ? demoEmployees.find((e) => e.id === 'emp-mgr-0001')! : role === 'admin' ? null : demoEmployees[0];
  const branch = role === 'admin' ? null : demoBranches[0];
  const user = {
    id: `usr-${role}`,
    username: role === 'admin' ? 'admin' : role === 'manager' ? 'ramesh.kumar' : 'arjun.sundaram',
    displayName: role === 'admin' ? 'Administrator' : role === 'manager' ? 'Ramesh Kumar' : 'Arjun Sundaram',
    role,
    employeeId: emp?.id ?? null,
    branchId: branch?.id ?? null,
  };
  const token: TokenResponse = {
    accessToken: `demo-access-${role}-${Date.now()}`,
    refreshToken: `demo-refresh-${role}-${Date.now()}`,
    tokenType: 'Bearer',
    expiresInSeconds: 900,
    user,
  };
  const me: CurrentUserResponse = {
    user,
    business: { id: 'biz-0001', code: 'inaiivo-textiles', name: 'Inaivo Textiles Pvt Ltd' },
    employee: emp ?? null,
    branch: branch
      ? { id: branch.id, code: branch.code, name: branch.name, timeZone: branch.timeZone }
      : null,
  };
  return { token, me };
}
