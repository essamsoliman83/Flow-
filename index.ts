export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'inspector' | 'supervisor' | 'manager';
  workPlace?: string;
  administrativeWorkPlaces?: string[]; // جهات العمل الإشرافية - للمديرين والمسؤولين فقط
}

export interface Attachment {
  id: string;
  name: string;
  url?: string;
  content: string; // base64 content - now required
  type: string;
  size: number;
}

export interface InspectionRecord {
  id: string;
  serialNumber: string;
  basicData: {
    day: string;
    date: string;
    time: string;
    inspectorName: string | string[]; // Support both string and array
    workPlace: string | string[]; // Support both string and array
    institutionName: string;
    inspectionLocation: string;
    presentPharmacist: string; // اسم الصيدلي المتواجد
    inspectionReason: string;
    administrativeWorkPlaces?: string[]; // جهات العمل الإشرافية
  };
  inspectionResults: {
    humanResources: InspectionItem[];
    documentsAndBooks: InspectionItem[];
    dispensingPolicies: InspectionItem[];
    storageAndHealth: InspectionItem[];
    inventoryManagement: {
      shortages: ShortageItem[];
      stagnant: StagnantItem[];
      expired: ExpiredItem[];
      randomInventory: RandomInventoryItem[];
    };
    securityAndSafety: InspectionItem[];
    otherViolations: InspectionItem[];
  };
  recommendations: string;
  createdAt: string;
  createdBy: string;
}

export interface InspectionItem {
  violation: string;
  actionTaken: string;
  responsible: string;
  attachments: Attachment[];
}

export interface ShortageItem {
  item: string;
  unit: string;
  requiredQuantity: number;
  attachments: Attachment[];
}

export interface StagnantItem {
  item: string;
  unit: string;
  quantity: number;
  expiryDate: string;
  attachments: Attachment[];
}

export interface ExpiredItem {
  item: string;
  unit: string;
  quantity: number;
  expiryDate: string;
  attachments: Attachment[];
}

export interface RandomInventoryItem {
  item: string;
  unit: string;
  bookBalance: number;
  dispensed: number;
  actualBalance: number;
  shortage: number;
  surplus: number;
}

// الجهات الإشرافية المحددة مسبقاً
export const PREDEFINED_SUPERVISORY_WORKPLACES = [
  'إدارة الصيدلة بكفرالشيخ',
  'مركز سيدي غازي',
  'مركز دسوق',
  'مركز سيدي سالم',
  'مركز قلين',
  'مركز فوة',
  'مركز مطوبس',
  'مركز الرياض',
  'مركز الحامول',
  'مركز بيلا',
  'مركز بلطيم'
] as const;
