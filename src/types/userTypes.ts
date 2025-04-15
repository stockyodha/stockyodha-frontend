// Based on #/components/schemas/UserRead
export interface UserRead {
  id: string; // UUID
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  virtual_balance: string; // Use string for precision, convert to number/Decimal if needed for display/calc
  funds_on_hold: string; // Use string for precision
  created_at: string; // ISO DateTime string
  updated_at: string | null; // ISO DateTime string
}

// Based on #/components/schemas/UserCreate
export interface UserCreate {
  username: string;
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  // is_active, is_admin usually defaults on backend
}

// Based on #/components/schemas/UserUpdate
export interface UserUpdate {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  // is_active and is_admin are usually admin-only operations
}

// Based on #/components/schemas/UserPasswordUpdate
export interface UserPasswordUpdate {
  current_password: string;
  new_password: string;
} 