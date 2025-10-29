export enum CategoryKind {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER'
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  businessId: number;
  parentCategoryId?: number | null;
  kind: CategoryKind;
  active: boolean;
}
