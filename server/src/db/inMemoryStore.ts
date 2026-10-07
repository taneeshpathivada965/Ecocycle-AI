// Fallback high-fidelity in-memory store for isolated unit tests, offline hackathon demos, and local development
export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  blood_group: string;
  allergies: string;
  medical_notes: string;
  emergency_instructions: string;
  detection_sensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  verification_timeout_seconds: number;
  monitoring_enabled: boolean;
  location_enabled: boolean;
  automatic_escalation_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  priority: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonitoringSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  status: 'ACTIVE' | 'STOPPED' | 'PAUSED';
  last_signal_at: string;
  created_at: string;
}

export interface DetectionEvent {
  id: string;
  user_id: string;
  monitoring_session_id?: string | null;
  event_type: string;
  sensor_data: Record<string, unknown>;
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy?: number | null;
  detected_at: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
}

export interface EmergencyIncident {
  id: string;
  user_id: string;
  detection_event_id?: string | null;
  incident_type: string;
  status: 'PENDING_VERIFICATION' | 'ESCALATED' | 'RESOLVED_SAFE' | 'CANCELLED' | 'FALSE_ALARM';
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy?: number | null;
  detected_at: string;
  verification_started_at: string | null;
  verification_expires_at: string | null;
  escalated_at: string | null;
  resolved_at: string | null;
  resolution_reason?: string | null;
  ai_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentNotification {
  id: string;
  incident_id: string;
  trusted_contact_id: string;
  contact_name?: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH' | 'SIMULATED';
  status: 'PENDING' | 'SENT' | 'SIMULATED' | 'QUEUED' | 'FAILED';
  message: string;
  sent_at: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface AIAdvisory {
  id: string;
  user_id: string;
  incident_id?: string | null;
  advisory_type: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  created_at: string;
}

class InMemoryDatabase {
  public profiles: Map<string, Profile> = new Map();
  public contacts: Map<string, TrustedContact> = new Map();
  public sessions: Map<string, MonitoringSession> = new Map();
  public events: Map<string, DetectionEvent> = new Map();
  public incidents: Map<string, EmergencyIncident> = new Map();
  public notifications: Map<string, IncidentNotification> = new Map();
  public advisories: Map<string, AIAdvisory> = new Map();

  constructor() {
    this.seedDefaultDemoUser();
  }

  private seedDefaultDemoUser() {
    const demoUserId = '00000000-0000-0000-0000-000000000001';
    this.profiles.set(demoUserId, {
      id: demoUserId,
      full_name: 'Alex Mercer (Demo Profile)',
      phone: '+1 (555) 234-5678',
      blood_group: 'O+',
      allergies: 'Penicillin, Peanuts',
      medical_notes: 'Asthma inhaler in backpack. Mild hypertension.',
      emergency_instructions: 'Notify emergency contacts immediately and provide exact GPS coordinates.',
      detection_sensitivity: 'HIGH',
      verification_timeout_seconds: 30,
      monitoring_enabled: true,
      location_enabled: true,
      automatic_escalation_enabled: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString()
    });

    const contact1Id = '11111111-1111-1111-1111-111111111111';
    this.contacts.set(contact1Id, {
      id: contact1Id,
      user_id: demoUserId,
      name: 'Sarah Mercer',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543',
      email: 'sarah.mercer@example.com',
      priority: 1,
      is_primary: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const contact2Id = '22222222-2222-2222-2222-222222222222';
    this.contacts.set(contact2Id, {
      id: contact2Id,
      user_id: demoUserId,
      name: 'Dr. Robert Davis',
      relationship: 'Physician',
      phone: '+1 (555) 345-6789',
      email: 'dr.davis@exampleclinic.org',
      priority: 2,
      is_primary: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  public getOrCreateProfile(userId: string): Profile {
    let p = this.profiles.get(userId);
    if (!p) {
      p = {
        id: userId,
        full_name: 'New Safety User',
        phone: '',
        blood_group: '',
        allergies: '',
        medical_notes: '',
        emergency_instructions: '',
        detection_sensitivity: 'MEDIUM',
        verification_timeout_seconds: 30,
        monitoring_enabled: false,
        location_enabled: false,
        automatic_escalation_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.profiles.set(userId, p);
    }
    return p;
  }
}

export const inMemoryDB = new InMemoryDatabase();
