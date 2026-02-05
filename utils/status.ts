import { THEME } from '@/constants/theme';
import { TranslationKeys } from '@/constants/translations';
import { RequestType, RequestStatus } from '@/types/attendance';

/**
 * Get translated text for attendance status
 */
export const getStatusTranslation = (status: string, t: TranslationKeys): string => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'approved':
      return t.status.approved;
    case 'rejected':
      return t.status.rejected;
    case 'pending':
      return t.status.pending;
    case 'locked':
      return t.status.locked;
    default:
      return status;
  }
};

/**
 * Get color for request/attendance status
 */
export const getStatusColor = (status: string | RequestStatus): string => {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return THEME.success;
    case 'REJECTED':
      return THEME.danger;
    case 'PENDING':
      return '#f59e0b'; // amber
    default:
      return THEME.muted;
  }
};

/**
 * Get translated text for request status
 */
export const getRequestStatusText = (status: RequestStatus, t: TranslationKeys): string => {
  switch (status) {
    case 'APPROVED':
      return t.status.approved;
    case 'REJECTED':
      return t.status.rejected;
    case 'PENDING':
      return t.status.pending;
    default:
      return status;
  }
};

/**
 * Get translated text for request type
 */
export const getRequestTypeText = (type: RequestType, t: TranslationKeys): string => {
  switch (type) {
    case 'LATE':
      return t.requests.lateRequest;
    case 'CORRECTION':
      return t.requests.correctionRequest;
    case 'MISSING':
      return t.requests.missingRequest;
    default:
      return type;
  }
};
