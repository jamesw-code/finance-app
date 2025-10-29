export interface TransactionSplit {
  categoryId: number;
  amount: number;
  memo?: string | null;
}

export interface Transaction {
  id: number;
  businessId: number;
  accountId: number;
  accountName?: string | null;
  payee: string;
  memo?: string | null;
  postedAt: string;
  amount: number;
  vendorId?: number | null;
  vendorName?: string | null;
  splits: TransactionSplit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionRequest {
  businessId: number;
  accountId: number;
  payee: string;
  memo?: string | null;
  postedAt: string;
  amount: number;
  vendorId?: number | null;
  splits: TransactionSplit[];
}
