import {
  getStatusTranslation,
  getStatusColor,
  getRequestStatusText,
  getRequestTypeText,
} from '../../utils/status';
import { RequestType, RequestStatus } from '../../types/attendance';

// Mock translation object
const mockTranslations = {
  status: {
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',
    locked: 'Locked',
  },
  requests: {
    lateRequest: 'Late Request',
    correctionRequest: 'Correction Request',
    missingRequest: 'Missing Attendance',
  },
} as any;

describe('status utilities', () => {
  describe('getStatusTranslation', () => {
    it('translates approved status', () => {
      expect(getStatusTranslation('approved', mockTranslations)).toBe('Approved');
    });

    it('translates rejected status', () => {
      expect(getStatusTranslation('rejected', mockTranslations)).toBe('Rejected');
    });

    it('translates pending status', () => {
      expect(getStatusTranslation('pending', mockTranslations)).toBe('Pending');
    });

    it('translates locked status', () => {
      expect(getStatusTranslation('locked', mockTranslations)).toBe('Locked');
    });

    it('handles uppercase status', () => {
      expect(getStatusTranslation('APPROVED', mockTranslations)).toBe('Approved');
    });

    it('returns original status for unknown', () => {
      expect(getStatusTranslation('unknown', mockTranslations)).toBe('unknown');
    });
  });

  describe('getStatusColor', () => {
    it('returns success color for APPROVED', () => {
      const color = getStatusColor('APPROVED');
      expect(color).toBe('#10b981'); // THEME.success
    });

    it('returns danger color for REJECTED', () => {
      const color = getStatusColor('REJECTED');
      expect(color).toBe('#f43f5e'); // THEME.danger
    });

    it('returns amber color for PENDING', () => {
      const color = getStatusColor('PENDING');
      expect(color).toBe('#f59e0b');
    });

    it('handles lowercase status', () => {
      const color = getStatusColor('approved');
      expect(color).toBe('#10b981');
    });

    it('returns muted color for unknown status', () => {
      const color = getStatusColor('unknown');
      expect(color).toBe('#64748b'); // THEME.muted
    });
  });

  describe('getRequestStatusText', () => {
    it('returns translated text for APPROVED', () => {
      expect(getRequestStatusText('APPROVED', mockTranslations)).toBe('Approved');
    });

    it('returns translated text for REJECTED', () => {
      expect(getRequestStatusText('REJECTED', mockTranslations)).toBe('Rejected');
    });

    it('returns translated text for PENDING', () => {
      expect(getRequestStatusText('PENDING', mockTranslations)).toBe('Pending');
    });
  });

  describe('getRequestTypeText', () => {
    it('returns translated text for LATE', () => {
      expect(getRequestTypeText('LATE', mockTranslations)).toBe('Late Request');
    });

    it('returns translated text for CORRECTION', () => {
      expect(getRequestTypeText('CORRECTION', mockTranslations)).toBe('Correction Request');
    });

    it('returns translated text for MISSING', () => {
      expect(getRequestTypeText('MISSING', mockTranslations)).toBe('Missing Attendance');
    });
  });
});
