import { DEMO_MODE, apiFetch, genIdempotencyKey } from './apiClient';
import { clearSession, loadSession, saveSession } from './secureStorage';
import * as demo from './demoData';
import type {
  AttendanceCorrectionCreateRequest,
  AttendanceCorrectionRequest,
  AttendanceCorrectionRequestPage,
  AttendanceRecordPage,
  AttendanceReport,
  AttendanceSummary,
  BranchPage,
  CorrectionApprovalRequest,
  CorrectionRejectionRequest,
  CurrentUserResponse,
  Employee,
  EmployeeCreateRequest,
  EmployeePage,
  EmployeeUpdateRequest,
  LeaveBalanceList,
  LeaveCancelRequest,
  LeaveApprovalRequest,
  LeaveRequest,
  LeaveRequestCreate,
  LeaveRequestPage,
  LeaveRejectionRequest,
  LeaveTypeList,
  LoginRequest,
  Notification,
  NotificationPage,
  Role,
  TokenResponse,
} from '@/src/types';

function delay(ms = 350) {
  return new Promise((r) => setTimeout(r, ms));
}

function paginate<T>(items: T[], cursor?: string, limit = 25): { items: T[]; page: { nextCursor: string | null; hasMore: boolean } } {
  const start = cursor ? parseInt(cursor, 10) : 0;
  const slice = items.slice(start, start + limit);
  const next = start + limit;
  return {
    items: slice,
    page: { nextCursor: next < items.length ? String(next) : null, hasMore: next < items.length },
  };
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export const authService = {
  async login(req: LoginRequest): Promise<TokenResponse> {
    if (DEMO_MODE) {
      await delay(500);
      const role: Role =
        req.identifier.toLowerCase().includes('admin') ? 'admin'
          : req.identifier.toLowerCase().includes('mgr') || req.identifier.toLowerCase().includes('ramesh') ? 'manager'
          : 'employee';
      const { token } = demo.loginForRole(role);
      await saveSession({
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: Date.now() + token.expiresInSeconds * 1000,
      });
      return token;
    }
    const res = await apiFetch<TokenResponse>('/auth/login', { method: 'POST', body: req, skipAuth: true });
    await saveSession({ accessToken: res.accessToken, refreshToken: res.refreshToken, expiresAt: Date.now() + res.expiresInSeconds * 1000 });
    return res;
  },

  async logout(): Promise<void> {
    if (DEMO_MODE) {
      await delay(200);
      await clearSession();
      return;
    }
    const session = await loadSession();
    if (session?.refreshToken) {
      try {
        await apiFetch('/auth/logout', { method: 'POST', body: { refreshToken: session.refreshToken } });
      } catch {
        // ignore
      }
    }
    await clearSession();
  },

  async getMe(): Promise<CurrentUserResponse> {
    if (DEMO_MODE) {
      await delay(300);
      const session = await loadSession();
      if (!session) throw new Error('No session');
      const role = session.accessToken.split('-')[2] as Role;
      const { me } = demo.loginForRole(role);
      return me;
    }
    return apiFetch<CurrentUserResponse>('/me');
  },
};

export const branchService = {
  async list(activeOnly = true): Promise<BranchPage> {
    if (DEMO_MODE) {
      await delay();
      return { items: demo.demoBranches.filter((b) => !activeOnly || b.isActive) };
    }
    return apiFetch<BranchPage>('/branches', { query: { activeOnly } });
  },
};

export const employeeService = {
  async list(params: { cursor?: string; limit?: number; query?: string; branchId?: string; status?: string; employmentType?: string } = {}): Promise<EmployeePage> {
    if (DEMO_MODE) {
      await delay();
      let items = clone(demo.demoEmployees);
      if (params.query) {
        const q = params.query.toLowerCase();
        items = items.filter((e) =>
          e.employeeCode.toLowerCase().includes(q) ||
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          (e.designation ?? '').toLowerCase().includes(q)
        );
      }
      if (params.status) items = items.filter((e) => e.status === params.status);
      if (params.employmentType) items = items.filter((e) => e.employmentType === params.employmentType);
      if (params.branchId) items = items.filter((e) => e.branch.id === params.branchId);
      return paginate(items, params.cursor, params.limit);
    }
    return apiFetch<EmployeePage>('/employees', { query: { ...params } });
  },

  async get(id: string): Promise<Employee> {
    if (DEMO_MODE) {
      await delay();
      const e = demo.demoEmployees.find((x) => x.id === id);
      if (!e) throw new Error('Not found');
      return clone(e);
    }
    return apiFetch<Employee>(`/employees/${id}`);
  },

  async create(req: EmployeeCreateRequest): Promise<Employee> {
    if (DEMO_MODE) {
      await delay();
      const branch = demo.demoBranches.find((b) => b.id === req.branchId) ?? demo.demoBranches[0];
      const e: Employee = {
        id: `emp-new-${Date.now()}`,
        employeeCode: req.employeeCode || `EMP-${1000 + demo.demoEmployees.length}`,
        firstName: req.firstName,
        lastName: req.lastName,
        designation: req.designation ?? null,
        employmentType: req.employmentType,
        status: 'ACTIVE',
        joiningDate: req.joiningDate,
        workEmail: req.workEmail ?? null,
        phoneNumber: req.phoneNumber ?? null,
        gender: req.gender ?? null,
        branch: { id: branch.id, code: branch.code, name: branch.name, timeZone: branch.timeZone },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demo.demoEmployees.push(e);
      return clone(e);
    }
    return apiFetch<Employee>('/employees', { method: 'POST', body: req, idempotencyKey: genIdempotencyKey() });
  },

  async update(id: string, req: EmployeeUpdateRequest): Promise<Employee> {
    if (DEMO_MODE) {
      await delay();
      const idx = demo.demoEmployees.findIndex((e) => e.id === id);
      if (idx < 0) throw new Error('Not found');
      const updated = { ...demo.demoEmployees[idx], ...req, updatedAt: new Date().toISOString() };
      if (req.branchId) {
        const b = demo.demoBranches.find((x) => x.id === req.branchId);
        if (b) updated.branch = { id: b.id, code: b.code, name: b.name, timeZone: b.timeZone };
      }
      demo.demoEmployees[idx] = updated;
      return clone(updated);
    }
    return apiFetch<Employee>(`/employees/${id}`, { method: 'PATCH', body: req });
  },
};

export const attendanceService = {
  async myRecords(fromDate: string, toDate: string, cursor?: string, limit?: number): Promise<AttendanceRecordPage> {
    if (DEMO_MODE) {
      await delay();
      const items = demo.demoAttendanceRecords.filter(
        (r) => r.businessDate >= fromDate && r.businessDate <= toDate
      );
      return paginate(items, cursor, limit);
    }
    return apiFetch<AttendanceRecordPage>('/attendance/me', { query: { fromDate, toDate, cursor, limit } });
  },

  async mySummary(fromDate: string, toDate: string): Promise<AttendanceSummary> {
    if (DEMO_MODE) {
      await delay();
      const records = demo.demoAttendanceRecords.filter(
        (r) => r.businessDate >= fromDate && r.businessDate <= toDate
      );
      return {
        fromDate,
        toDate,
        presentDays: records.filter((r) => r.status === 'PRESENT').length,
        absentDays: records.filter((r) => r.status === 'ABSENT').length,
        halfDays: records.filter((r) => r.status === 'HALF_DAY').length,
        lateCount: records.filter((r) => r.status === 'LATE').length,
        overtimeMinutes: records.reduce((s, r) => s + r.overtimeMinutes, 0),
      };
    }
    return apiFetch<AttendanceSummary>('/attendance/me/summary', { query: { fromDate, toDate } });
  },

  async records(params: { fromDate: string; toDate: string; branchId?: string; employeeId?: string; status?: string; cursor?: string; limit?: number }): Promise<AttendanceRecordPage> {
    if (DEMO_MODE) {
      await delay();
      let items = clone(demo.demoBranchAttendance);
      items = items.filter((r) => r.businessDate >= params.fromDate && r.businessDate <= params.toDate);
      if (params.employeeId) items = items.filter((r) => r.employeeId === params.employeeId);
      if (params.status) items = items.filter((r) => r.status === params.status);
      return paginate(items, params.cursor, params.limit);
    }
    return apiFetch<AttendanceRecordPage>('/attendance/records', { query: { ...params } });
  },
};

export const correctionService = {
  async list(params: { status?: string; fromDate?: string; toDate?: string; cursor?: string; limit?: number } = {}): Promise<AttendanceCorrectionRequestPage> {
    if (DEMO_MODE) {
      await delay();
      let items = clone(demo.demoCorrections);
      if (params.status) items = items.filter((c) => c.status === params.status);
      if (params.fromDate) items = items.filter((c) => c.businessDate >= params.fromDate!);
      if (params.toDate) items = items.filter((c) => c.businessDate <= params.toDate!);
      return paginate(items, params.cursor, params.limit);
    }
    return apiFetch<AttendanceCorrectionRequestPage>('/attendance/correction-requests', { query: { ...params } });
  },

  async get(id: string): Promise<AttendanceCorrectionRequest> {
    if (DEMO_MODE) {
      await delay();
      const c = demo.demoCorrections.find((x) => x.id === id);
      if (!c) throw new Error('Not found');
      return clone(c);
    }
    return apiFetch<AttendanceCorrectionRequest>(`/attendance/correction-requests/${id}`);
  },

  async create(req: AttendanceCorrectionCreateRequest): Promise<AttendanceCorrectionRequest> {
    if (DEMO_MODE) {
      await delay(600);
      const emp = demo.demoEmployees[0];
      const branch = demo.demoBranches[0];
      const dist = Math.abs(req.location.latitude - branch.latitude) * 111000 + Math.abs(req.location.longitude - branch.longitude) * 111000;
      const created: AttendanceCorrectionRequest = {
        id: `cr-new-${Date.now()}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        branchId: branch.id,
        businessDate: req.businessDate,
        punchType: req.punchType,
        claimedPunchTime: req.claimedPunchTime,
        reason: req.reason,
        submissionLocation: req.location,
        locationCapturedAt: req.locationCapturedAt,
        geofenceEvaluation: {
          distanceMeters: Math.round(dist),
          allowedRadiusMeters: branch.geofenceRadiusMeters,
          isWithinGeofence: dist <= branch.geofenceRadiusMeters,
        },
        status: 'PENDING',
        review: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demo.demoCorrections.unshift(created);
      return clone(created);
    }
    return apiFetch<AttendanceCorrectionRequest>('/attendance/correction-requests', {
      method: 'POST',
      body: req,
      idempotencyKey: genIdempotencyKey(),
    });
  },

  async approve(id: string, req: CorrectionApprovalRequest): Promise<AttendanceCorrectionRequest> {
    if (DEMO_MODE) {
      await delay(500);
      const idx = demo.demoCorrections.findIndex((c) => c.id === id);
      if (idx < 0) throw new Error('Not found');
      demo.demoCorrections[idx] = {
        ...demo.demoCorrections[idx],
        status: 'APPROVED',
        review: {
          reviewedByEmployeeId: 'emp-mgr-0001',
          reviewedByDisplayName: 'Ramesh Kumar',
          decision: 'APPROVE',
          reviewedAt: new Date().toISOString(),
          comment: req.comment ?? null,
          rejectionReason: null,
        },
        updatedAt: new Date().toISOString(),
      };
      return clone(demo.demoCorrections[idx]);
    }
    return apiFetch<AttendanceCorrectionRequest>(`/attendance/correction-requests/${id}/approve`, {
      method: 'POST',
      body: req,
      idempotencyKey: genIdempotencyKey(),
    });
  },

  async reject(id: string, req: CorrectionRejectionRequest): Promise<AttendanceCorrectionRequest> {
    if (DEMO_MODE) {
      await delay(500);
      const idx = demo.demoCorrections.findIndex((c) => c.id === id);
      if (idx < 0) throw new Error('Not found');
      demo.demoCorrections[idx] = {
        ...demo.demoCorrections[idx],
        status: 'REJECTED',
        review: {
          reviewedByEmployeeId: 'emp-mgr-0001',
          reviewedByDisplayName: 'Ramesh Kumar',
          decision: 'REJECT',
          reviewedAt: new Date().toISOString(),
          comment: null,
          rejectionReason: req.rejectionReason,
        },
        updatedAt: new Date().toISOString(),
      };
      return clone(demo.demoCorrections[idx]);
    }
    return apiFetch<AttendanceCorrectionRequest>(`/attendance/correction-requests/${id}/reject`, {
      method: 'POST',
      body: req,
      idempotencyKey: genIdempotencyKey(),
    });
  },
};

export const leaveService = {
  async listTypes(): Promise<LeaveTypeList> {
    if (DEMO_MODE) {
      await delay();
      return { items: clone(demo.demoLeaveTypes) };
    }
    return apiFetch<LeaveTypeList>('/leave-types');
  },

  async myBalances(asOfDate?: string): Promise<LeaveBalanceList> {
    if (DEMO_MODE) {
      await delay();
      return { items: clone(demo.demoLeaveBalances) };
    }
    return apiFetch<LeaveBalanceList>('/leave-balances/me', { query: { asOfDate } });
  },

  async list(params: { status?: string; fromDate?: string; toDate?: string; cursor?: string; limit?: number } = {}): Promise<LeaveRequestPage> {
    if (DEMO_MODE) {
      await delay();
      let items = clone(demo.demoLeaveRequests);
      if (params.status) items = items.filter((l) => l.status === params.status);
      return paginate(items, params.cursor, params.limit);
    }
    return apiFetch<LeaveRequestPage>('/leave-requests', { query: { ...params } });
  },

  async get(id: string): Promise<LeaveRequest> {
    if (DEMO_MODE) {
      await delay();
      const l = demo.demoLeaveRequests.find((x) => x.id === id);
      if (!l) throw new Error('Not found');
      return clone(l);
    }
    return apiFetch<LeaveRequest>(`/leave-requests/${id}`);
  },

  async create(req: LeaveRequestCreate): Promise<LeaveRequest> {
    if (DEMO_MODE) {
      await delay(600);
      const emp = demo.demoEmployees[0];
      const branch = demo.demoBranches[0];
      const lt = demo.demoLeaveTypes.find((t) => t.id === req.leaveTypeId)!;
      const days =
        Math.max(1, (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / 86400000 + 1) *
        (req.dayPart === 'FULL_DAY' ? 1 : 0.5);
      const created: LeaveRequest = {
        id: `lr-new-${Date.now()}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        branchId: branch.id,
        leaveType: lt,
        startDate: req.startDate,
        endDate: req.endDate,
        dayPart: req.dayPart ?? 'FULL_DAY',
        requestedUnits: days,
        reason: req.reason,
        status: 'PENDING',
        review: null,
        cancellation: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demo.demoLeaveRequests.unshift(created);
      return clone(created);
    }
    return apiFetch<LeaveRequest>('/leave-requests', { method: 'POST', body: req, idempotencyKey: genIdempotencyKey() });
  },

  async cancel(id: string, req: LeaveCancelRequest): Promise<LeaveRequest> {
    if (DEMO_MODE) {
      await delay(500);
      const idx = demo.demoLeaveRequests.findIndex((l) => l.id === id);
      if (idx < 0) throw new Error('Not found');
      demo.demoLeaveRequests[idx] = {
        ...demo.demoLeaveRequests[idx],
        status: 'CANCELLED',
        cancellation: { cancelledAt: new Date().toISOString(), reason: req.reason ?? null },
        updatedAt: new Date().toISOString(),
      };
      return clone(demo.demoLeaveRequests[idx]);
    }
    return apiFetch<LeaveRequest>(`/leave-requests/${id}/cancel`, { method: 'POST', body: req });
  },

  async approve(id: string, req: LeaveApprovalRequest): Promise<LeaveRequest> {
    if (DEMO_MODE) {
      await delay(500);
      const idx = demo.demoLeaveRequests.findIndex((l) => l.id === id);
      if (idx < 0) throw new Error('Not found');
      demo.demoLeaveRequests[idx] = {
        ...demo.demoLeaveRequests[idx],
        status: 'APPROVED',
        review: {
          reviewedByEmployeeId: 'emp-mgr-0001',
          reviewedByDisplayName: 'Ramesh Kumar',
          decision: 'APPROVE',
          reviewedAt: new Date().toISOString(),
          comment: req.comment ?? null,
          rejectionReason: null,
        },
        updatedAt: new Date().toISOString(),
      };
      return clone(demo.demoLeaveRequests[idx]);
    }
    return apiFetch<LeaveRequest>(`/leave-requests/${id}/approve`, { method: 'POST', body: req, idempotencyKey: genIdempotencyKey() });
  },

  async reject(id: string, req: LeaveRejectionRequest): Promise<LeaveRequest> {
    if (DEMO_MODE) {
      await delay(500);
      const idx = demo.demoLeaveRequests.findIndex((l) => l.id === id);
      if (idx < 0) throw new Error('Not found');
      demo.demoLeaveRequests[idx] = {
        ...demo.demoLeaveRequests[idx],
        status: 'REJECTED',
        review: {
          reviewedByEmployeeId: 'emp-mgr-0001',
          reviewedByDisplayName: 'Ramesh Kumar',
          decision: 'REJECT',
          reviewedAt: new Date().toISOString(),
          comment: null,
          rejectionReason: req.rejectionReason,
        },
        updatedAt: new Date().toISOString(),
      };
      return clone(demo.demoLeaveRequests[idx]);
    }
    return apiFetch<LeaveRequest>(`/leave-requests/${id}/reject`, { method: 'POST', body: req, idempotencyKey: genIdempotencyKey() });
  },
};

export const notificationService = {
  async list(params: { unreadOnly?: boolean; cursor?: string; limit?: number } = {}): Promise<NotificationPage> {
    if (DEMO_MODE) {
      await delay();
      let items = clone(demo.demoNotifications);
      if (params.unreadOnly) items = items.filter((n) => !n.isRead);
      return paginate(items, params.cursor, params.limit);
    }
    return apiFetch<NotificationPage>('/notifications', { query: { ...params } });
  },

  async updateRead(id: string, isRead: boolean): Promise<Notification> {
    if (DEMO_MODE) {
      await delay(200);
      const idx = demo.demoNotifications.findIndex((n) => n.id === id);
      if (idx < 0) throw new Error('Not found');
      demo.demoNotifications[idx] = { ...demo.demoNotifications[idx], isRead };
      return clone(demo.demoNotifications[idx]);
    }
    return apiFetch<Notification>(`/notifications/${id}`, { method: 'PATCH', body: { isRead } });
  },

  async markAllRead(): Promise<void> {
    if (DEMO_MODE) {
      await delay(300);
      demo.demoNotifications.forEach((n) => (n.isRead = true));
      return;
    }
    await apiFetch('/notifications/read-all', { method: 'POST' });
  },
};

export const reportService = {
  async attendance(params: { fromDate: string; toDate: string; branchId?: string; groupBy?: 'DAY' | 'BRANCH' | 'EMPLOYEE' }): Promise<AttendanceReport> {
    if (DEMO_MODE) {
      await delay();
      return clone(demo.demoAttendanceReport);
    }
    return apiFetch<AttendanceReport>('/reports/attendance', { query: { ...params } });
  },
};
