import crypto from 'crypto';
import { Device, SanitizationRecord, CertificateRecord } from '../../db/storage';

export interface SanitizationGuide {
  device_type: string;
  recommended_method: string;
  standard: string;
  estimated_duration_minutes: number;
  steps: { id: string; title: string; instruction: string; critical: boolean }[];
  warning_text: string;
}

export class SanitizationService {
  /**
   * Return device-specific NIST SP 800-88 instructions
   */
  static getGuidance(device: Device): SanitizationGuide {
    const category = (device.category || 'smartphone').toLowerCase();
    const brand = (device.brand || '').toLowerCase();

    if (category === 'smartphone' || category === 'tablet') {
      const isApple = brand.includes('apple') || (device.model || '').toLowerCase().includes('iphone') || (device.model || '').toLowerCase().includes('ipad');
      if (isApple) {
        return {
          device_type: 'iOS / iPadOS Device',
          recommended_method: 'NIST_CLEAR',
          standard: 'NIST SP 800-88 Rev 1 (Cryptographic Erase)',
          estimated_duration_minutes: 5,
          warning_text: 'Never enter your Apple ID password into any third-party app. Perform this directly on your device settings.',
          steps: [
            {
              id: 'sign_out_icloud',
              title: 'Sign out of iCloud & Find My',
              instruction: 'Go to Settings > [Your Name] > Sign Out. Enter your Apple ID password to disable Activation Lock.',
              critical: true
            },
            {
              id: 'unpair_accessories',
              title: 'Unpair Apple Watch & Bluetooth Devices',
              instruction: 'Open the Watch app > All Watches > Unpair Apple Watch to back up and sever Bluetooth keys.',
              critical: false
            },
            {
              id: 'factory_reset',
              title: 'Initiate Cryptographic Erase',
              instruction: 'Go to Settings > General > Transfer or Reset iPhone > Erase All Content and Settings. This purges the Secure Enclave EFF (Effaceable Storage) encryption keys instantly, rendering on-flash NAND data permanently unrecoverable.',
              critical: true
            },
            {
              id: 'remove_sim',
              title: 'Remove Physical SIM / Deactivate eSIM',
              instruction: 'Eject your physical SIM tray or confirm eSIM profile deletion prompt during wipe.',
              critical: true
            }
          ]
        };
      } else {
        return {
          device_type: 'Android Device',
          recommended_method: 'NIST_CLEAR',
          standard: 'NIST SP 800-88 Rev 1 (Cryptographic Erase)',
          estimated_duration_minutes: 8,
          warning_text: 'Remove your Google Account first to avoid Factory Reset Protection (FRP) locking future users.',
          steps: [
            {
              id: 'remove_google_account',
              title: 'Remove Google & Brand Accounts',
              instruction: 'Navigate to Settings > Accounts & Backup > Manage Accounts > Select Google/Samsung account > Remove Account.',
              critical: true
            },
            {
              id: 'verify_encryption',
              title: 'Verify File-Based Encryption (FBE)',
              instruction: 'Settings > Security > Encryption & Credentials. Modern Android devices (Android 10+) enforce FBE by default.',
              critical: false
            },
            {
              id: 'factory_data_reset',
              title: 'Execute Factory Data Reset',
              instruction: 'Go to Settings > System > Reset Options > Erase all data (factory reset). Cryptographic keys stored in the Hardware-backed Keystore / TEE are purged.',
              critical: true
            },
            {
              id: 'eject_sd_card',
              title: 'Eject MicroSD and SIM Cards',
              instruction: 'Remove any external storage card containing personal photos or files.',
              critical: true
            }
          ]
        };
      }
    }

    if (category === 'laptop' || category === 'desktop') {
      const isMac = brand.includes('apple') || (device.model || '').toLowerCase().includes('mac');
      if (isMac) {
        return {
          device_type: 'macOS Computer',
          recommended_method: 'NIST_PURGE',
          standard: 'NIST SP 800-88 Rev 1 (Purge / Erase Assistant)',
          estimated_duration_minutes: 15,
          warning_text: 'Ensure all files are backed up to Time Machine before initiating system erase.',
          steps: [
            {
              id: 'sign_out_apple_id',
              title: 'Sign out of Apple ID',
              instruction: 'System Settings > [Your Name] > Sign Out. Turn off Find My Mac.',
              critical: true
            },
            {
              id: 'erase_all_content',
              title: 'Run Erase Assistant',
              instruction: 'System Settings > General > Transfer or Reset > Erase All Content and Settings. T2/Apple Silicon destroys APFS Volume Group encryption master keys.',
              critical: true
            },
            {
              id: 'reset_nvram',
              title: 'Clear NVRAM / Hardware Variables (Intel only)',
              instruction: 'Restart holding Option-Command-P-R for 20 seconds if on an Intel Mac.',
              critical: false
            }
          ]
        };
      } else {
        return {
          device_type: 'Windows / PC Computer',
          recommended_method: 'NIST_PURGE',
          standard: 'NIST SP 800-88 Rev 1 (BitLocker Destruction & Clean Drive)',
          estimated_duration_minutes: 25,
          warning_text: 'Select "Fully clean the drive" rather than quick reset to prevent forensic file carving.',
          steps: [
            {
              id: 'backup_data',
              title: 'Sign Out & Back Up Files',
              instruction: 'Ensure OneDrive, browser profiles, and corporate VPN accounts are disconnected.',
              critical: false
            },
            {
              id: 'windows_reset',
              title: 'Windows Recovery Reset',
              instruction: 'Settings > System > Recovery > Reset this PC > Select "Remove everything" > Choose "Clean data" (full overwrite of free sectors).',
              critical: true
            },
            {
              id: 'tpm_clear',
              title: 'Clear TPM Security Keys (Optional BIOS step)',
              instruction: 'Reboot into BIOS/UEFI setup > Security > Clear TPM / Intel PTT credentials.',
              critical: false
            }
          ]
        };
      }
    }

    // Default general electronics
    return {
      device_type: 'General Consumer Electronics',
      recommended_method: 'FACTORY_RESET_ENCRYPTED',
      standard: 'NIST SP 800-88 Rev 1',
      estimated_duration_minutes: 5,
      warning_text: 'Ensure device is physically unlinked from cloud companion apps.',
      steps: [
        {
          id: 'companion_app_unpair',
          title: 'Unpair from Smartphone Companion App',
          instruction: 'Open manufacturer app and select "Forget Device" or "Delete Device".',
          critical: true
        },
        {
          id: 'hardware_factory_reset',
          title: 'Hold Factory Reset Pin/Button',
          instruction: 'Depress physical reset button for 10-15 seconds until status LED flashes amber/red.',
          critical: true
        }
      ]
    };
  }

  /**
   * Generate tamper-evident SHA-256 certificate for completed sanitization
   */
  static generateCertificate(
    device: Device,
    sanitization: SanitizationRecord
  ): { certificate: Omit<CertificateRecord, 'id' | 'issued_at'>; hash: string } {
    const certNumber = `ECO-NIST-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = JSON.stringify({
      cert_number: certNumber,
      device_id: device.id,
      brand: device.brand,
      model: device.model,
      category: device.category,
      sanitization_method: sanitization.method,
      standard: sanitization.standard,
      verification_type: sanitization.verification_type,
      timestamp: new Date().toISOString()
    });

    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      certificate: {
        device_id: device.id,
        sanitization_id: sanitization.id,
        certificate_number: certNumber,
        certificate_hash: hash,
        verification_status: 'ISSUED'
      },
      hash
    };
  }
}
