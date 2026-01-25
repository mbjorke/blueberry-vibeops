import type { Project } from '@/types/project';

export const mockProject1: Project = {
  id: 'project-1',
  name: 'Test Project 1',
  industry: 'Software',
  status: 'healthy',
  environments: {
    dev: 'ok',
    staging: 'ok',
    prod: 'ok',
  },
  securityScore: 95,
  gdprCompliant: true,
  gdprWarning: false,
  lastDeploy: '2024-01-15T10:00:00Z',
  issues: [],
  logoInitial: 'T',
  logoColor: 'bg-blue-500',
};

export const mockProject2: Project = {
  id: 'project-2',
  name: 'Test Project 2',
  industry: 'Finance',
  status: 'warning',
  environments: {
    dev: 'ok',
    staging: 'warning',
    prod: 'ok',
  },
  securityScore: 75,
  gdprCompliant: false,
  gdprWarning: true,
  lastDeploy: '2024-01-10T10:00:00Z',
  issues: ['Security vulnerability detected'],
  logoInitial: 'T',
  logoColor: 'bg-green-500',
};

export const mockProjects: Project[] = [mockProject1, mockProject2];
