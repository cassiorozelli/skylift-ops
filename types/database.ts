export type Database = {
  public: {
    Tables: {
      mono_flights: {
        Row: Flight
        Insert: Omit<Flight, "id" | "created_at">
        Update: Partial<Omit<Flight, "id">>
      }
      jato_flights: {
        Row: Flight
        Insert: Omit<Flight, "id" | "created_at">
        Update: Partial<Omit<Flight, "id">>
      }
      helicoptero_flights: {
        Row: Flight
        Insert: Omit<Flight, "id" | "created_at">
        Update: Partial<Omit<Flight, "id">>
      }
      flights_history: {
        Row: HistoricalFlight
      }
      email_processing_status: {
        Row: EmailProcessingStatus
      }
      flight_durations: {
        Row: {
          id: string
          aeronave: string
          origem: string
          destino: string
          tempo_medio_minutos: number
        }
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at">
        Update: Partial<Omit<Profile, "id">>
      }
      admin_users: {
        Row: AdminUser
        Insert: Omit<AdminUser, "id" | "created_at">
        Update: Partial<Omit<AdminUser, "id">>
      }
      daily_report_recipients: {
        Row: DailyReportRecipient
        Insert: Omit<DailyReportRecipient, "id" | "created_at">
        Update: Partial<Omit<DailyReportRecipient, "id">>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Flight = {
  id: string
  flight_id: string
  data: string
  hora: string | null
  aeronave: string | null
  destino: string | null
  passageiros: string | null
  piloto1?: string | null
  piloto2?: string | null
  pilot_1_id?: string | null
  pilot_2_id?: string | null
  ordem_dia: number | null
  created_at?: string
  active?: boolean
  dia_semana?: string | null
  last_seen_email?: string | null
  tempo_voo?: number | null
}

export type Pilot = {
  id: string
  name: string
  license_number: string | null
  base: string | null
}

export type HistoricalFlight = {
  id?: string
  tipo_operacao?: "mono" | "jato" | "helicoptero"
  flight_id: string
  data: string
  dia_semana: string | null
  hora: string | null
  aeronave: string | null
  destino: string | null
  passageiros: string | null
  ordem_dia: number | null
  status?: "archived" | "cancelled" | null
  archived_at: string
}

export type EmailProcessingStatus = {
  tipo_operacao: string
  last_email_subject: string | null
  last_email_from: string | null
  last_email_received: string | null
  last_processed_at: string | null
  last_added?: number | null
  last_updated?: number | null
  last_cancelled?: number | null
}

export type ProcessingSummary = {
  added: number
  updated: number
  cancelled: number
}

export type Profile = {
  id: string
  role: "admin" | "operacoes"
  created_at: string
}

export type FlightTable = "mono_flights" | "jato_flights" | "helicoptero_flights"

export type AdminUser = {
  id: string
  email: string
  created_at?: string
}

export type DailyReportRecipient = {
  id: string
  email: string
  send_mono: boolean
  send_jato: boolean
  send_helicoptero: boolean
  send_all: boolean
  active: boolean
  created_at?: string
}

export type TipoDetectado = "helicoptero" | "mono" | "jato"
