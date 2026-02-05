import { THEME } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.bg,
    padding: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: THEME.muted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
  },
  emptyCard: {
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.text,
    marginTop: 20,
  },
  emptyDesc: {
    fontSize: 16,
    color: THEME.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  logoutButtonSmall: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutTextSmall: {
    color: THEME.danger,
    fontWeight: 'bold',
  },
  lateNoticeContainerFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    width: '100%',
  },
  lateNoticeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lateNoticeText: {
    color: THEME.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  closeNoticeButton: {
    padding: 4,
  },
});
