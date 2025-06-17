import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs if needed client-side

// Interface definitions remain the same
export interface Receipt {
  id: number // Corresponds to bigint in Supabase
  file_name: string
  upload_time: string // Supabase timestampz will be string
  merchant_name?: string
  transaction_date?: string // Supabase date will be string YYYY-MM-DD
  original_currency?: string
  original_total?: number
  base_currency?: string
  converted_total?: number
  json_data?: string // Supabase jsonb can be parsed
}

export interface ReconciliationRecord {
  id: number // Corresponds to bigint in Supabase
  receipt_id: number
  user_id?: string // UUID from users table
  reconciliation_time: string // Supabase timestampz
  transaction_date?: string
  original_currency?: string
  original_total?: number
  base_currency?: string
  converted_total?: number
  exchange_rate?: number
  rate_source?: string
  status?: string
  notes?: string
  file_name?: string
  merchant_name?: string
}

export interface User {
  id: string // UUID
  name: string
  email: string
  avatar?: string
  created_at: string // Supabase timestampz
  updated_at: string // Supabase timestampz
}


export const dbManager = {
  // Receipt methods
  async getAllReceipts(): Promise<Receipt[]> {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('upload_time', { ascending: false })

    if (error) {
      console.error('Error fetching receipts:', error)
      throw error
    }
    return data || []
  },

  async insertReceipt(receiptData: Omit<Receipt, "id" | "upload_time"> & { upload_time?: string }): Promise<{ lastID: number }> {
    const payload = {
      ...receiptData,
      upload_time: receiptData.upload_time || new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('receipts')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('Error inserting receipt:', error)
      throw error
    }
    if (!data) {
        throw new Error('Failed to insert receipt or retrieve ID')
    }
    console.log(`Receipt inserted with ID ${data.id}`)
    return { lastID: data.id }
  },

  async updateReceiptConversion(id: number, convertedTotal: number, baseCurrency: string): Promise<void> {
    const { error } = await supabase
      .from('receipts')
      .update({ converted_total: convertedTotal, base_currency: baseCurrency })
      .eq('id', id)

    if (error) {
      console.error(`Error updating receipt ${id} conversion:`, error)
      throw error
    }
    console.log(`Receipt ${id} updated with conversion: ${convertedTotal} ${baseCurrency}`)
  },

  async getReceiptById(id: number): Promise<Receipt | null> {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116: Row not found, which is fine for .single()
      console.error(`Error fetching receipt ${id}:`, error)
      throw error
    }
    return data || null
  },

  // Reconciliation methods
  async insertReconciliation(
    reconciliationData: Omit<ReconciliationRecord, "id" | "reconciliation_time" | "file_name" | "merchant_name"> & {
        reconciliation_time?: string;
        user_id?: string; // Optional user_id
    }
  ): Promise<void> {
    const receipt = await this.getReceiptById(reconciliationData.receipt_id);

    const payload = {
        ...reconciliationData,
        reconciliation_time: reconciliationData.reconciliation_time || new Date().toISOString(),
        file_name: receipt?.file_name, // Populate from related receipt
        merchant_name: receipt?.merchant_name, // Populate from related receipt
    };

    const { error } = await supabase
      .from('reconciliations')
      .insert(payload)

    if (error) {
      console.error('Error inserting reconciliation:', error)
      throw error
    }
    console.log('Reconciliation inserted successfully')
  },

  async getReconciliationHistory(): Promise<ReconciliationRecord[]> {
    // file_name and merchant_name are now part of the reconciliations table
    // If they were not, you would do a join:
    // .select('*, receipts(file_name, merchant_name)')
    const { data, error } = await supabase
      .from('reconciliations')
      .select('*')
      .order('reconciliation_time', { ascending: false })

    if (error) {
      console.error('Error fetching reconciliation history:', error)
      throw error
    }
    return data || []
  },

  // User methods
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching user by ID ${id}:`, error)
      throw error
    }
    return data || null
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching user by email ${email}:`, error)
      throw error
    }
    return data || null
  },

  async createUser(userData: Omit<User, "id" | "created_at" | "updated_at"> & {id?: string}): Promise<User> {
    // If an ID is provided (e.g., from Supabase Auth), use it. Otherwise, Supabase will generate a UUID.
    const payload: Partial<User> = { ...userData };
    if (!payload.id) {
        // Supabase will generate a UUID if `id` is not provided and column has default gen_random_uuid()
    }

    const { data, error } = await supabase
      .from('users')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }
    if (!data) {
        throw new Error('User creation failed or did not return data.')
    }
    console.log(`User created with ID ${data.id}`)
    return data
  },

  async updateUser(id: string, updates: Partial<Omit<User, "id" | "created_at" | "updated_at">>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() }) // Manually set updated_at if no trigger
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating user ${id}:`, error)
      throw error
    }
    console.log(`User ${id} updated successfully`)
    return data || null
  },

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')

    if (error) {
      console.error('Error fetching all users:', error)
      throw error
    }
    return data || []
  },

  // Debug methods
  async debug() {
    const { count: receiptsCount, error: receiptsError } = await supabase.from('receipts').select('*', { count: 'exact', head: true });
    const { count: reconciliationsCount, error: reconciliationsError } = await supabase.from('reconciliations').select('*', { count: 'exact', head: true });
    const { count: usersCount, error: usersError } = await supabase.from('users').select('*', { count: 'exact', head: true });

    if (receiptsError || reconciliationsError || usersError) {
        console.error("Error fetching counts:", receiptsError, reconciliationsError, usersError);
    }

    return {
      receiptsCount: receiptsCount ?? 0,
      reconciliationsCount: reconciliationsCount ?? 0,
      usersCount: usersCount ?? 0,
      // nextReceiptId and nextReconciliationId are handled by Supabase auto-increment
    }
  },

  // For testing only - be careful
  async _clearAll() {
    console.warn('Clearing all data from Supabase tables...');
    const tables = ['reconciliations', 'receipts', 'users']; // Order matters for FK constraints
    for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', uuidv4()); // Delete all rows. A bit of a hack with neq.
        if (error) {
            console.error(`Error clearing table ${table}:`, error);
            // Don't throw, attempt to clear other tables
        } else {
            console.log(`Table ${table} cleared.`);
        }
    }
  },
}