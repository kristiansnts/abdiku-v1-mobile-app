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
      ok: 'OK',
      at: 'at',
    },

    // Tabs
    tabs: {
      attendance: 'Attendance',
      requests: 'Requests',
      profile: 'Profile',
    },

    // Home/Attendance Screen
    home: {
      greeting: 'Welcome,',
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
      outsideShift: 'Outside Shift Hours',
      shiftTime: 'Shift',
      late: 'Late',
      lateBy: 'Late by',
      hours: 'hr',
      hour: 'hr',
      minutes: 'min',
      minute: 'min',
      clockInSuccess: 'Successfully clocked in!',
      clockOutSuccess: 'Successfully clocked out!',
      pendingSync: 'Pending sync',
      offlineClockIn: 'Clock in saved offline. Will sync when connected.',
      offlineClockOut: 'Clock out saved offline. Will sync when connected.',
      holiday: 'Public Holiday',
      holidayEnjoy: 'Enjoy your day off! Attendance is closed for today.',
    },

    // Attendance Detail
    attendanceDetail: {
      title: 'Attendance Detail',
      clockTimes: 'Clock Times',
      shift: 'Shift',
      shiftName: 'Name',
      schedule: 'Schedule',
      location: 'Location',
      evidence: 'Evidence',
      gpsLocation: 'GPS Location',
      deviceInfo: 'Device Info',
      relatedRequests: 'Related Requests',
      submitLateRequest: 'Submit Late Request',
    },

    // Activity Types
    activityTypes: {
      clockIn: 'Clock In',
      clockOut: 'Clock Out',
      late: 'Late Request',
      leave: 'Leave',
      correction: 'Correction',
      missing: 'Missing',
    },

    // Attendance Status
    status: {
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending Review',
      locked: 'Locked',
    },

    // Requests Screen
    requests: {
      title: 'My Requests',
      newRequest: 'New Request',
      noRequests: 'No requests yet',
      selectType: 'Select Request Type',
      lateRequest: 'Late Justification',
      lateDesc: 'Justify your late arrival',
      correctionRequest: 'Time Correction',
      correctionDesc: 'Correct clock in/out time',
      missingRequest: 'Missing Attendance',
      missingDesc: 'Request for forgotten attendance',
      selectAttendance: 'Select Attendance',
      selectDate: 'Select Date',
      clockInTime: 'Clock In Time',
      clockOutTime: 'Clock Out Time',
      reason: 'Reason',
      reasonPlaceholder: 'Enter your reason...',
      submit: 'Submit Request',
      cancel: 'Cancel',
      reviewedBy: 'Reviewed by',
      reviewerNotes: 'Reviewer Notes',
      createdAt: 'Submitted',
      deleteConfirm: 'Delete this request?',
      deleteSuccess: 'Request deleted',
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
      mockLocationTitle: '⚠️ Mock Location Detected',
      mockLocationBanner: 'Fake GPS detected. Please disable mock location apps to continue.',
    },

    // Profile Screen
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      employmentDetails: 'Employment Details',
      compensation: 'Compensation',
      salaryDetails: 'Salary Details',
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
      viewDetails: 'View Details',
      department: 'Department',
      position: 'Position',
      employeeId: 'Employee ID',
      employeeType: 'Employee Type',
      workLocation: 'Work Location',
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
      mockLocationDetected: 'Mock Location Detected',
      mockLocationMessage: 'We detected that you are using a fake GPS location. Please disable any mock location apps and use your real GPS location for attendance.',
      mockLocationBlocked: 'Cannot perform attendance action while using fake GPS. Please disable mock location apps and try again.',
      mockLocationError: '⚠️ Mock/Fake GPS detected! Please disable mock location apps.',
    },

    // Login Screen
    login: {
      title: 'Abdiku',
      subtitle: 'Attendance System',
      emailPlaceholder: 'Email Address',
      passwordPlaceholder: 'Password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      fillAllFields: 'Please fill in all fields',
      loginFailed: 'Login failed',
      deviceConflict: 'Device Conflict',
      deviceConflictMessage: 'Account is active on "{activeDevice}". Do you want to logout from that device and login here?',
      yesLoginHere: 'Yes, Login Here',
      version: 'Version',
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
      ok: 'OK',
      at: 'pukul',
    },

    // Tabs
    tabs: {
      attendance: 'Kehadiran',
      requests: 'Pengajuan',
      profile: 'Profil',
    },

    // Home/Attendance Screen
    home: {
      greeting: 'Selamat Datang,',
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
      outsideShift: 'Di Luar Jam Kerja',
      shiftTime: 'Shift',
      late: 'Terlambat',
      lateBy: 'Terlambat',
      hours: 'jam',
      hour: 'jam',
      minutes: 'menit',
      minute: 'menit',
      clockInSuccess: 'Berhasil masuk!',
      clockOutSuccess: 'Berhasil pulang!',
      pendingSync: 'Menunggu sinkronisasi',
      offlineClockIn: 'Absen masuk disimpan offline. Akan disinkronkan saat terhubung.',
      offlineClockOut: 'Absen pulang disimpan offline. Akan disinkronkan saat terhubung.',
      holiday: 'Hari Libur Nasional',
      holidayEnjoy: 'Selamat berlibur! Absensi ditutup untuk hari ini.',
    },

    // Attendance Detail
    attendanceDetail: {
      title: 'Detail Kehadiran',
      clockTimes: 'Waktu Absen',
      shift: 'Shift',
      shiftName: 'Nama',
      schedule: 'Jadwal',
      location: 'Lokasi',
      evidence: 'Bukti',
      gpsLocation: 'Lokasi GPS',
      deviceInfo: 'Info Perangkat',
      relatedRequests: 'Pengajuan Terkait',
      submitLateRequest: 'Ajukan Keterlambatan',
    },

    // Activity Types
    activityTypes: {
      clockIn: 'Absen Masuk',
      clockOut: 'Absen Pulang',
      late: 'Justifikasi Telat',
      leave: 'Cuti/Izin',
      correction: 'Koreksi Waktu',
      missing: 'Absen Terlewat',
    },

    // Attendance Status
    status: {
      approved: 'Disetujui',
      rejected: 'Ditolak',
      pending: 'Menunggu Review',
      locked: 'Terkunci',
    },

    // Requests Screen
    requests: {
      title: 'Pengajuan Saya',
      newRequest: 'Pengajuan Baru',
      noRequests: 'Belum ada pengajuan',
      selectType: 'Pilih Jenis Pengajuan',
      lateRequest: 'Justifikasi Terlambat',
      lateDesc: 'Jelaskan alasan keterlambatan',
      correctionRequest: 'Koreksi Waktu',
      correctionDesc: 'Koreksi waktu masuk/pulang',
      missingRequest: 'Kehadiran Terlewat',
      missingDesc: 'Pengajuan untuk kehadiran yang lupa dicatat',
      selectAttendance: 'Pilih Kehadiran',
      selectDate: 'Pilih Tanggal',
      clockInTime: 'Waktu Masuk',
      clockOutTime: 'Waktu Pulang',
      reason: 'Alasan',
      reasonPlaceholder: 'Masukkan alasan Anda...',
      submit: 'Kirim Pengajuan',
      cancel: 'Batal',
      reviewedBy: 'Ditinjau oleh',
      reviewerNotes: 'Catatan Peninjau',
      createdAt: 'Diajukan',
      deleteConfirm: 'Hapus pengajuan ini?',
      deleteSuccess: 'Pengajuan dihapus',
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
      mockLocationTitle: '⚠️ Lokasi Palsu Terdeteksi',
      mockLocationBanner: 'GPS palsu terdeteksi. Silakan nonaktifkan aplikasi lokasi palsu untuk melanjutkan.',
    },

    // Profile Screen
    profile: {
      title: 'Profil',
      personalInfo: 'Informasi Pribadi',
      employmentDetails: 'Detail Kepegawaian',
      compensation: 'Kompensasi',
      salaryDetails: 'Detail Gaji',
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
      viewDetails: 'Lihat Detail',
      department: 'Departemen',
      position: 'Jabatan',
      employeeId: 'ID Karyawan',
      employeeType: 'Tipe Karyawan',
      workLocation: 'Lokasi Kerja',
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
      mockLocationDetected: 'Lokasi Palsu Terdeteksi',
      mockLocationMessage: 'Kami mendeteksi bahwa Anda menggunakan lokasi GPS palsu. Silakan nonaktifkan aplikasi lokasi palsu dan gunakan lokasi GPS asli Anda untuk kehadiran.',
      mockLocationBlocked: 'Tidak dapat melakukan absensi saat menggunakan GPS palsu. Silakan nonaktifkan aplikasi lokasi palsu dan coba lagi.',
      mockLocationError: '⚠️ GPS Palsu terdeteksi! Silakan nonaktifkan aplikasi lokasi palsu.',
    },

    // Login Screen
    login: {
      title: 'Abdiku',
      subtitle: 'Sistem Absensi',
      emailPlaceholder: 'Alamat Email',
      passwordPlaceholder: 'Kata Sandi',
      signIn: 'Masuk',
      signingIn: 'Sedang masuk...',
      fillAllFields: 'Harap isi semua kolom',
      loginFailed: 'Login gagal',
      deviceConflict: 'Konflik Perangkat',
      deviceConflictMessage: 'Akun aktif di "{activeDevice}". Apakah Anda ingin keluar dari perangkat tersebut dan masuk di sini?',
      yesLoginHere: 'Ya, Masuk di Sini',
      version: 'Versi',
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.en;
