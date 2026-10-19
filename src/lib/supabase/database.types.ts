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
  plan_date: string | null;
  status: string;
  title: string;
};

type CommentRow = {
  author_id: string; body: string; created_at: string; deleted_at: string | null; depth: number;
  id: string; parent_id: string | null; plan_id: string | null; target_id: string; target_type: string;
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
        Row: { joined_at: string; last_seen_at: string; plan_id: string; role: string; user_id: string };
        Insert: { joined_at?: string; last_seen_at?: string; plan_id: string; role?: string; user_id: string };
        Update: { joined_at?: string; last_seen_at?: string; plan_id?: string; role?: string; user_id?: string };
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
      friendships: {
        Row: { addressee_id: string; created_at: string; requester_id: string; status: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      plan_invites: {
        Row: { created_at: string; from_user: string; plan_id: string; to_user: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      comments: {
        Row: { author_id: string; body: string; created_at: string; deleted_at: string | null; depth: number; id: string; parent_id: string | null; plan_id: string | null; target_id: string; target_type: string };
        Insert: never;
        Update: never;
        Relationships: [
          { foreignKeyName: 'comments_author_id_fkey'; columns: ['author_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'comments_parent_id_fkey'; columns: ['parent_id']; isOneToOne: false; referencedRelation: 'comments'; referencedColumns: ['id'] },
          { foreignKeyName: 'comments_plan_id_fkey'; columns: ['plan_id']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['id'] },
        ];
      };
      comment_reactions: {
        Row: { comment_id: string; created_at: string; emoji: string; user_id: string };
        Insert: { comment_id: string; created_at?: string; emoji: string; user_id: string };
        Update: { comment_id?: string; created_at?: string; emoji?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: 'comment_reactions_comment_id_fkey'; columns: ['comment_id']; isOneToOne: false; referencedRelation: 'comments'; referencedColumns: ['id'] },
        ];
      };
      comment_reports: {
        Row: { comment_id: string; created_at: string; id: string; reason: string | null; reporter_id: string };
        Insert: { comment_id: string; created_at?: string; id?: string; reason?: string | null; reporter_id: string };
        Update: never;
        Relationships: [];
      };
      profiles: {
        Row: { created_at: string; display_name: string; friend_code: string; id: string };
        Insert: { created_at?: string; display_name: string; friend_code?: string; id: string };
        Update: { created_at?: string; display_name?: string; friend_code?: string; id?: string };
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
        Returns: { events: Json; member_names: string[]; organizer_name: string; plan_date: string | null; plan_id: string; status: string; title: string }[];
      };
      update_plan: {
        Args: { p_plan_date: string | null; p_plan_id: string; p_title: string };
        Returns: PlanRow;
        SetofOptions: { from: '*'; to: 'plans'; isOneToOne: true; isSetofReturn: false };
      };
      add_comment: {
        Args: { p_body: string; p_display_name?: string; p_parent_id: string | null; p_target_id: string; p_target_type: string };
        Returns: CommentRow;
        SetofOptions: { from: '*'; to: 'comments'; isOneToOne: true; isSetofReturn: false };
      };
      delete_comment: { Args: { p_comment_id: string }; Returns: undefined };
      mark_plan_seen: { Args: { p_plan_id: string }; Returns: undefined };
      my_unread: {
        Args: Record<PropertyKey, never>;
        Returns: { decided: boolean; new_comments: number; new_events: number; new_members: number; new_votes: number; plan_id: string }[];
      };
      set_display_name: {
        Args: { p_name: string };
        Returns: { created_at: string; display_name: string; friend_code: string; id: string };
        SetofOptions: { from: '*'; to: 'profiles'; isOneToOne: true; isSetofReturn: false };
      };
      my_friend_code: { Args: Record<PropertyKey, never>; Returns: string };
      friend_preview: { Args: { p_code: string }; Returns: { display_name: string; user_id: string }[] };
      add_friend: { Args: { p_code: string }; Returns: string };
      respond_friend: { Args: { p_accept: boolean; p_requester: string }; Returns: undefined };
      remove_friend: { Args: { p_other: string }; Returns: undefined };
      my_friends: { Args: Record<PropertyKey, never>; Returns: { display_name: string; relation: string; user_id: string }[] };
      invite_friend: { Args: { p_friend: string; p_plan_id: string }; Returns: undefined };
      my_invites: {
        Args: Record<PropertyKey, never>;
        Returns: { created_at: string; event_count: number; from_name: string; plan_date: string | null; plan_id: string; plan_title: string; status: string }[];
      };
      accept_invite: { Args: { p_plan_id: string }; Returns: string };
      decline_invite: { Args: { p_plan_id: string }; Returns: undefined };
      join_plan: { Args: { p_display_name: string; p_invite_code: string }; Returns: string };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
