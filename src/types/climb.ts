export interface GpsSettings {
  registrationRadius: number;
  certificateRadius: number;
  requireGpsRegistration: boolean;
  requireGpsCertificate: boolean;
  registrationTimeEnabled: boolean;
  registrationStartTime: string;
  registrationEndTime: string;
}

export interface Notification {
  id: string;
  type: 'weather' | 'maintenance' | 'announcement' | 'emergency';
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
  lastModified: string;
}

export interface RegistrationData {
  leaderName: string;
  birthday: string;
  phoneNumber: string;
  cccd: string;
  address: string;
  groupSize: string;
  email: string;
  climbDate: string;
  climbTime: string;
  safetyCommit: boolean;
  memberList: string;
}

export interface MemberData {
  name: string;
  photoData?: string | null;
}

export interface CertificateResult {
  success: boolean;
  message?: string;
  pdfLinks?: Array<{
    name: string;
    url: string;
  }>;
}

export interface TrekkingRoute {
  type: string;
  properties: {
    name: string;
    highway: string;
    surface: string;
  };
  geometry: {
    type: string;
    coordinates: number[][];
  };
}

export interface NotificationType {
  name: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}

export type RepresentativeType = 'leader' | 'individual' | 'member';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface CropContext {
  name: string;
  previewId: string;
  removeId: string;
  fileInput: HTMLInputElement;
}
