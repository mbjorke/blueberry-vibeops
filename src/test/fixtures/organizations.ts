export interface Organization {
  id: string;
  name: string;
  logo_initial: string;
  logo_color: string;
  is_org_admin: boolean;
}

export const mockOrganization1: Organization = {
  id: 'org-1',
  name: 'Test Organization 1',
  logo_initial: 'T',
  logo_color: 'bg-blue-500',
  is_org_admin: true,
};

export const mockOrganization2: Organization = {
  id: 'org-2',
  name: 'Test Organization 2',
  logo_initial: 'T',
  logo_color: 'bg-green-500',
  is_org_admin: false,
};

export const mockOrganizations: Organization[] = [
  mockOrganization1,
  mockOrganization2,
];
