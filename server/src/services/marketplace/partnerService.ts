import { Partner, Device, MatchRecord, StorageService } from '../../db/storage';

export class PartnerService {
  /**
   * Calculate Haversine distance in kilometers between two GPS coordinates
   */
  static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  /**
   * Find and rank matches for a device based on target route and user coordinates
   */
  static async matchPartners(
    device: Device,
    route: 'RESALE' | 'REPAIR' | 'RECYCLE',
    userCoords?: { latitude: number; longitude: number },
    estimatedValue: number = 0
  ): Promise<Omit<MatchRecord, 'id' | 'created_at'>[]> {
    const partners = await StorageService.getPartners();
    const category = (device.category || 'smartphone').toLowerCase();

    // Filter partners supporting device category
    const eligible = partners.filter(p => {
      const supportsCategory = p.supported_categories.length === 0 || p.supported_categories.includes(category);
      if (!supportsCategory) return false;

      if (route === 'RESALE') {
        return p.partner_type === 'MARKETPLACE' || p.partner_type === 'REFURBISHER';
      }
      if (route === 'REPAIR') {
        return p.partner_type === 'REFURBISHER';
      }
      if (route === 'RECYCLE') {
        return p.partner_type === 'RECYCLER' || p.partner_type === 'DROP_OFF';
      }
      return true;
    });

    const matches: Omit<MatchRecord, 'id' | 'created_at'>[] = [];

    for (const p of eligible) {
      let distanceKm: number | null = null;
      if (userCoords && userCoords.latitude && userCoords.longitude) {
        distanceKm = this.calculateDistanceKm(userCoords.latitude, userCoords.longitude, p.latitude, p.longitude);
      } else {
        // default simulated nearby distance
        distanceKm = Number((Math.random() * 8 + 1.2).toFixed(1));
      }

      // Match scoring (0 - 100)
      let score = 70;
      if (p.certified) score += 15;
      if (distanceKm !== null && distanceKm < 5) score += 10;
      else if (distanceKm !== null && distanceKm < 15) score += 5;
      score = Math.min(99, score);

      matches.push({
        device_id: device.id,
        partner_id: p.id,
        match_type: route,
        match_score: score,
        estimated_value: estimatedValue,
        distance_km: distanceKm,
        partner: p
      });
    }

    // Sort by match score descending and distance ascending
    return matches.sort((a, b) => b.match_score - a.match_score);
  }
}
