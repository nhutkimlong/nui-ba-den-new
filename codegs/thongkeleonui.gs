// --- Configuration ---
const SPREADSHEET_ID = '1mAQNIo2QVfl4uNiuyVS2lAiSEnA40AkDrnIhoBRQGag'; // ID của Google Sheet của bạn
const SHEET_NAME = 'Sheet1';              // Tên trang tính chứa dữ liệu

// Column indices (0-based)
const COL_INDEX = {
  TIMESTAMP: 0,         // A - Timestamp
  LEADER_NAME: 1,       // B - LeaderName
  PHONE: 2,             // C - PhoneNumber
  BIRTHDAY: 3,          // D - Birthday
  CCCD: 4,              // E - CCCD
  ADDRESS: 5,           // F - Address
  GROUP_SIZE: 6,        // G - GroupSize
  EMAIL: 7,             // H - Email
  CLIMB_DATE: 8,        // I - ClimbDate
  CLIMB_TIME: 9,        // J - ClimbTime
  SAFETY_COMMIT: 10,    // K - SafetyCommit
  MEMBER_LIST: 11,      // L - MemberList
  STATUS: 12,           // M - Status
  CERTIFICATE_LINKS: 13,// N - CertificateLinks
  SIGNATURE_IMAGE: 14   // O - SignatureImage
};

