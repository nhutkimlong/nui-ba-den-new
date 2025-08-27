import { GpsSettings, LocationData, TrekkingRoute } from '../types/climb';

// Constants
export const SUMMIT_LATITUDE = 11.382117991152592;
export const SUMMIT_LONGITUDE = 106.17201169600158;
export const REGISTRATION_LATITUDE = 11.3636370;
export const REGISTRATION_LONGITUDE = 106.1664847;
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzafxB0TBS4_gcPIvaqbINNrnJJ_7aaE9Az3m9EqqkH5s2eo_mbzrRiOOw3jXolS5jfng/exec';
export const CROP_ASPECT_RATIO = 11.89 / 16.73;
export const COMBINED_API_URL = '/.netlify/functions/combined-data';

// Default GPS settings
export const DEFAULT_GPS_SETTINGS: GpsSettings = {
  registrationRadius: 50,
  certificateRadius: 150,
  requireGpsRegistration: true,
  requireGpsCertificate: true,
  registrationTimeEnabled: false,
  registrationStartTime: '06:00',
  registrationEndTime: '18:00'
};

// Trekking route data
export const POWER_POLE_TRAIL_GEOJSON: TrekkingRoute = {
  "type": "Feature",
  "properties": {
    "name": "Đường cột điện",
    "highway": "footway",
    "surface": "wood"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [106.1664847, 11.3636370],
      [106.1662692, 11.3638531],
      [106.1660653, 11.3641397],
      [106.1658347, 11.3646262],
      [106.1656858, 11.3648313],
      [106.1656147, 11.3649273],
      [106.1655959, 11.3650180],
      [106.1655664, 11.3650864],
      [106.1655718, 11.3651890],
      [106.1655557, 11.3652626],
      [106.1655128, 11.3652941],
      [106.1655182, 11.3653730],
      [106.1655772, 11.3654467],
      [106.1656845, 11.3655229],
      [106.1657301, 11.3656255],
      [106.1657944, 11.3657175],
      [106.1658615, 11.3657780],
      [106.1659151, 11.3658595],
      [106.1659715, 11.3659647],
      [106.1659929, 11.3660725],
      [106.1659634, 11.3661593],
      [106.1659634, 11.3662671],
      [106.1659634, 11.3663775],
      [106.1659205, 11.3664696],
      [106.1658347, 11.3666615],
      [106.1658695, 11.3667825],
      [106.1659151, 11.3668772],
      [106.1659701, 11.3670507],
      [106.1659902, 11.3671165],
      [106.1660090, 11.3672335],
      [106.1660399, 11.3672861],
      [106.1660747, 11.3673558],
      [106.1660935, 11.3674346],
      [106.1661042, 11.3675780],
      [106.1661163, 11.3676674],
      [106.1661592, 11.3677370],
      [106.1661579, 11.3678370],
      [106.1661525, 11.3678777],
      [106.1661941, 11.3679869],
      [106.1661954, 11.3680855],
      [106.1661726, 11.3681289],
      [106.1661418, 11.3681972],
      [106.1661606, 11.3682879],
      [106.1661887, 11.3683432],
      [106.1662021, 11.3684786],
      [106.1661726, 11.3685312],
      [106.1661056, 11.3685917],
      [106.1660586, 11.3686574],
      [106.1660466, 11.3687231],
      [106.1660814, 11.3687915],
      [106.1661230, 11.3689559],
      [106.1661538, 11.3690058],
      [106.1661860, 11.3691057],
      [106.1662196, 11.3692214],
      [106.1662732, 11.3695580],
      [106.1663081, 11.3697092],
      [106.1663108, 11.3697645],
      [106.1663550, 11.3698407],
      [106.1663537, 11.3699038],
      [106.1663376, 11.3699301],
      [106.1662826, 11.3699538],
      [106.1662665, 11.3699801],
      [106.1662786, 11.3700274],
      [106.1662893, 11.3701339],
      [106.1662839, 11.3702273],
      [106.1662330, 11.3702733],
      [106.1661673, 11.3703285],
      [106.1661109, 11.3703798],
      [106.1660801, 11.3704679],
      [106.1661029, 11.3705034],
      [106.1661150, 11.3706085],
      [106.1660747, 11.3706546],
      [106.1660036, 11.3706940],
      [106.1659460, 11.3707663],
      [106.1659540, 11.3708215],
      [106.1659607, 11.3708597],
      [106.1659768, 11.3709504],
      [106.1659648, 11.3710266],
      [106.1659326, 11.3710635],
      [106.1658950, 11.3711029],
      [106.1658816, 11.3711516],
      [106.1658803, 11.3712055],
      [106.1658937, 11.3712765],
      [106.1659648, 11.3713317],
      [106.1660358, 11.3713856],
      [106.1661109, 11.3714355],
      [106.1661914, 11.3715013],
      [106.1662450, 11.3715512],
      [106.1662531, 11.3715999],
      [106.1662692, 11.3716696],
      [106.1663349, 11.3717222],
      [106.1663859, 11.3717458],
      [106.1663993, 11.3717682],
      [106.1663912, 11.3718458],
      [106.1663778, 11.3718878],
      [106.1663872, 11.3720088],
      [106.1664677, 11.3721468],
      [106.1664797, 11.3722165],
      [106.1665106, 11.3722770],
      [106.1665481, 11.3723007],
      [106.1666380, 11.3723493],
      [106.1666822, 11.3724137],
      [106.1667533, 11.3724913],
      [106.1668164, 11.3725492],
      [106.1668579, 11.3726202],
      [106.1668982, 11.3727451],
      [106.1669223, 11.3728371],
      [106.1669451, 11.3730028],
      [106.1669759, 11.3731014],
      [106.1670202, 11.3731526],
      [106.1670819, 11.3732802],
      [106.1670685, 11.3732933],
      [106.1670698, 11.3733393],
      [106.1671248, 11.3734537],
      [106.1671382, 11.3736062],
      [106.1671101, 11.3736628],
      [106.1670497, 11.3737377],
      [106.1670524, 11.3738311],
      [106.1670765, 11.3739481],
      [106.1670832, 11.3740519],
      [106.1670698, 11.3741558],
      [106.1671020, 11.3741847],
      [106.1671449, 11.3742307],
      [106.1671972, 11.3742768],
      [106.1672334, 11.3743359],
      [106.1672455, 11.3744122],
      [106.1672187, 11.3744753],
      [106.1672133, 11.3745410],
      [106.1672737, 11.3745778],
      [106.1672965, 11.3746396],
      [106.1672629, 11.3746935],
      [106.1672388, 11.3747593],
      [106.1672576, 11.3747803],
      [106.1673193, 11.3748855],
      [106.1674038, 11.3749933],
      [106.1675017, 11.3750472],
      [106.1675969, 11.3751669],
      [106.1676760, 11.3752589],
      [106.1677310, 11.3753049],
      [106.1677793, 11.3753575],
      [106.1678115, 11.3754061],
      [106.1678651, 11.3754811],
      [106.1679067, 11.3755034],
      [106.1679764, 11.3755521],
      [106.1680703, 11.3756428],
      [106.1680904, 11.3757256],
      [106.1681360, 11.3757703],
      [106.1682138, 11.3758624],
      [106.1682741, 11.3759518],
      [106.1682996, 11.3760307],
      [106.1683251, 11.3761385],
      [106.1683425, 11.3762305],
      [106.1683492, 11.3762897],
      [106.1683801, 11.3763436],
      [106.1684230, 11.3763817],
      [106.1684659, 11.3764027],
      [106.1686094, 11.3764856],
      [106.1686765, 11.3765395],
      [106.1687408, 11.3766013],
      [106.1688025, 11.3766736],
      [106.1688253, 11.3767314],
      [106.1688428, 11.3768629],
      [106.1688401, 11.3770088],
      [106.1688602, 11.3770601],
      [106.1688924, 11.3771837],
      [106.1688910, 11.3772560],
      [106.1688857, 11.3773323],
      [106.1688937, 11.3774335],
      [106.1689031, 11.3775807],
      [106.1689259, 11.3776794],
      [106.1689407, 11.3777293],
      [106.1689661, 11.3778161],
      [106.1689970, 11.3779055],
      [106.1690345, 11.3779699],
      [106.1690949, 11.3780725],
      [106.1691257, 11.3781619],
      [106.1691847, 11.3782487],
      [106.1692277, 11.3783025],
      [106.1692920, 11.3784051],
      [106.1692934, 11.3784695],
      [106.1693148, 11.3785537],
      [106.1693121, 11.3786786],
      [106.1693242, 11.3787180],
      [106.1693484, 11.3787732],
      [106.1693470, 11.3788390],
      [106.1693417, 11.3788666],
      [106.1693470, 11.3789823],
      [106.1693457, 11.3791032],
      [106.1693497, 11.3792255],
      [106.1693538, 11.3793057],
      [106.1693591, 11.3793649],
      [106.1693524, 11.3794135],
      [106.1693644, 11.3795068],
      [106.1693604, 11.3796199],
      [106.1693510, 11.3796541],
      [106.1692840, 11.3797409],
      [106.1692679, 11.3798710],
      [106.1692384, 11.3799991],
      [106.1692277, 11.3801642],
      [106.1692317, 11.3802891],
      [106.1692518, 11.3803496],
      [106.1692800, 11.3804443],
      [106.1692558, 11.3805521],
      [106.1693001, 11.3806993],
      [106.1692947, 11.3808347],
      [106.1692491, 11.3809715],
      [106.1691834, 11.3810970],
      [106.1691532, 11.3812423],
      [106.1692143, 11.3813435],
      [106.1693477, 11.3814671],
      [106.1694603, 11.3815263],
      [106.1695898, 11.3815881],
      [106.1696689, 11.3817189],
      [106.1697579, 11.3818330]
    ]
  }
};

