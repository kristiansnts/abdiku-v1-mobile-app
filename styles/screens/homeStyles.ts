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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: THEME.muted,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  emptyCard: {
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    marginTop: 24,
  },
  emptyDesc: {
    fontSize: 16,
    color: THEME.muted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 26,
  },
  logoutButtonSmall: {
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  logoutTextSmall: {
    color: THEME.danger,
    fontWeight: 'bold',
    fontSize: 16,
  },
  lateNoticeContainerFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    gap: 8,
  },
  lateNoticeText: {
    color: THEME.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  closeNoticeButton: {
    padding: 6,
  },
});