// --- Main Function ---
function doGet(e) {
  let action = e.parameter.action;
  let responseData = {};

  try {
    const data = getSheetData();
    let resultData = null;

    switch (action) {
      case 'getAllDashboardData':
        resultData = handleGetAllDashboardData(data);
        break;
      case 'getInitialStats':
        resultData = handleGetInitialStats(data);
        break;
      case 'getPeriodStats':
        let startDateStr = e.parameter.startDate;
        let endDateStr = e.parameter.endDate;
        resultData = handleGetPeriodStats(data, startDateStr, endDateStr);
        break;
      case 'searchPhone':
        let phone = e.parameter.phone;
        resultData = handleSearchPhone(data, phone);
        break;
      case 'getDailyChartData':
        resultData = handleGetDailyChartData(data);
        break;
      case 'getMonthlyChartData':
        resultData = handleGetMonthlyChartData(data);
        break;
      case 'getRecentRegistrations':
        let limit = e.parameter.limit ? parseInt(e.parameter.limit) : 10;
        resultData = handleGetRecentRegistrations(data, limit);
        break;
      default:
        throw new Error('Hành động không hợp lệ.');
    }

    responseData = {
      success: true,
      data: resultData
    };

  } catch (error) {
    Logger.log('Error in doGet: ' + error.message + ' Stack: ' + error.stack);
    responseData = {
      success: false,
      message: 'Đã xảy ra lỗi: ' + error.message,
      error: error.message
    };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
                      .setMimeType(ContentService.MimeType.JSON);
}

// Test function to verify timestamp parsing
function testTimestampParsing() {
  const testCases = [
    "21/08/2025 4:12:36",
    "21/08/2025 5:56:47", 
    "21/08/2025 6:00:20",
    "22/08/2025 5:55:17",
    "22/08/2025 6:45:55"
  ];
  
  console.log("Testing timestamp parsing:");
  testCases.forEach(testCase => {
    const parsed = parseDateCell(testCase);
    console.log(`${testCase} -> ${parsed ? parsed.toISOString() : 'INVALID'}`);
  });
}

// --- Data Retrieval ---
function getSheetData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Không tìm thấy trang tính có tên "${SHEET_NAME}".`);
    }
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return []; // No data rows
    }
    const numCols = Math.max(...Object.values(COL_INDEX)) + 1;
    const range = sheet.getRange(2, 1, lastRow - 1, numCols);
    return range.getValues();
  } catch (error) {
     Logger.log('Error getting sheet data: ' + error.message);
     throw new Error('Lỗi khi truy cập Google Sheet: ' + error.message);
  }
}

// --- Utility Functions ---
function parseDateCell(cellValue) {
    if (!cellValue) return null;
    let date;
    
    if (cellValue instanceof Date) {
        date = cellValue;
    } else {
        // Handle string format like "21/08/2025 4:12:36"
        const stringValue = String(cellValue).trim();
        if (stringValue.match(/^\d{2}\/\d{2}\/\d{4} \d{1,2}:\d{2}:\d{2}$/)) {
            // Parse DD/MM/YYYY HH:MM:SS format
            const parts = stringValue.split(' ');
            const datePart = parts[0].split('/');
            const timePart = parts[1].split(':');
            
            const day = parseInt(datePart[0], 10);
            const month = parseInt(datePart[1], 10) - 1; // Month is 0-based
            const year = parseInt(datePart[2], 10);
            const hour = parseInt(timePart[0], 10);
            const minute = parseInt(timePart[1], 10);
            const second = parseInt(timePart[2], 10);
            
            date = new Date(year, month, day, hour, minute, second);
        } else {
            // Try standard Date parsing
            date = new Date(cellValue);
        }
    }
    
    if (isNaN(date.getTime())) {
        Logger.log(`Invalid date format encountered: ${cellValue}`);
        return null;
    }
    return date;
}

function parseGroupSizeCell(cellValue) {
    if (cellValue === null || cellValue === undefined || cellValue === '') return null;
    const groupSize = parseInt(cellValue, 10);
    if (isNaN(groupSize) || groupSize < 0) {
        Logger.log(`Invalid group size encountered: ${cellValue}`);
        return null;
    }
    return groupSize;
}

// --- Action Handlers ---
function handleGetAllDashboardData(data) {
  const initialStats = handleGetInitialStats(data);
  const dailyChartData = handleGetDailyChartData(data);
  const monthlyChartData = handleGetMonthlyChartData(data);
  const visitorTypeData = handleGetVisitorTypeData(data);
  const growthTrendData = handleGetGrowthTrendData(data);
  const executiveSummary = generateExecutiveSummary(data, initialStats);

  return {
    initialStats: initialStats,
    dailyChart: dailyChartData,
    monthlyChart: monthlyChartData,
    visitorTypeData: visitorTypeData,
    growthTrendData: growthTrendData,
    executiveSummary: executiveSummary
  };
}

function handleGetInitialStats(data) {
  let monthlyCount = 0;
  let yearlyCount = 0;
  let totalCertificates = 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  data.forEach(row => {
    const timestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
    const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
    const certificateLinks = row[COL_INDEX.CERTIFICATE_LINKS];

    if (timestampDate && groupSize !== null) {
        const rowYear = timestampDate.getFullYear();
        const rowMonth = timestampDate.getMonth();
        if (rowYear === currentYear) {
          yearlyCount += groupSize;
          if (rowMonth === currentMonth) {
            monthlyCount += groupSize;
          }
        }
    }
    
    // Count certificates - parse JSON array and count individual certificates
    if (certificateLinks && String(certificateLinks).trim() !== '' && String(certificateLinks).trim() !== 'N/A') {
      try {
        // Try to parse as JSON array
        const certificatesArray = JSON.parse(String(certificateLinks));
        if (Array.isArray(certificatesArray)) {
          // Count each certificate in the array
          totalCertificates += certificatesArray.length;
        } else {
          // If it's not an array but has content, count as 1
          totalCertificates += 1;
        }
      } catch (e) {
        // If JSON parsing fails, treat as single certificate
        Logger.log(`Failed to parse certificate JSON: ${e.message}`);
        totalCertificates += 1;
      }
    }
  });
  return { monthlyCount: monthlyCount, yearlyCount: yearlyCount, totalCertificates: totalCertificates };
}

function handleGetPeriodStats(data, startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    throw new Error('Vui lòng cung cấp ngày bắt đầu và ngày kết thúc.');
  }
  let periodCount = 0;
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Định dạng ngày không hợp lệ.');
  }
  if (startDate > endDate) {
    throw new Error('Ngày bắt đầu không được sau ngày kết thúc.');
  }

  data.forEach(row => {
    const timestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
    const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
    if (timestampDate && groupSize !== null) {
        if (timestampDate >= startDate && timestampDate <= endDate) {
          periodCount += groupSize;
        }
    }
  });
  return { periodCount: periodCount };
}

function handleSearchPhone(data, phone) {
  if (!phone) {
    throw new Error('Vui lòng cung cấp số điện thoại để tìm kiếm.');
  }
  const searchTerm = phone.trim().replace(/\s+/g, '');
  let results = [];
  const scriptTimeZone = Session.getScriptTimeZone();
  const dateFormat = "dd/MM/yyyy";
  const timeFormat = "HH:mm";

  data.forEach((row, index) => {
    const rowPhoneNumber = row[COL_INDEX.PHONE];

    if (rowPhoneNumber != null && String(rowPhoneNumber).trim().replace(/\s+/g, '') === searchTerm) {
       const registrationTimestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
       const climbDate = parseDateCell(row[COL_INDEX.CLIMB_DATE]);
       const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
       const leaderName = row[COL_INDEX.LEADER_NAME];
       const address = row[COL_INDEX.ADDRESS];
       const certificateLinks = row[COL_INDEX.CERTIFICATE_LINKS];

       let formattedRegistrationDate = registrationTimestampDate
          ? Utilities.formatDate(registrationTimestampDate, scriptTimeZone, dateFormat)
          : '(Ngày ĐK không hợp lệ)';
       let formattedRegistrationTime = registrationTimestampDate
          ? Utilities.formatDate(registrationTimestampDate, scriptTimeZone, timeFormat)
          : '(không có)';
       let formattedClimbDate = climbDate
          ? Utilities.formatDate(climbDate, scriptTimeZone, dateFormat)
          : '(không có)';

        // Count certificates for this registration
        let certificateCount = 0;
        if (certificateLinks && String(certificateLinks).trim() !== '' && String(certificateLinks).trim() !== 'N/A') {
          try {
            const certificatesArray = JSON.parse(String(certificateLinks));
            if (Array.isArray(certificatesArray)) {
              certificateCount = certificatesArray.length;
            } else {
              certificateCount = 1;
            }
          } catch (e) {
            certificateCount = 1;
          }
        }

        results.push({
            timestamp: formattedRegistrationDate,
            registrationTime: formattedRegistrationTime,
            leaderName: leaderName || '(không có)',
            phone: String(rowPhoneNumber),
            memberCount: groupSize !== null ? groupSize : '(không có)',
            trekDate: formattedClimbDate,
            address: address || '(không có)',
            certificateCount: certificateCount,
            _originalTimestamp: registrationTimestampDate
        });
    }
  });

  results.sort((a, b) => {
      const timeA = a._originalTimestamp ? a._originalTimestamp.getTime() : 0;
      const timeB = b._originalTimestamp ? b._originalTimestamp.getTime() : 0;
      return timeB - timeA;
  });

  return results.map(item => {
     delete item._originalTimestamp;
     return item;
  });
}

function handleGetDailyChartData(data) {
    const dailyCounts = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const scriptTimeZone = Session.getScriptTimeZone();
    const dateLabels = [];
    const tempDate = new Date(thirtyDaysAgo);

    while (tempDate <= today) {
        const formattedDate = Utilities.formatDate(tempDate, scriptTimeZone, "dd/MM");
        dateLabels.push(formattedDate);
        dailyCounts[formattedDate] = 0;
        tempDate.setDate(tempDate.getDate() + 1);
    }

    data.forEach(row => {
        const timestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
        const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
        if (timestampDate && groupSize !== null && timestampDate >= thirtyDaysAgo && timestampDate <= today) {
            const dayKey = Utilities.formatDate(timestampDate, scriptTimeZone, "dd/MM");
            if (dailyCounts.hasOwnProperty(dayKey)) {
               dailyCounts[dayKey] += groupSize;
            }
        }
    });
    const dateValues = dateLabels.map(label => dailyCounts[label]);
    return { labels: dateLabels, values: dateValues };
}

function handleGetMonthlyChartData(data) {
    const monthlyCounts = {};
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const scriptTimeZone = Session.getScriptTimeZone();
    const monthLabels = [];

    for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(currentYear, currentMonth - i, 1);
        const formattedMonth = Utilities.formatDate(targetDate, scriptTimeZone, "MM/yyyy");
        monthLabels.push(formattedMonth);
        monthlyCounts[formattedMonth] = 0;
    }
    const twelveMonthsAgoDate = new Date(currentYear, currentMonth - 11, 1);
    twelveMonthsAgoDate.setHours(0,0,0,0);

    data.forEach(row => {
        const timestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
        const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
        if (timestampDate && groupSize !== null && timestampDate >= twelveMonthsAgoDate) {
            const monthKey = Utilities.formatDate(timestampDate, scriptTimeZone, "MM/yyyy");
            if (monthlyCounts.hasOwnProperty(monthKey)) {
                monthlyCounts[monthKey] += groupSize;
            }
        }
    });
    const monthValues = monthLabels.map(label => monthlyCounts[label]);
    return { labels: monthLabels, values: monthValues };
}

function handleGetVisitorTypeData(data) {
  const visitorTypes = {
    'Đoàn nhỏ (1-5 người)': 0,
    'Đoàn vừa (6-10 người)': 0,
    'Đoàn lớn (11-20 người)': 0,
    'Đoàn rất lớn (>20 người)': 0
  };

  data.forEach(row => {
    const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
    if (groupSize !== null) {
      if (groupSize <= 5) {
        visitorTypes['Đoàn nhỏ (1-5 người)'] += 1; // Đếm số đoàn, không phải số người
      } else if (groupSize <= 10) {
        visitorTypes['Đoàn vừa (6-10 người)'] += 1; // Đếm số đoàn, không phải số người
      } else if (groupSize <= 20) {
        visitorTypes['Đoàn lớn (11-20 người)'] += 1; // Đếm số đoàn, không phải số người
      } else {
        visitorTypes['Đoàn rất lớn (>20 người)'] += 1; // Đếm số đoàn, không phải số người
      }
    }
  });

  return {
    labels: Object.keys(visitorTypes),
    values: Object.values(visitorTypes)
  };
}

function handleGetGrowthTrendData(data) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyData = {};
  const scriptTimeZone = Session.getScriptTimeZone();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentYear, currentMonth - i, 1);
    const monthKey = Utilities.formatDate(targetDate, scriptTimeZone, "MM/yyyy");
    monthlyData[monthKey] = 0;
  }

  // Calculate monthly totals
  data.forEach(row => {
    const timestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
    const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
    if (timestampDate && groupSize !== null) {
      const monthKey = Utilities.formatDate(timestampDate, scriptTimeZone, "MM/yyyy");
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += groupSize;
      }
    }
  });

  // Calculate growth rates
  const labels = Object.keys(monthlyData);
  const values = [];
  let previousValue = null;

  labels.forEach(monthKey => {
    const currentValue = monthlyData[monthKey];
    if (previousValue === null) {
      values.push(0); // First month has no growth rate
    } else if (previousValue === 0 && currentValue === 0) {
      values.push(null); // Không có dữ liệu
    } else if (previousValue === 0 && currentValue > 0) {
      values.push(100);
    } else {
      const growthRate = ((currentValue - previousValue) / previousValue) * 100;
      values.push(Math.round(growthRate * 10) / 10);
    }
    previousValue = currentValue;
  });

  return { labels: labels, values: values };
}

function handleGetRecentRegistrations(data, limit = 10) {
  const scriptTimeZone = Session.getScriptTimeZone();
  const dateFormat = "dd/MM/yyyy";
  const timeFormat = "HH:mm";
  let recentRegistrations = [];

  // Convert data to objects with timestamp for sorting
  data.forEach(row => {
    const timestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
    const leaderName = row[COL_INDEX.LEADER_NAME];
    const phoneNumber = row[COL_INDEX.PHONE];
    const birthday = parseDateCell(row[COL_INDEX.BIRTHDAY]);
    const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);

    if (timestampDate && leaderName) {
      let formattedBirthday = birthday
        ? Utilities.formatDate(birthday, scriptTimeZone, dateFormat)
        : '(không có)';

      recentRegistrations.push({
        timestamp: timestampDate,
        leaderName: leaderName || '(không có)',
        phoneNumber: phoneNumber || '(không có)',
        birthday: formattedBirthday,
        groupSize: groupSize !== null ? groupSize : '(không có)',
        registrationDate: Utilities.formatDate(timestampDate, scriptTimeZone, dateFormat),
        registrationTime: Utilities.formatDate(timestampDate, scriptTimeZone, timeFormat),
        status: 'active' // Default status
      });
    }
  });

  // Sort by timestamp (newest first) and limit results
  recentRegistrations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  recentRegistrations = recentRegistrations.slice(0, limit);

  // Remove timestamp from final result (keep only formatted date and time)
  return recentRegistrations.map(registration => {
    const { timestamp, ...result } = registration;
    return result;
  });
}

// --- Executive Summary ---
function generateExecutiveSummary(data, initialStats) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthYear = lastMonth.getFullYear();
  const lastMonthMonth = lastMonth.getMonth();

  // Tính tổng khách tháng trước
  let lastMonthCount = 0;
  data.forEach(row => {
    const timestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
    const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
    if (timestampDate && groupSize !== null) {
      const rowYear = timestampDate.getFullYear();
      const rowMonth = timestampDate.getMonth();
      if (rowYear === lastMonthYear && rowMonth === lastMonthMonth) {
        lastMonthCount += groupSize;
      }
    }
  });

  // Tăng trưởng tháng
  let monthlyGrowth;
  if (lastMonthCount === 0) {
    if (initialStats.monthlyCount === 0) {
      monthlyGrowth = null; // Không có dữ liệu
    } else {
      monthlyGrowth = 100;
    }
  } else {
    monthlyGrowth = Math.round(((initialStats.monthlyCount - lastMonthCount) / lastMonthCount) * 100);
  }

  // Trung bình/ngày tháng này và tháng trước
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInLastMonth = new Date(lastMonthYear, lastMonthMonth + 1, 0).getDate();
  const dailyAverage = Math.round(initialStats.monthlyCount / daysInMonth);
  const lastMonthDailyAverage = lastMonthCount > 0 ? Math.round(lastMonthCount / daysInLastMonth) : 0;
  let dailyAverageGrowth;
  if (lastMonthDailyAverage === 0) {
    if (dailyAverage === 0) {
      dailyAverageGrowth = null;
    } else {
      dailyAverageGrowth = 100;
    }
  } else {
    dailyAverageGrowth = Math.round(((dailyAverage - lastMonthDailyAverage) / lastMonthDailyAverage) * 100);
  }

  // So sánh tuần này với tuần trước (rolling 7 ngày)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);

  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 13);
  const lastWeekEnd = new Date(today);
  lastWeekEnd.setDate(today.getDate() - 7);

  let currentWeekCount = 0;
  let lastWeekCount = 0;
  data.forEach(row => {
    const timestampDate = parseDateCell(row[COL_INDEX.TIMESTAMP]);
    const groupSize = parseGroupSizeCell(row[COL_INDEX.GROUP_SIZE]);
    if (timestampDate && groupSize !== null) {
      if (timestampDate >= weekStart && timestampDate <= today) {
        currentWeekCount += groupSize;
      } else if (timestampDate >= lastWeekStart && timestampDate <= lastWeekEnd) {
        lastWeekCount += groupSize;
      }
    }
  });
  let weeklyTrend;
  if (lastWeekCount === 0) {
    if (currentWeekCount === 0) {
      weeklyTrend = null;
    } else {
      weeklyTrend = 100;
    }
  } else {
    weeklyTrend = Math.round(((currentWeekCount - lastWeekCount) / lastWeekCount) * 100);
  }

  return {
    monthlyCount: initialStats.monthlyCount,
    yearlyCount: initialStats.yearlyCount,
    lastMonthCount: lastMonthCount,
    monthlyGrowth: monthlyGrowth,
    dailyAverage: dailyAverage,
    lastMonthDailyAverage: lastMonthDailyAverage,
    dailyAverageGrowth: dailyAverageGrowth,
    trend: weeklyTrend,
    currentWeekCount: currentWeekCount,
    lastWeekCount: lastWeekCount
  };
}
