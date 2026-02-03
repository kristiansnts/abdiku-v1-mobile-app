export const translations = {
  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      retry: 'Retry',
      close: 'Close',
    },

    // Tabs
    tabs: {
      attendance: 'Attendance',
      profile: 'Profile',
    },

    // Home/Attendance Screen
    home: {
      greeting: 'Good Morning,',
      clockIn: 'Clock In',
      clockOut: 'Clock Out',
      clockInNow: 'Clock In Now',
      clockOutNow: 'Clock Out Now',
      attendanceCompleted: 'Attendance Completed',
      recentActivity: 'Recent Activity',
      viewHistory: 'View History',
      noActivity: 'No recent activity',
      insideArea: 'Inside',
      outsideArea: 'Outside Area',
    },

    // Attendance Status
    status: {
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending Review',
      locked: 'Locked',
    },

    // Map Modal
    map: {
      confirmClockIn: 'Confirm Clock In',
      confirmClockOut: 'Confirm Clock Out',
      gatheringLocation: 'Gathering location...',
      verifyingLocation: 'Verifying Location...',
      gpsWeak: 'GPS signal weak. Still searching...',
      retryGps: 'Retry GPS Search',
      matched: 'Matched',
      outsideAttendanceArea: 'Outside Attendance Area',
      locationVerified: 'Your location has been verified. You can proceed with the attendance.',
      outsideWarning: 'Warning: You are currently outside the designated office area. This attendance might require HR approval.',
      pleaseWait: 'Please wait while we verify your current position...',
    },

    // Profile Screen
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      employmentDetails: 'Employment Details',
      compensation: 'Compensation',
      joinDate: 'Join Date',
      status: 'Status',
      baseSalary: 'Base Salary',
      totalAllowances: 'Total Allowances',
      totalCompensation: 'Total',
      settings: 'Settings',
      language: 'Language',
      selectLanguage: 'Select Language',
      account: 'Account',
      signOut: 'Sign Out',
      version: 'Version',
    },

    // Languages
    languages: {
      en: 'English',
      id: 'Bahasa Indonesia',
    },

    // Errors
    errors: {
      locationPermissionDenied: 'Location permission denied',
      locationServicesDisabled: 'Location services are disabled on this device',
      locationUnavailable: 'Location unavailable',
      sessionError: 'Session error',
      operationFailed: 'Operation failed',
    },
  },

  id: {
    // Common
    common: {
      loading: 'Memuat...',
      error: 'Kesalahan',
      success: 'Berhasil',
      cancel: 'Batal',
      confirm: 'Konfirmasi',
      retry: 'Coba Lagi',
      close: 'Tutup',
    },

    // Tabs
    tabs: {
      attendance: 'Kehadiran',
      profile: 'Profil',
    },

    // Home/Attendance Screen
    home: {
      greeting: 'Selamat Pagi,',
      clockIn: 'Masuk',
      clockOut: 'Pulang',
      clockInNow: 'Masuk Sekarang',
      clockOutNow: 'Pulang Sekarang',
      attendanceCompleted: 'Kehadiran Selesai',
      recentActivity: 'Aktivitas Terkini',
      viewHistory: 'Lihat Riwayat',
      noActivity: 'Tidak ada aktivitas terkini',
      insideArea: 'Di Dalam',
      outsideArea: 'Di Luar Area',
    },

    // Attendance Status
    status: {
      approved: 'Disetujui',
      rejected: 'Ditolak',
      pending: 'Menunggu Review',
      locked: 'Terkunci',
    },

    // Map Modal
    map: {
      confirmClockIn: 'Konfirmasi Masuk',
      confirmClockOut: 'Konfirmasi Pulang',
      gatheringLocation: 'Mengambil lokasi...',
      verifyingLocation: 'Memverifikasi Lokasi...',
      gpsWeak: 'Sinyal GPS lemah. Masih mencari...',
      retryGps: 'Coba Lagi Pencarian GPS',
      matched: 'Cocok',
      outsideAttendanceArea: 'Di Luar Area Kehadiran',
      locationVerified: 'Lokasi Anda telah diverifikasi. Anda dapat melanjutkan kehadiran.',
      outsideWarning: 'Peringatan: Anda saat ini berada di luar area kantor yang ditentukan. Kehadiran ini mungkin memerlukan persetujuan HR.',
      pleaseWait: 'Harap tunggu sementara kami memverifikasi posisi Anda saat ini...',
    },

    // Profile Screen
    profile: {
      title: 'Profil',
      personalInfo: 'Informasi Pribadi',
      employmentDetails: 'Detail Kepegawaian',
      compensation: 'Kompensasi',
      joinDate: 'Tanggal Bergabung',
      status: 'Status',
      baseSalary: 'Gaji Pokok',
      totalAllowances: 'Total Tunjangan',
      totalCompensation: 'Total',
      settings: 'Pengaturan',
      language: 'Bahasa',
      selectLanguage: 'Pilih Bahasa',
      account: 'Akun',
      signOut: 'Keluar',
      version: 'Versi',
    },

    // Languages
    languages: {
      en: 'English',
      id: 'Bahasa Indonesia',
    },

    // Errors
    errors: {
      locationPermissionDenied: 'Izin lokasi ditolak',
      locationServicesDisabled: 'Layanan lokasi dinonaktifkan pada perangkat ini',
      locationUnavailable: 'Lokasi tidak tersedia',
      sessionError: 'Kesalahan sesi',
      operationFailed: 'Operasi gagal',
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.en;
