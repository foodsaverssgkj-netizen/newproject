export type Role = 'employee' | 'manager' | 'admin';

export interface Problem {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code: string;
  traceId?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PageInfo {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  employeeId?: string | null;
  branchId?: string | null;
}

export interface BusinessSummary {
  id: string;
  code: string;
  name: string;
}

export interface BranchSummary {
  id: string;
  code: string;
  name: string;
  timeZone: string;
}

export interface Branch extends BranchSummary {
  address?: string | null;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  activeManager?: { employeeId: string; displayName: string } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchPage {
  items: Branch[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: UserSummary;
}

export interface CurrentUserResponse {
  user: UserSummary;
  business: BusinessSummary;
  employee: Employee | null;
  branch: BranchSummary | null;
}

export type EmploymentType = 'STAFF' | 'LABOUR' | 'CONTRACTOR' | 'INTERN';
export type EmployeeStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type Gender = 'FEMALE' | 'MALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation?: string | null;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joiningDate: string;
  workEmail?: string | null;
  phoneNumber?: string | null;
  gender?: Gender | null;
  branch: BranchSummary;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreateRequest {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  branchId: string;
  designation?: string;
  employmentType: EmploymentType;
  joiningDate: string;
  workEmail?: string;
  phoneNumber?: string;
  gender?: Gender;
}

export interface EmployeeUpdateRequest {
  firstName?: string;
  lastName?: string;
  designation?: string;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  branchId?: string;
  workEmail?: string;
  phoneNumber?: string;
}

export interface EmployeePage {
  items: Employee[];
  page: PageInfo;
}

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'LATE'
  | 'ON_LEAVE'
  | 'WEEKLY_OFF'
  | 'HOLIDAY';

export type PunchSource = 'BIOMETRIC' | 'MOBILE_CORRECTION';

export interface AttendanceCorrectionAudit {
  correctionRequestId: string;
  approvedByEmployeeId: string;
  approvedAt: string;
  comment?: string | null;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  businessDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkInSource?: PunchSource | null;
  checkOutSource?: PunchSource | null;
  workedMinutes: number;
  overtimeMinutes: number;
  status: AttendanceStatus;
  isCorrected: boolean;
  correctionAudit?: AttendanceCorrectionAudit | null;
}

export interface AttendanceRecordPage {
  items: AttendanceRecord[];
  page: PageInfo;
}

export interface AttendanceSummary {
  fromDate: string;
  toDate: string;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  lateCount: number;
  overtimeMinutes: number;
}

export type PunchType = 'CHECK_IN' | 'CHECK_OUT';
export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export interface AttendanceCorrectionCreateRequest {
  businessDate: string;
  punchType: PunchType;
  claimedPunchTime: string;
  reason: string;
  location: GpsLocation;
  locationCapturedAt: string;
}

export interface GeofenceEvaluation {
  distanceMeters: number;
  allowedRadiusMeters: number;
  isWithinGeofence: boolean;
}

export interface CorrectionReview {
  reviewedByEmployeeId: string;
  reviewedByDisplayName: string;
  decision: 'APPROVE' | 'REJECT';
  reviewedAt: string;
  comment?: string | null;
  rejectionReason?: string | null;
}

export interface AttendanceCorrectionRequest {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  branchId: string;
  businessDate: string;
  punchType: PunchType;
  claimedPunchTime: string;
  reason: string;
  submissionLocation: GpsLocation;
  locationCapturedAt: string;
  geofenceEvaluation: GeofenceEvaluation;
  status: CorrectionStatus;
  review?: CorrectionReview | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceCorrectionRequestPage {
  items: AttendanceCorrectionRequest[];
  page: PageInfo;
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  unit: 'DAY' | 'HOUR';
  requiresApproval: boolean;
  isActive: boolean;
}

export interface LeaveTypeList {
  items: LeaveType[];
}

export interface LeaveBalance {
  leaveType: LeaveType;
  allocated: number;
  used: number;
  pending: number;
  available: number;
  unit: 'DAY' | 'HOUR';
}

export interface LeaveBalanceList {
  items: LeaveBalance[];
}

export type DayPart = 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequestCreate {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  dayPart?: DayPart;
  reason: string;
}

export interface LeaveReview {
  reviewedByEmployeeId: string;
  reviewedByDisplayName: string;
  decision: 'APPROVE' | 'REJECT';
  reviewedAt: string;
  comment?: string | null;
  rejectionReason?: string | null;
}

export interface LeaveCancellation {
  cancelledAt: string;
  reason?: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  branchId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  dayPart: DayPart;
  requestedUnits: number;
  reason: string;
  status: LeaveStatus;
  review?: LeaveReview | null;
  cancellation?: LeaveCancellation | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestPage {
  items: LeaveRequest[];
  page: PageInfo;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  deepLink?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  items: Notification[];
  page: PageInfo;
}

export type ReportGroupBy = 'DAY' | 'BRANCH' | 'EMPLOYEE';

export interface AttendanceReportTotals {
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  overtimeMinutes: number;
}

export interface AttendanceReportRow {
  key: string;
  label: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  overtimeMinutes: number;
}

export interface AttendanceReport {
  fromDate: string;
  toDate: string;
  groupBy: ReportGroupBy;
  totals: AttendanceReportTotals;
  rows: AttendanceReportRow[];
}

export interface CorrectionApprovalRequest {
  comment?: string;
}

export interface CorrectionRejectionRequest {
  rejectionReason: string;
}

export interface LeaveApprovalRequest {
  comment?: string;
}

export interface LeaveRejectionRequest {
  rejectionReason: string;
}

export interface LeaveCancelRequest {
  reason?: string;
}

export interface LoginRequest {
  tenantCode: string;
  identifier: string;
  password: string;
  deviceInfo?: string;
}
