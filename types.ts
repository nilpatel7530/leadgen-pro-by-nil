
export interface BusinessLead {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  googleMapsUrl: string;
  hasWebsite: boolean;
  techStack: string[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  score: number;
  opportunities: string[];
  timestamp: string;
}

export interface SearchJob {
  id: string;
  city: string;
  businessType: string;
  serviceFocus: string[];
  status: 'pending' | 'running' | 'completed' | 'paused';
  progress: number;
  totalFound: number;
  leads: BusinessLead[];
}

export enum OpportunityType {
  WEBSITE_DEV = 'Website Development',
  ECOMMERCE = 'E-commerce Setup',
  CRM_ERP = 'CRM/ERP Implementation',
  SMM = 'Social Media Management',
  DIGITAL_TRANSFORMATION = 'Digital Transformation'
}