// Utility functions
export function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDateToDDMMYYYY(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function ensureBirthdayFormat(birthdayValue: string | Date): string {
  if (!birthdayValue) return '';
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(birthdayValue))) {
    return String(birthdayValue);
  }
  
  if (birthdayValue instanceof Date) {
    const year = birthdayValue.getFullYear();
    const month = String(birthdayValue.getMonth() + 1).padStart(2, '0');
    const day = String(birthdayValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  try {
    const date = new Date(birthdayValue);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.warn('Không thể parse ngày sinh:', birthdayValue);
  }
  
  return String(birthdayValue);
}

export function isValidNationalId(nationalId: string): boolean {
  const value = String(nationalId || '').trim();
  return /^(?:\d{9}|0\d{11})$/.test(value);
}

export function parseLocalDateTime(yyyyMmDd: string, hhMm?: string): Date | null {
  if (!yyyyMmDd) return null;
  try {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    if (!y || !m || !d) return null;
    let hours = 0, minutes = 0;
    if (hhMm && /^(\d{2}):(\d{2})$/.test(hhMm)) {
      const parts = hhMm.split(':').map(Number);
      hours = parts[0];
      minutes = parts[1];
    }
    return new Date(y, m - 1, d, hours, minutes, 0, 0);
  } catch (e) {
    return null;
  }
}

export function isClimbDateTimeWithinGrace(dateStr: string, timeStr: string, graceMinutes = 30): boolean {
  const scheduled = parseLocalDateTime(dateStr, timeStr);
  if (!scheduled) return true;
  const now = new Date();
  const graceMs = Math.max(0, Number(graceMinutes)) * 60 * 1000;
  return scheduled.getTime() >= (now.getTime() - graceMs);
}

export function isCleanName(name: string): boolean {
  const trimmed = String(name || '').trim();
  if (!trimmed) return false;
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  return true;
}

export function escapeHtml(unsafe: any): string {
  if (typeof unsafe !== 'string') {
    try {
      unsafe = String(unsafe);
    } catch (e) {
      console.warn("Cannot convert value to string for escaping:", unsafe);
      return '';
    }
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createGpxContent(trailName: string, coordinates: number[][], creator = "NuiBaDenWebsite"): string {
  let gpx = `<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="${escapeHtml(creator)}">`;
  gpx += `<metadata><name>${escapeHtml(trailName)}</name></metadata>`;
  gpx += `<trk><name>${escapeHtml(trailName)}</name><trkseg>`;
  coordinates.forEach(coord => {
    gpx += `<trkpt lat="${coord[1]}" lon="${coord[0]}"></trkpt>`;
  });
  gpx += `</trkseg></trk></gpx>`;
  return gpx;
}

export function validateBirthday(birthdayValue: string): string {
  if (!birthdayValue) return '';
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthdayValue)) {
    return 'Vui lòng chọn ngày sinh hợp lệ';
  }

  const birthday = new Date(birthdayValue);
  const today = new Date();
  const age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  
  let actualAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    actualAge--;
  }

  if (actualAge < 15) {
    return 'Bạn phải từ 15 tuổi trở lên để đăng ký leo núi';
  } else if (actualAge > 100) {
    return 'Vui lòng kiểm tra lại ngày sinh';
  }
  
  return '';
}

