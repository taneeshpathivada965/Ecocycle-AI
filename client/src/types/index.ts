export type DeviceCategory =
  | 'smartphone'
  | 'laptop'
  | 'tablet'
  | 'smartwatch'
  | 'monitor'
  | 'desktop'
  | 'gaming_console'
  | 'other';

export type ConditionGrade = 'A' | 'B' | 'C' | 'BROKEN' | 'WORKING' | 'REPAIRABLE' | 'DEAD' | 'UNKNOWN';
export type WorkingStatus = 'WORKING' | 'PARTIALLY_WORKING' | 'NON_WORKING' | 'DEAD';
export type RouteDecision = 'RESALE' | 'REPAIR' | 'RECYCLE';
export type DiagnosticSource = 'AI_ESTIMATED' | 'USER_REPORTED' | 'BROWSER_TESTED' | 'DEVICE_VERIFIED' | 'SIMULATED';
export type PartnerType = 'MARKETPLACE' | 'REFURBISHER' | 'RECYCLER' | 'DROP_OFF';

export interface Device {
  id: string;
  user_id: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  generation?: string | null;
  image_url?: string | null;
  condition: ConditionGrade;
  repairability?: string | null;
  working_status: WorkingStatus;
  identification_confidence: number;
  estimated_age_years: number;
  storage_capacity?: string | null;
  ram_capacity?: string | null;
  user_notes?: string | null;
  created_at: string;
  updated_at?: string;
  diagnostics?: Diagnostics | null;
  valuations?: ValuationItem[];
  decision?: Decision | null;
  matches?: Match[];
  sanitization?: SanitizationRecord | null;
  certificate?: Certificate | null;
}

export interface DeviceIdentification {
  category: DeviceCategory;
  brand: string;
  model: string;
  generation?: string | null;
  condition_grade: 'A' | 'B' | 'C' | 'BROKEN';
  visible_damage: string[];
  confidence: number;
  reasoning_summary: string;
  needs_user_confirmation: boolean;
}

export interface Diagnostics {
  id?: string;
  device_id: string;
  battery_health: number;
  battery_cycles: number;
  display_status: string;
  touch_status: string;
  storage_status: string;
  processor_status: string;
  charging_status: string;
  camera_status: string;
  speaker_status: string;
  overall_score: number;
  confidence: number;
  source: DiagnosticSource;
  created_at?: string;
}

export interface ValuationItem {
  id?: string;
  device_id: string;
  valuation_type: 'RESALE' | 'SCRAP' | 'REPAIR_ESTIMATE';
  amount: number;
  currency: 'INR' | 'USD';
  confidence: number;
  explanation: string;
  source: string;
  created_at?: string;
}

export interface DualValuation {
  resale_value: ValuationItem;
  scrap_value: ValuationItem;
  repair_cost_estimate: number;
}

export interface Decision {
  id?: string;
  device_id: string;
  recommended_route: RouteDecision;
  condition_score: number;
  repairability_score: number;
  resale_value: number;
  scrap_value: number;
  repair_cost_estimate: number;
  explanation: string;
  alternative_route?: RouteDecision | null;
  created_at?: string;
}

export interface Partner {
  id: string;
  name: string;
  partner_type: PartnerType;
  description?: string | null;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  certified: boolean;
  certification_standard?: string | null;
  supported_categories: string[];
  active: boolean;
  rating: number;
  distance_km?: number | null;
}

export interface Match {
  id?: string;
  device_id: string;
  partner_id: string;
  match_type: RouteDecision;
  match_score: number;
  estimated_value: number;
  distance_km?: number | null;
  partner?: Partner;
}

export interface SanitizationStep {
  id: string;
  title: string;
  instruction: string;
  critical: boolean;
}

export interface SanitizationGuide {
  device_type: string;
  recommended_method: string;
  standard: string;
  estimated_duration_minutes: number;
  steps: SanitizationStep[];
  warning_text: string;
}

export interface SanitizationRecord {
  id?: string;
  device_id: string;
  method: string;
  standard: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'CONFIRMED' | 'FAILED';
  verification_type: 'USER_CONFIRMED' | 'GUIDED' | 'SIMULATED' | 'VERIFIED';
  confirmation_timestamp?: string | null;
  certificate_hash?: string | null;
  checklist_answers: Record<string, boolean>;
  created_at?: string;
}

export interface Certificate {
  id: string;
  device_id: string;
  sanitization_id?: string | null;
  certificate_number: string;
  certificate_hash: string;
  verification_status: 'ISSUED' | 'VERIFIED' | 'REVOKED';
  issued_at: string;
  device?: Device;
  sanitization?: SanitizationRecord;
  cryptographic_seal?: {
    algorithm: string;
    hash: string;
    verified: boolean;
    issuer: string;
    standard: string;
  };
}

export interface EcoWallet {
  id?: string;
  user_id: string;
  balance: number;
  total_co2_saved_kg: number;
  total_ewaste_diverted_kg: number;
  created_at?: string;
}

export interface EcoTransaction {
  id: string;
  wallet_id: string;
  device_id?: string | null;
  transaction_type: string;
  credits: number;
  co2_saved_kg: number;
  ewaste_diverted_kg: number;
  description?: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  preferred_currency: 'INR' | 'USD';
  created_at?: string;
}
