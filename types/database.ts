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
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at">
        Update: Partial<Omit<Profile, "id">>
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
  piloto1: string | null
  piloto2: string | null
  ordem_dia: number | null
  created_at: string
}

export type Profile = {
  id: string
  role: "admin" | "operacoes"
  created_at: string
}

export type FlightTable = "mono_flights" | "jato_flights" | "helicoptero_flights"
