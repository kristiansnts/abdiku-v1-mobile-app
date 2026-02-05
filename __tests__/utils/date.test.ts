import {
  formatDate,
  formatTime,
  parseTimeString,
  formatDateString,
  extractShortTime,
  DatePattern,
} from '../../utils/date';

describe('date utilities', () => {
  describe('formatDate', () => {
    const testDate = new Date('2024-03-15T14:30:45');

    it('formats time pattern correctly for English', () => {
      const result = formatDate(testDate, 'time', 'en');
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('formats fullDate pattern correctly for English', () => {
      const result = formatDate(testDate, 'fullDate', 'en');
      expect(result).toContain('March');
      expect(result).toContain('2024');
    });

    it('formats shortTime pattern correctly', () => {
      const result = formatDate(testDate, 'shortTime', 'en');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('formats historyDate pattern correctly', () => {
      const result = formatDate(testDate, 'historyDate', 'en');
      expect(result).toContain('15');
    });

    it('formats dateTime pattern correctly', () => {
      const result = formatDate(testDate, 'dateTime', 'en');
      expect(result).toContain('15');
    });

    it('formats shortDate pattern correctly', () => {
      const result = formatDate(testDate, 'shortDate', 'en');
      expect(result).toContain('2024');
    });

    it('uses Indonesian locale for id language', () => {
      const result = formatDate(testDate, 'fullDate', 'id');
      expect(result).toContain('2024');
    });
  });

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const testDate = new Date('2024-03-15T14:30:00');
      const result = formatTime(testDate, 'en');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('parseTimeString', () => {
    it('parses HH:MM:SS format', () => {
      const result = parseTimeString('14:30:45');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });

    it('parses HH:MM format', () => {
      const result = parseTimeString('09:15');
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(15);
    });
  });

  describe('formatDateString', () => {
    it('formats date string correctly', () => {
      const result = formatDateString('2024-03-15T14:30:00', 'shortDate', 'en');
      expect(result).toContain('2024');
    });
  });

  describe('extractShortTime', () => {
    it('extracts HH:MM from time string', () => {
      expect(extractShortTime('14:30:45')).toBe('14:30');
    });

    it('returns dash for null', () => {
      expect(extractShortTime(null)).toBe('-');
    });

    it('returns dash for empty string', () => {
      expect(extractShortTime('')).toBe('-');
    });
  });
});
