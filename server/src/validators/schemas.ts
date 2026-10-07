import { z } from 'zod';

export const DeviceCategoryEnum = z.enum([
  'smartphone',
  'laptop',
  'tablet',
  'smartwatch',
  'monitor',
  'desktop',
  'gaming_console',
  'other'
]);

export const ConditionGradeEnum = z.enum([
  'A',
  'B',
  'C',
  'BROKEN',
  'WORKING',
  'REPAIRABLE',
  'DEAD',
  'UNKNOWN'
]);

export const WorkingStatusEnum = z.enum([
  'WORKING',
  'PARTIALLY_WORKING',
  'NON_WORKING',
  'DEAD'
]);

export const RouteEnum = z.enum([
  'RESALE',
  'REPAIR',
  'RECYCLE'
]);

export const CurrencyEnum = z.enum(['INR', 'USD']);

export const DiagnosticSourceEnum = z.enum([
  'AI_ESTIMATED',
  'USER_REPORTED',
  'BROWSER_TESTED',
  'DEVICE_VERIFIED',
  'SIMULATED'
]);

export const SanitizationMethodEnum = z.enum([
  'NIST_CLEAR',
  'NIST_PURGE',
  'NIST_DESTROY',
  'FACTORY_RESET_ENCRYPTED',
  'SECURE_ERASE'
]);

export const SanitizationVerificationEnum = z.enum([
  'USER_CONFIRMED',
  'GUIDED',
  'SIMULATED',
  'VERIFIED'
]);

export const PartnerTypeEnum = z.enum([
  'MARKETPLACE',
  'REFURBISHER',
  'RECYCLER',
  'DROP_OFF'
]);

export const DeviceSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().default('demo-user-ecocycle-001'),
  category: DeviceCategoryEnum,
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  generation: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  condition: ConditionGradeEnum.default('B'),
  repairability: z.string().nullable().optional(),
  working_status: WorkingStatusEnum.default('WORKING'),
  identification_confidence: z.number().min(0).max(1).default(0.9),
  estimated_age_years: z.number().min(0).default(1),
  storage_capacity: z.string().nullable().optional(),
  ram_capacity: z.string().nullable().optional(),
  user_notes: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const DeviceCreateSchema = DeviceSchema.omit({ id: true, created_at: true, updated_at: true });

export const DeviceIdentificationSchema = z.object({
  category: DeviceCategoryEnum,
  brand: z.string(),
  model: z.string(),
  generation: z.string().nullable().optional(),
  condition_grade: z.enum(['A', 'B', 'C', 'BROKEN']),
  visible_damage: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  reasoning_summary: z.string(),
  needs_user_confirmation: z.boolean().default(false)
});

export const DiagnosticSchema = z.object({
  id: z.string().uuid().optional(),
  device_id: z.string(),
  battery_health: z.number().min(0).max(100),
  battery_cycles: z.number().min(0).default(0),
  display_status: z.string(),
  touch_status: z.string(),
  storage_status: z.string(),
  processor_status: z.string(),
  charging_status: z.string(),
  camera_status: z.string(),
  speaker_status: z.string(),
  overall_score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  source: DiagnosticSourceEnum,
  created_at: z.string().optional()
});

export const ValuationSchema = z.object({
  id: z.string().uuid().optional(),
  device_id: z.string(),
  valuation_type: z.enum(['RESALE', 'SCRAP', 'REPAIR_ESTIMATE']),
  amount: z.number().min(0),
  currency: CurrencyEnum,
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  source: z.string().default('MARKET_ALGORITHM'),
  created_at: z.string().optional()
});

export const DecisionSchema = z.object({
  id: z.string().uuid().optional(),
  device_id: z.string(),
  recommended_route: RouteEnum,
  condition_score: z.number().min(0).max(100),
  repairability_score: z.number().min(0).max(100),
  resale_value: z.number().min(0),
  scrap_value: z.number().min(0),
  repair_cost_estimate: z.number().min(0),
  explanation: z.string(),
  alternative_route: RouteEnum.nullable().optional(),
  created_at: z.string().optional()
});

export const PartnerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  partner_type: PartnerTypeEnum,
  description: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  city: z.string(),
  country: z.string().default('India'),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  certified: z.boolean().default(false),
  certification_standard: z.string().nullable().optional(),
  supported_categories: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  rating: z.number().min(0).max(5).default(4.8)
});

export const MatchSchema = z.object({
  id: z.string().uuid().optional(),
  device_id: z.string(),
  partner_id: z.string(),
  match_type: RouteEnum,
  match_score: z.number().min(0).max(100),
  estimated_value: z.number().min(0),
  distance_km: z.number().nullable().optional()
});

export const SanitizationSchema = z.object({
  id: z.string().uuid().optional(),
  device_id: z.string(),
  method: SanitizationMethodEnum,
  standard: z.string().default('NIST SP 800-88 Rev 1'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'CONFIRMED', 'FAILED']),
  verification_type: SanitizationVerificationEnum,
  confirmation_timestamp: z.string().nullable().optional(),
  certificate_hash: z.string().nullable().optional(),
  checklist_answers: z.record(z.boolean()).default({})
});

export const CertificateSchema = z.object({
  id: z.string().uuid().optional(),
  device_id: z.string(),
  sanitization_id: z.string().nullable().optional(),
  certificate_number: z.string(),
  certificate_hash: z.string(),
  verification_status: z.enum(['ISSUED', 'VERIFIED', 'REVOKED']),
  issued_at: z.string().optional()
});

export const EcoTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  wallet_id: z.string(),
  device_id: z.string().nullable().optional(),
  transaction_type: z.enum([
    'DEVICE_SCANNED',
    'RESALE_COMPLETED',
    'REPAIR_INITIATED',
    'RECYCLING_COMPLETED',
    'SANITIZATION_VERIFIED',
    'ECO_REWARD_REDEEMED'
  ]),
  credits: z.number(),
  co2_saved_kg: z.number().default(0),
  ewaste_diverted_kg: z.number().default(0),
  description: z.string().nullable().optional(),
  created_at: z.string().optional()
});
