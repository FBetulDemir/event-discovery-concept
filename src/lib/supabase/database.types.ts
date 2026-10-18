/**
 * Database types for the `public` schema. Generated with the Supabase type generator
 * (project monkey-match) and trimmed to `Database`; regenerate after every migration.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type PlanRow = {
  created_at: string;
  decided_at: string | null;
  decided_plan_event_id: string | null;
  id: string;
  invite_code: string;
  organizer_id: string;
  status: string;
  title: string;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.18' };
  public: {
    Tables: {
      plan_events: {
        Row: { added_by: string; created_at: string; external_id: string; id: string; plan_id: string; snapshot: Json; source: string };
        Insert: { added_by: string; created_at?: string; external_id: string; id?: string; plan_id: string; snapshot: Json; source: string };
        Update: { added_by?: string; created_at?: string; external_id?: string; id?: string; plan_id?: string; snapshot?: Json; source?: string };
        Relationships: [
          { foreignKeyName: 'plan_events_added_by_fkey'; columns: ['added_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'plan_events_plan_id_fkey'; columns: ['plan_id']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['id'] },
        ];
      };
      plan_members: {
        Row: { joined_at: string; plan_id: string; role: string; user_id: string };
        Insert: { joined_at?: string; plan_id: string; role?: string; user_id: string };
        Update: { joined_at?: string; plan_id?: string; role?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: 'plan_members_plan_id_fkey'; columns: ['plan_id']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['id'] },
          { foreignKeyName: 'plan_members_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      plans: {
        Row: PlanRow;
        Insert: Partial<PlanRow> & { organizer_id: string; title: string };
        Update: Partial<PlanRow>;
        Relationships: [
          { foreignKeyName: 'plans_decided_plan_event_fk'; columns: ['decided_plan_event_id']; isOneToOne: false; referencedRelation: 'plan_events'; referencedColumns: ['id'] },
        ];
      };
      profiles: {
        Row: { created_at: string; display_name: string; id: string };
        Insert: { created_at?: string; display_name: string; id: string };
        Update: { created_at?: string; display_name?: string; id?: string };
        Relationships: [];
      };
      votes: {
        Row: { created_at: string; plan_event_id: string; plan_id: string; user_id: string };
        Insert: { created_at?: string; plan_event_id: string; plan_id: string; user_id: string };
        Update: { created_at?: string; plan_event_id?: string; plan_id?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: 'votes_plan_event_id_plan_id_fkey'; columns: ['plan_event_id', 'plan_id']; isOneToOne: false; referencedRelation: 'plan_events'; referencedColumns: ['id', 'plan_id'] },
          { foreignKeyName: 'votes_plan_id_user_id_fkey'; columns: ['plan_id', 'user_id']; isOneToOne: true; referencedRelation: 'plan_members'; referencedColumns: ['plan_id', 'user_id'] },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      close_plan: {
        Args: { p_plan_event_id?: string; p_plan_id: string };
        Returns: PlanRow;
        SetofOptions: { from: '*'; to: 'plans'; isOneToOne: true; isSetofReturn: false };
      };
      create_plan: {
        Args: { p_display_name: string; p_title: string };
        Returns: PlanRow;
        SetofOptions: { from: '*'; to: 'plans'; isOneToOne: true; isSetofReturn: false };
      };
      get_plan_preview: {
        Args: { p_invite_code: string };
        Returns: { member_count: number; organizer_name: string; plan_id: string; status: string; title: string }[];
      };
      join_plan: { Args: { p_display_name: string; p_invite_code: string }; Returns: string };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
