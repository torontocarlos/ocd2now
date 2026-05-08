// Hand-written mirror of db/migrations/0001_ocd2now_schema.sql.
// Per playbook §3: do NOT run `supabase gen types`. When the SQL migration
// changes, update this file in the same PR. Use `type` aliases — `interface`
// causes postgrest-js result types to resolve to `never`.

export type UserType = "ocd" | "unsure" | "other" | "unset";

export type OcdUserRow = {
  id: string;
  email: string;
  user_type: UserType;
  onboarded_at: string | null;
  created_at: string;
  total_sessions: number;
  weeks_active: number;
  last_invitation_id: number | null;
  on_ramp_shown_at: string | null;
};

export type OcdUserInsert = {
  id: string;
  email: string;
  user_type?: UserType;
  onboarded_at?: string | null;
  created_at?: string;
  total_sessions?: number;
  weeks_active?: number;
  last_invitation_id?: number | null;
  on_ramp_shown_at?: string | null;
};

export type OcdUserUpdate = Partial<OcdUserInsert>;

export type OcdSessionRow = {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  invitation_id: number | null;
  completed: boolean;
  daily_session_count_at_start: number | null;
};

export type OcdSessionInsert = {
  id?: string;
  user_id: string;
  started_at?: string;
  ended_at?: string | null;
  invitation_id?: number | null;
  completed?: boolean;
  daily_session_count_at_start?: number | null;
};

export type OcdSessionUpdate = Partial<OcdSessionInsert>;

export type OcdInvitationRow = {
  id: number;
  slug: string;
  title: string;
  duration_seconds: number;
  is_active: boolean;
};

export type OcdInvitationInsert = {
  id: number;
  slug: string;
  title: string;
  duration_seconds: number;
  is_active?: boolean;
};

export type OcdInvitationUpdate = Partial<OcdInvitationInsert>;

export type Database = {
  public: {
    Tables: {
      ocd_users: {
        Row: OcdUserRow;
        Insert: OcdUserInsert;
        Update: OcdUserUpdate;
        Relationships: [];
      };
      ocd_sessions: {
        Row: OcdSessionRow;
        Insert: OcdSessionInsert;
        Update: OcdSessionUpdate;
        Relationships: [];
      };
      ocd_invitations: {
        Row: OcdInvitationRow;
        Insert: OcdInvitationInsert;
        Update: OcdInvitationUpdate;
        Relationships: [];
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
};