export function isWithinRegistrationTime(gpsSettings: GpsSettings): boolean {
  if (!gpsSettings || !gpsSettings.registrationTimeEnabled) {
    return true;
  }
  
  if (!gpsSettings.registrationStartTime || !gpsSettings.registrationEndTime) {
    return true;
  }
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMinute] = gpsSettings.registrationStartTime.split(':').map(Number);
  const [endHour, endMinute] = gpsSettings.registrationEndTime.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  if (endTime < startTime) {
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    return currentTime >= startTime && currentTime <= endTime;
  }
}

export function getRegistrationTimeStatus(gpsSettings: GpsSettings): string | null {
  if (!gpsSettings || !gpsSettings.registrationTimeEnabled) {
    return null;
  }
  
  if (!gpsSettings.registrationStartTime || !gpsSettings.registrationEndTime) {
    return null;
  }
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMinute] = gpsSettings.registrationStartTime.split(':').map(Number);
  const [endHour, endMinute] = gpsSettings.registrationEndTime.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  if (endTime < startTime) {
    if (currentTime >= startTime || currentTime <= endTime) {
      return `✅ Đăng ký mở cửa (${gpsSettings.registrationStartTime} - ${gpsSettings.registrationEndTime})`;
    } else {
      return `❌ Đăng ký đóng cửa (${gpsSettings.registrationStartTime} - ${gpsSettings.registrationEndTime})`;
    }
  } else {
    if (currentTime >= startTime && currentTime <= endTime) {
      return `✅ Đăng ký mở cửa (${gpsSettings.registrationStartTime} - ${gpsSettings.registrationEndTime})`;
    } else {
      return `❌ Đăng ký đóng cửa (${gpsSettings.registrationStartTime} - ${gpsSettings.registrationEndTime})`;
    }
  }
}

export function getCurrentDateTime(): { date: string; time: string } {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  
  return {
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${min}`
  };
}
