import { describe, it, expect } from 'vitest';
import { 
  integrationRoadmap, 
  migrationSteps,
  getCategoryLabel, 
  getStatusLabel,
  type IntegrationItem,
  type IntegrationStatus
} from './integrationRoadmap';

describe('integrationRoadmap data', () => {
  it('should have items with required fields', () => {
    integrationRoadmap.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.description).toBeDefined();
      expect(item.status).toBeDefined();
      expect(item.category).toBeDefined();
    });
  });

  it('should have unique IDs', () => {
    const ids = integrationRoadmap.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid status values', () => {
    const validStatuses: IntegrationStatus[] = ['supported', 'manual', 'coming-soon', 'not-supported'];
    integrationRoadmap.forEach(item => {
      expect(validStatuses).toContain(item.status);
    });
  });

  it('should have valid category values', () => {
    const validCategories: IntegrationItem['category'][] = [
      'database', 'auth', 'hosting', 'ci-cd', 'security', 'monitoring'
    ];
    integrationRoadmap.forEach(item => {
      expect(validCategories).toContain(item.category);
    });
  });

  it('should have items with workarounds for manual/not-supported status', () => {
    const manualItems = integrationRoadmap.filter(
      item => item.status === 'manual' || item.status === 'not-supported'
    );
    manualItems.forEach(item => {
      expect(item.workaround).toBeDefined();
      expect(item.workaround!.length).toBeGreaterThan(0);
    });
  });
});

describe('migrationSteps data', () => {
  it('should have steps with required fields', () => {
    migrationSteps.forEach(step => {
      expect(step.id).toBeDefined();
      expect(step.title).toBeDefined();
      expect(step.description).toBeDefined();
      expect(step.warningLevel).toBeDefined();
      expect(step.applicableWhen).toBeDefined();
    });
  });

  it('should have unique IDs', () => {
    const ids = migrationSteps.map(step => step.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid warning levels', () => {
    const validLevels = ['info', 'warning', 'critical'];
    migrationSteps.forEach(step => {
      expect(validLevels).toContain(step.warningLevel);
    });
  });

  it('should have critical steps for important operations', () => {
    const criticalSteps = migrationSteps.filter(s => s.warningLevel === 'critical');
    expect(criticalSteps.length).toBeGreaterThan(0);
  });
});

describe('getCategoryLabel', () => {
  it('should return correct labels for all categories', () => {
    expect(getCategoryLabel('database')).toBe('Database');
    expect(getCategoryLabel('auth')).toBe('Authentication');
    expect(getCategoryLabel('hosting')).toBe('Hosting & Deployment');
    expect(getCategoryLabel('ci-cd')).toBe('CI/CD');
    expect(getCategoryLabel('security')).toBe('Security');
    expect(getCategoryLabel('monitoring')).toBe('Monitoring');
  });
});

describe('getStatusLabel', () => {
  it('should return correct labels for all statuses', () => {
    expect(getStatusLabel('supported')).toBe('Fully Supported');
    expect(getStatusLabel('manual')).toBe('Manual Setup Required');
    expect(getStatusLabel('coming-soon')).toBe('Coming Soon');
    expect(getStatusLabel('not-supported')).toBe('Not Supported');
  });
});
