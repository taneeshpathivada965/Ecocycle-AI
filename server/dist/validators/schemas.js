"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcoTransactionSchema = exports.CertificateSchema = exports.SanitizationSchema = exports.MatchSchema = exports.PartnerSchema = exports.DecisionSchema = exports.ValuationSchema = exports.DiagnosticSchema = exports.DeviceIdentificationSchema = exports.DeviceCreateSchema = exports.DeviceSchema = exports.PartnerTypeEnum = exports.SanitizationVerificationEnum = exports.SanitizationMethodEnum = exports.DiagnosticSourceEnum = exports.CurrencyEnum = exports.RouteEnum = exports.WorkingStatusEnum = exports.ConditionGradeEnum = exports.DeviceCategoryEnum = void 0;
const zod_1 = require("zod");
exports.DeviceCategoryEnum = zod_1.z.enum([
    'smartphone',
    'laptop',
    'tablet',
    'smartwatch',
    'monitor',
    'desktop',
    'gaming_console',
    'other'
]);
exports.ConditionGradeEnum = zod_1.z.enum([
    'A',
    'B',
    'C',
    'BROKEN',
    'WORKING',
    'REPAIRABLE',
    'DEAD',
    'UNKNOWN'
]);
exports.WorkingStatusEnum = zod_1.z.enum([
    'WORKING',
    'PARTIALLY_WORKING',
    'NON_WORKING',
    'DEAD'
]);
exports.RouteEnum = zod_1.z.enum([
    'RESALE',
    'REPAIR',
    'RECYCLE'
]);
exports.CurrencyEnum = zod_1.z.enum(['INR', 'USD']);
exports.DiagnosticSourceEnum = zod_1.z.enum([
    'AI_ESTIMATED',
    'USER_REPORTED',
    'BROWSER_TESTED',
    'DEVICE_VERIFIED',
    'SIMULATED'
]);
exports.SanitizationMethodEnum = zod_1.z.enum([
    'NIST_CLEAR',
    'NIST_PURGE',
    'NIST_DESTROY',
    'FACTORY_RESET_ENCRYPTED',
    'SECURE_ERASE'
]);
exports.SanitizationVerificationEnum = zod_1.z.enum([
    'USER_CONFIRMED',
    'GUIDED',
    'SIMULATED',
    'VERIFIED'
]);
exports.PartnerTypeEnum = zod_1.z.enum([
    'MARKETPLACE',
    'REFURBISHER',
    'RECYCLER',
    'DROP_OFF'
]);
exports.DeviceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    user_id: zod_1.z.string().default('demo-user-ecocycle-001'),
    category: exports.DeviceCategoryEnum,
    brand: zod_1.z.string().min(1, 'Brand is required'),
    model: zod_1.z.string().min(1, 'Model is required'),
    generation: zod_1.z.string().nullable().optional(),
    image_url: zod_1.z.string().nullable().optional(),
    condition: exports.ConditionGradeEnum.default('B'),
    repairability: zod_1.z.string().nullable().optional(),
    working_status: exports.WorkingStatusEnum.default('WORKING'),
    identification_confidence: zod_1.z.number().min(0).max(1).default(0.9),
    estimated_age_years: zod_1.z.number().min(0).default(1),
    storage_capacity: zod_1.z.string().nullable().optional(),
    ram_capacity: zod_1.z.string().nullable().optional(),
    user_notes: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().optional(),
    updated_at: zod_1.z.string().optional()
});
exports.DeviceCreateSchema = exports.DeviceSchema.omit({ id: true, created_at: true, updated_at: true });
exports.DeviceIdentificationSchema = zod_1.z.object({
    category: exports.DeviceCategoryEnum,
    brand: zod_1.z.string(),
    model: zod_1.z.string(),
    generation: zod_1.z.string().nullable().optional(),
    condition_grade: zod_1.z.enum(['A', 'B', 'C', 'BROKEN']),
    visible_damage: zod_1.z.array(zod_1.z.string()).default([]),
    confidence: zod_1.z.number().min(0).max(1),
    reasoning_summary: zod_1.z.string(),
    needs_user_confirmation: zod_1.z.boolean().default(false)
});
exports.DiagnosticSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    device_id: zod_1.z.string(),
    battery_health: zod_1.z.number().min(0).max(100),
    battery_cycles: zod_1.z.number().min(0).default(0),
    display_status: zod_1.z.string(),
    touch_status: zod_1.z.string(),
    storage_status: zod_1.z.string(),
    processor_status: zod_1.z.string(),
    charging_status: zod_1.z.string(),
    camera_status: zod_1.z.string(),
    speaker_status: zod_1.z.string(),
    overall_score: zod_1.z.number().min(0).max(100),
    confidence: zod_1.z.number().min(0).max(1),
    source: exports.DiagnosticSourceEnum,
    created_at: zod_1.z.string().optional()
});
exports.ValuationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    device_id: zod_1.z.string(),
    valuation_type: zod_1.z.enum(['RESALE', 'SCRAP', 'REPAIR_ESTIMATE']),
    amount: zod_1.z.number().min(0),
    currency: exports.CurrencyEnum,
    confidence: zod_1.z.number().min(0).max(1),
    explanation: zod_1.z.string(),
    source: zod_1.z.string().default('MARKET_ALGORITHM'),
    created_at: zod_1.z.string().optional()
});
exports.DecisionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    device_id: zod_1.z.string(),
    recommended_route: exports.RouteEnum,
    condition_score: zod_1.z.number().min(0).max(100),
    repairability_score: zod_1.z.number().min(0).max(100),
    resale_value: zod_1.z.number().min(0),
    scrap_value: zod_1.z.number().min(0),
    repair_cost_estimate: zod_1.z.number().min(0),
    explanation: zod_1.z.string(),
    alternative_route: exports.RouteEnum.nullable().optional(),
    created_at: zod_1.z.string().optional()
});
exports.PartnerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string(),
    partner_type: exports.PartnerTypeEnum,
    description: zod_1.z.string().nullable().optional(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    country: zod_1.z.string().default('India'),
    phone: zod_1.z.string().nullable().optional(),
    email: zod_1.z.string().nullable().optional(),
    website: zod_1.z.string().nullable().optional(),
    certified: zod_1.z.boolean().default(false),
    certification_standard: zod_1.z.string().nullable().optional(),
    supported_categories: zod_1.z.array(zod_1.z.string()).default([]),
    active: zod_1.z.boolean().default(true),
    rating: zod_1.z.number().min(0).max(5).default(4.8)
});
exports.MatchSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    device_id: zod_1.z.string(),
    partner_id: zod_1.z.string(),
    match_type: exports.RouteEnum,
    match_score: zod_1.z.number().min(0).max(100),
    estimated_value: zod_1.z.number().min(0),
    distance_km: zod_1.z.number().nullable().optional()
});
exports.SanitizationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    device_id: zod_1.z.string(),
    method: exports.SanitizationMethodEnum,
    standard: zod_1.z.string().default('NIST SP 800-88 Rev 1'),
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'CONFIRMED', 'FAILED']),
    verification_type: exports.SanitizationVerificationEnum,
    confirmation_timestamp: zod_1.z.string().nullable().optional(),
    certificate_hash: zod_1.z.string().nullable().optional(),
    checklist_answers: zod_1.z.record(zod_1.z.boolean()).default({})
});
exports.CertificateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    device_id: zod_1.z.string(),
    sanitization_id: zod_1.z.string().nullable().optional(),
    certificate_number: zod_1.z.string(),
    certificate_hash: zod_1.z.string(),
    verification_status: zod_1.z.enum(['ISSUED', 'VERIFIED', 'REVOKED']),
    issued_at: zod_1.z.string().optional()
});
exports.EcoTransactionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    wallet_id: zod_1.z.string(),
    device_id: zod_1.z.string().nullable().optional(),
    transaction_type: zod_1.z.enum([
        'DEVICE_SCANNED',
        'RESALE_COMPLETED',
        'REPAIR_INITIATED',
        'RECYCLING_COMPLETED',
        'SANITIZATION_VERIFIED',
        'ECO_REWARD_REDEEMED'
    ]),
    credits: zod_1.z.number(),
    co2_saved_kg: zod_1.z.number().default(0),
    ewaste_diverted_kg: zod_1.z.number().default(0),
    description: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().optional()
});
