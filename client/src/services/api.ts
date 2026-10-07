import {
  Device,
  DeviceIdentification,
  Diagnostics,
  DualValuation,
  Decision,
  Partner,
  Match,
  SanitizationGuide,
  SanitizationRecord,
  Certificate,
  EcoWallet,
  EcoTransaction,
  UserProfile
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('ecocycle_auth_token') || 'demo-user-ecocycle-001';
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('ecocycle_auth_token', token);
    } else {
      localStorage.removeItem('ecocycle_auth_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('ecocycle_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }

  // Auth
  async getMe(): Promise<{ success: boolean; user: { id: string; email: string; profile: UserProfile; wallet: EcoWallet } }> {
    return this.request('/auth/me');
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; profile: UserProfile }> {
    return this.request('/auth/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  }

  async demoLogin(): Promise<{ success: boolean; token: string; user: any }> {
    const res = await this.request<any>('/auth/demo-login', { method: 'POST' });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  // AI Identification
  async identifyDevice(payload: { image?: string; filename?: string; hint?: string }): Promise<{ success: boolean; identification: DeviceIdentification }> {
    return this.request('/ai/identify-device', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Devices
  async getDevices(): Promise<{ success: boolean; devices: Device[] }> {
    return this.request('/devices');
  }

  async getDeviceById(id: string): Promise<{ success: boolean; device: Device }> {
    return this.request(`/devices/${id}`);
  }

  async createDevice(device: Partial<Device>): Promise<{ success: boolean; device: Device }> {
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify(device)
    });
  }

  async deleteDevice(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/devices/${id}`, { method: 'DELETE' });
  }

  // Diagnostics
  async runDiagnostics(deviceId: string, telemetry?: any): Promise<{ success: boolean; diagnostics: Diagnostics }> {
    return this.request(`/devices/${deviceId}/diagnostics`, {
      method: 'POST',
      body: JSON.stringify(telemetry || {})
    });
  }

  async getDiagnostics(deviceId: string): Promise<{ success: boolean; diagnostics: Diagnostics }> {
    return this.request(`/devices/${deviceId}/diagnostics`);
  }

  // Valuations
  async calculateValuation(deviceId: string, currency: 'INR' | 'USD' = 'INR'): Promise<{ success: boolean; valuation: DualValuation }> {
    return this.request(`/devices/${deviceId}/valuation`, {
      method: 'POST',
      body: JSON.stringify({ currency })
    });
  }

  async getValuation(deviceId: string): Promise<{ success: boolean; valuation: DualValuation }> {
    return this.request(`/devices/${deviceId}/valuation`);
  }

  // Decisions
  async evaluateDecision(deviceId: string, coordinates?: { latitude: number; longitude: number }): Promise<{ success: boolean; decision: Decision; matches: Match[] }> {
    return this.request(`/devices/${deviceId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ coordinates })
    });
  }

  async getDecision(deviceId: string): Promise<{ success: boolean; decision: Decision; matches: Match[] }> {
    return this.request(`/devices/${deviceId}/decision`);
  }

  // Resale / Recycling Options
  async getResaleOptions(deviceId: string): Promise<{ success: boolean; options: Match[] }> {
    return this.request(`/devices/${deviceId}/resale-options`);
  }

  async getRecyclingOptions(deviceId: string): Promise<{ success: boolean; options: Match[] }> {
    return this.request(`/devices/${deviceId}/recycling-options`);
  }

  // Partners
  async getPartners(params?: { type?: string; category?: string }): Promise<{ success: boolean; partners: Partner[] }> {
    const q = new URLSearchParams(params as any).toString();
    return this.request(`/partners${q ? '?' + q : ''}`);
  }

  async getNearbyPartners(lat?: number, lng?: number, type?: string): Promise<{ success: boolean; partners: Partner[] }> {
    const params: any = {};
    if (lat !== undefined) params.lat = lat;
    if (lng !== undefined) params.lng = lng;
    if (type) params.type = type;
    const q = new URLSearchParams(params).toString();
    return this.request(`/partners/nearby${q ? '?' + q : ''}`);
  }

  // Sanitization
  async getSanitizationGuidance(deviceId: string): Promise<{ success: boolean; guidance: SanitizationGuide; current_record: SanitizationRecord | null }> {
    return this.request(`/devices/${deviceId}/sanitization/guidance`);
  }

  async startSanitization(deviceId: string, method?: string, verification_type?: string): Promise<{ success: boolean; sanitization: SanitizationRecord }> {
    return this.request(`/devices/${deviceId}/sanitization/start`, {
      method: 'POST',
      body: JSON.stringify({ method, verification_type })
    });
  }

  async confirmSanitization(
    deviceId: string,
    checklist_answers: Record<string, boolean>,
    verification_type: string = 'USER_CONFIRMED'
  ): Promise<{ success: boolean; sanitization: SanitizationRecord; certificate: Certificate; eco_reward: EcoTransaction }> {
    return this.request(`/devices/${deviceId}/sanitization/confirm`, {
      method: 'POST',
      body: JSON.stringify({ checklist_answers, verification_type })
    });
  }

  // Certificates
  async getCertificate(idOrNumber: string): Promise<{ success: boolean; certificate: Certificate }> {
    return this.request(`/certificates/${idOrNumber}`);
  }

  // Eco-Wallet
  async getWallet(): Promise<{ success: boolean; wallet: EcoWallet; transactions: EcoTransaction[]; stats: any }> {
    return this.request('/eco-wallet');
  }

  async getWalletTransactions(): Promise<{ success: boolean; transactions: EcoTransaction[] }> {
    return this.request('/eco-wallet/transactions');
  }

  // Demo Suite
  async getDemoScenarios(): Promise<{ success: boolean; scenarios: any[] }> {
    return this.request('/demo/scenarios');
  }

  async loadDemoScenario(scenarioId: string): Promise<{ success: boolean; scenario: any }> {
    return this.request(`/demo/scenario/${scenarioId}`, { method: 'POST' });
  }
}

export const api = new ApiClient();
