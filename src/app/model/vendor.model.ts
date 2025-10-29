export interface Vendor {
  id: number;
  businessId: number;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
