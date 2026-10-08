"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inMemoryDB = void 0;
class InMemoryDatabase {
    profiles = new Map();
    contacts = new Map();
    sessions = new Map();
    events = new Map();
    incidents = new Map();
    notifications = new Map();
    advisories = new Map();
    constructor() {
        this.seedDefaultDemoUser();
    }
    seedDefaultDemoUser() {
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
    getOrCreateProfile(userId) {
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
exports.inMemoryDB = new InMemoryDatabase();
