export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          explanation_json: Json | null
          id: string
          job_id: string | null
          score: number | null
          stage: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          explanation_json?: Json | null
          id?: string
          job_id?: string | null
          score?: number | null
          stage?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          explanation_json?: Json | null
          id?: string
          job_id?: string | null
          score?: number | null
          stage?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_certifications: {
        Row: {
          candidate_id: string
          certification_name: string
          created_at: string | null
          credential_id: string | null
          credential_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_organization: string | null
        }
        Insert: {
          candidate_id: string
          certification_name: string
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
        }
        Update: {
          candidate_id?: string
          certification_name?: string
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_certifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_certifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_certifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          candidate_id: string
          created_at: string | null
          degree: string
          field: string | null
          gpa: string | null
          graduation_date: string | null
          id: string
          institution: string
          year: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          degree: string
          field?: string | null
          gpa?: string | null
          graduation_date?: string | null
          id?: string
          institution: string
          year?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          degree?: string
          field?: string | null
          gpa?: string | null
          graduation_date?: string | null
          id?: string
          institution?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_experience: {
        Row: {
          candidate_id: string
          company: string
          created_at: string | null
          description: string | null
          duration: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          position: string
          start_date: string | null
        }
        Insert: {
          candidate_id: string
          company: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          position: string
          start_date?: string | null
        }
        Update: {
          candidate_id?: string
          company?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          position?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_experience_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_experience_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_experience_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_languages: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          language: string
          proficiency: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          language: string
          proficiency?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          language?: string
          proficiency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_languages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_languages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_languages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_projects: {
        Row: {
          candidate_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          github_url: string | null
          id: string
          name: string
          project_url: string | null
          start_date: string | null
          technologies: string[] | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          name: string
          project_url?: string | null
          start_date?: string | null
          technologies?: string[] | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          name?: string
          project_url?: string | null
          start_date?: string | null
          technologies?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_projects_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_projects_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_projects_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_skills: {
        Row: {
          candidate_id: string | null
          skill: string | null
          source: string | null
        }
        Insert: {
          candidate_id?: string | null
          skill?: string | null
          source?: string | null
        }
        Update: {
          candidate_id?: string | null
          skill?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_skills_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_skills_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_skills_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          availability: string | null
          created_at: string | null
          current_company: string | null
          current_position: string | null
          email: string | null
          id: string
          linkedin: string | null
          location: string | null
          name: string | null
          phone: string | null
          portfolio: string | null
          preferred_location: string | null
          resume_embedding: string | null
          resume_embedding_h: unknown | null
          resume_text: string | null
          salary_expectation: string | null
          summary: string | null
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          current_company?: string | null
          current_position?: string | null
          email?: string | null
          id?: string
          linkedin?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          portfolio?: string | null
          preferred_location?: string | null
          resume_embedding?: string | null
          resume_embedding_h?: unknown | null
          resume_text?: string | null
          salary_expectation?: string | null
          summary?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          current_company?: string | null
          current_position?: string | null
          email?: string | null
          id?: string
          linkedin?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          portfolio?: string | null
          preferred_location?: string | null
          resume_embedding?: string | null
          resume_embedding_h?: unknown | null
          resume_text?: string | null
          salary_expectation?: string | null
          summary?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      job_candidate_matches: {
        Row: {
          candidate_id: string
          confidence: number | null
          created_at: string | null
          final_score: number | null
          id: string
          job_id: string
          ranking_explanation: Json | null
          rule_score: number | null
          screening_summary: string | null
          similarity_score: number | null
          top_skills: Json | null
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          confidence?: number | null
          created_at?: string | null
          final_score?: number | null
          id?: string
          job_id: string
          ranking_explanation?: Json | null
          rule_score?: number | null
          screening_summary?: string | null
          similarity_score?: number | null
          top_skills?: Json | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          confidence?: number | null
          created_at?: string | null
          final_score?: number | null
          id?: string
          job_id?: string
          ranking_explanation?: Json | null
          rule_score?: number | null
          screening_summary?: string | null
          similarity_score?: number | null
          top_skills?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_candidate_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_candidate_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_candidate_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_candidate_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_competencies: {
        Row: {
          competency: string
          job_id: string | null
          weight: number | null
        }
        Insert: {
          competency: string
          job_id?: string | null
          weight?: number | null
        }
        Update: {
          competency?: string
          job_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_competencies_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          created_by: string | null
          department: string | null
          employment_type: string | null
          id: string
          jd_embedding: string | null
          jd_embedding_h: unknown | null
          jd_text: string
          level: string | null
          location: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          employment_type?: string | null
          id?: string
          jd_embedding?: string | null
          jd_embedding_h?: unknown | null
          jd_text: string
          level?: string | null
          location?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          employment_type?: string | null
          id?: string
          jd_embedding?: string | null
          jd_embedding_h?: unknown | null
          jd_text?: string
          level?: string | null
          location?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      linkedin_jobs: {
        Row: {
          ats_apply_link: string | null
          card_url: string | null
          company_name: string | null
          created_at: string | null
          id: number
          job_description: string | null
          job_id: string
          job_location: string | null
          job_title: string | null
          job_type: string | null
          posting_time_text: string | null
          scraped_at: string | null
          search_url: string | null
          work_setting: string | null
        }
        Insert: {
          ats_apply_link?: string | null
          card_url?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: number
          job_description?: string | null
          job_id: string
          job_location?: string | null
          job_title?: string | null
          job_type?: string | null
          posting_time_text?: string | null
          scraped_at?: string | null
          search_url?: string | null
          work_setting?: string | null
        }
        Update: {
          ats_apply_link?: string | null
          card_url?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: number
          job_description?: string | null
          job_id?: string
          job_location?: string | null
          job_title?: string | null
          job_type?: string | null
          posting_time_text?: string | null
          scraped_at?: string | null
          search_url?: string | null
          work_setting?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_level: string | null
          desired_degree: string | null
          det_score: string | null
          email: string | null
          embedding: string | null
          field_of_study: string | null
          full_name: string | null
          gmat_score: string | null
          graduation_percentage: number | null
          gre_score: string | null
          has_det: boolean | null
          has_gmat: boolean | null
          has_gre: boolean | null
          has_ielts: boolean | null
          has_pte: boolean | null
          has_toefl: boolean | null
          highest_education_level: string | null
          id: string
          ielts_score: string | null
          isd_code: string | null
          mobile_number: string | null
          nationality: string | null
          preferred_countries: string[] | null
          profile_complete: boolean | null
          pte_score: string | null
          study_abroad_exam_status: string | null
          study_start_plan: string | null
          toefl_score: string | null
          updated_at: string | null
        }
        Insert: {
          academic_level?: string | null
          desired_degree?: string | null
          det_score?: string | null
          email?: string | null
          embedding?: string | null
          field_of_study?: string | null
          full_name?: string | null
          gmat_score?: string | null
          graduation_percentage?: number | null
          gre_score?: string | null
          has_det?: boolean | null
          has_gmat?: boolean | null
          has_gre?: boolean | null
          has_ielts?: boolean | null
          has_pte?: boolean | null
          has_toefl?: boolean | null
          highest_education_level?: string | null
          id: string
          ielts_score?: string | null
          isd_code?: string | null
          mobile_number?: string | null
          nationality?: string | null
          preferred_countries?: string[] | null
          profile_complete?: boolean | null
          pte_score?: string | null
          study_abroad_exam_status?: string | null
          study_start_plan?: string | null
          toefl_score?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_level?: string | null
          desired_degree?: string | null
          det_score?: string | null
          email?: string | null
          embedding?: string | null
          field_of_study?: string | null
          full_name?: string | null
          gmat_score?: string | null
          graduation_percentage?: number | null
          gre_score?: string | null
          has_det?: boolean | null
          has_gmat?: boolean | null
          has_gre?: boolean | null
          has_ielts?: boolean | null
          has_pte?: boolean | null
          has_toefl?: boolean | null
          highest_education_level?: string | null
          id?: string
          ielts_score?: string | null
          isd_code?: string | null
          mobile_number?: string | null
          nationality?: string | null
          preferred_countries?: string[] | null
          profile_complete?: boolean | null
          pte_score?: string | null
          study_abroad_exam_status?: string | null
          study_start_plan?: string | null
          toefl_score?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          actual_apply_link: string | null
          applicable_course_levels: string | null
          applicable_for_details: Json | null
          applicable_for_summary: string | null
          application_documents_required: Json | null
          application_process_notes: string | null
          author_name: string | null
          author_title: string | null
          awarded_by: string | null
          contact_email: string | null
          course_stream_details: Json | null
          course_stream_summary: string | null
          created_at: string
          deadline: string | null
          eligibility_details: string | null
          eligible_student_nationality_details: string | null
          embedding: string | null
          expense_coverage_details: Json | null
          id: number
          max_scholarship_per_student: string | null
          max_scholarship_usd: string | null
          more_information_notes: string | null
          name: string
          num_awards: string | null
          offered_by_university: string | null
          raw_source_id: string | null
          scholarship_amount_breakdown: string | null
          scholarship_frequency: string | null
          scholarship_overview: string | null
          scholarship_type: string | null
          scraped_at: string
          special_restriction_details: Json | null
          special_restriction_summary: string | null
          updated_on: string | null
          url: string | null
        }
        Insert: {
          actual_apply_link?: string | null
          applicable_course_levels?: string | null
          applicable_for_details?: Json | null
          applicable_for_summary?: string | null
          application_documents_required?: Json | null
          application_process_notes?: string | null
          author_name?: string | null
          author_title?: string | null
          awarded_by?: string | null
          contact_email?: string | null
          course_stream_details?: Json | null
          course_stream_summary?: string | null
          created_at?: string
          deadline?: string | null
          eligibility_details?: string | null
          eligible_student_nationality_details?: string | null
          embedding?: string | null
          expense_coverage_details?: Json | null
          id?: number
          max_scholarship_per_student?: string | null
          max_scholarship_usd?: string | null
          more_information_notes?: string | null
          name: string
          num_awards?: string | null
          offered_by_university?: string | null
          raw_source_id?: string | null
          scholarship_amount_breakdown?: string | null
          scholarship_frequency?: string | null
          scholarship_overview?: string | null
          scholarship_type?: string | null
          scraped_at?: string
          special_restriction_details?: Json | null
          special_restriction_summary?: string | null
          updated_on?: string | null
          url?: string | null
        }
        Update: {
          actual_apply_link?: string | null
          applicable_course_levels?: string | null
          applicable_for_details?: Json | null
          applicable_for_summary?: string | null
          application_documents_required?: Json | null
          application_process_notes?: string | null
          author_name?: string | null
          author_title?: string | null
          awarded_by?: string | null
          contact_email?: string | null
          course_stream_details?: Json | null
          course_stream_summary?: string | null
          created_at?: string
          deadline?: string | null
          eligibility_details?: string | null
          eligible_student_nationality_details?: string | null
          embedding?: string | null
          expense_coverage_details?: Json | null
          id?: number
          max_scholarship_per_student?: string | null
          max_scholarship_usd?: string | null
          more_information_notes?: string | null
          name?: string
          num_awards?: string | null
          offered_by_university?: string | null
          raw_source_id?: string | null
          scholarship_amount_breakdown?: string | null
          scholarship_frequency?: string | null
          scholarship_overview?: string | null
          scholarship_type?: string | null
          scraped_at?: string
          special_restriction_details?: Json | null
          special_restriction_summary?: string | null
          updated_on?: string | null
          url?: string | null
        }
        Relationships: []
      }
      trace_logs: {
        Row: {
          agent_name: string
          created_at: string | null
          execution_time_ms: number | null
          id: string
          job_id: string | null
          output: Json | null
          parameters: Json | null
          prompt: string | null
          sql_executed: string | null
          tool_calls: Json | null
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          job_id?: string | null
          output?: Json | null
          parameters?: Json | null
          prompt?: string | null
          sql_executed?: string | null
          tool_calls?: Json | null
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          job_id?: string | null
          output?: Json | null
          parameters?: Json | null
          prompt?: string | null
          sql_executed?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "trace_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      visafriendlyjobs: {
        Row: {
          apply_url: string | null
          cap_exempt_h1b: string | null
          company_name: string | null
          greencard_job: string | null
          id: number
          job_category: string | null
          job_description: string | null
          job_posting_date: string | null
          job_title: string | null
          keywords: string[] | null
          location: string | null
          max_experience: number | null
          max_salary: string | null
          min_experience: number | null
          min_salary: string | null
          scraped_at: string | null
          source: string | null
          sponsor_type: string | null
          startup_job: string | null
          visa_sponsoring: string | null
          work_setting: string | null
        }
        Insert: {
          apply_url?: string | null
          cap_exempt_h1b?: string | null
          company_name?: string | null
          greencard_job?: string | null
          id?: number
          job_category?: string | null
          job_description?: string | null
          job_posting_date?: string | null
          job_title?: string | null
          keywords?: string[] | null
          location?: string | null
          max_experience?: number | null
          max_salary?: string | null
          min_experience?: number | null
          min_salary?: string | null
          scraped_at?: string | null
          source?: string | null
          sponsor_type?: string | null
          startup_job?: string | null
          visa_sponsoring?: string | null
          work_setting?: string | null
        }
        Update: {
          apply_url?: string | null
          cap_exempt_h1b?: string | null
          company_name?: string | null
          greencard_job?: string | null
          id?: number
          job_category?: string | null
          job_description?: string | null
          job_posting_date?: string | null
          job_title?: string | null
          keywords?: string[] | null
          location?: string | null
          max_experience?: number | null
          max_salary?: string | null
          min_experience?: number | null
          min_salary?: string | null
          scraped_at?: string | null
          source?: string | null
          sponsor_type?: string | null
          startup_job?: string | null
          visa_sponsoring?: string | null
          work_setting?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      candidate_profiles: {
        Row: {
          availability: string | null
          certifications_count: number | null
          created_at: string | null
          current_company: string | null
          current_position: string | null
          education_count: number | null
          email: string | null
          id: string | null
          latest_experience: Json | null
          linkedin: string | null
          location: string | null
          name: string | null
          phone: string | null
          portfolio: string | null
          preferred_location: string | null
          projects_count: number | null
          resume_embedding: string | null
          resume_embedding_h: unknown | null
          resume_text: string | null
          salary_expectation: string | null
          skills: string[] | null
          summary: string | null
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          availability?: string | null
          certifications_count?: never
          created_at?: string | null
          current_company?: string | null
          current_position?: string | null
          education_count?: never
          email?: string | null
          id?: string | null
          latest_experience?: never
          linkedin?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          portfolio?: string | null
          preferred_location?: string | null
          projects_count?: never
          resume_embedding?: string | null
          resume_embedding_h?: unknown | null
          resume_text?: string | null
          salary_expectation?: string | null
          skills?: never
          summary?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          availability?: string | null
          certifications_count?: never
          created_at?: string | null
          current_company?: string | null
          current_position?: string | null
          education_count?: never
          email?: string | null
          id?: string | null
          latest_experience?: never
          linkedin?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          portfolio?: string | null
          preferred_location?: string | null
          projects_count?: never
          resume_embedding?: string | null
          resume_embedding_h?: unknown | null
          resume_text?: string | null
          salary_expectation?: string | null
          skills?: never
          summary?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      candidate_search: {
        Row: {
          companies_text: string | null
          created_at: string | null
          current_company: string | null
          current_position: string | null
          education_text: string | null
          email: string | null
          id: string | null
          location: string | null
          name: string | null
          phone: string | null
          skills_text: string | null
          summary: string | null
          years_of_experience: number | null
        }
        Relationships: []
      }
      candidate_stats: {
        Row: {
          avg_years_experience: number | null
          candidates_last_30_days: number | null
          candidates_with_embeddings: number | null
          total_candidates: number | null
          unique_companies: number | null
          unique_locations: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      find_matching_profiles: {
        Args: {
          match_count?: number
          match_threshold?: number
          scholarship_id: number
        }
        Returns: {
          academic_level: string
          email: string
          field_of_study: string
          full_name: string
          nationality: string
          profile_id: string
          similarity_score: number
        }[]
      }
      find_matching_scholarships: {
        Args: {
          match_count?: number
          match_threshold?: number
          profile_id: string
        }
        Returns: {
          deadline: string
          max_scholarship_usd: string
          scholarship_id: number
          scholarship_name: string
          scholarship_type: string
          scholarship_url: string
          similarity_score: number
        }[]
      }
      get_candidate_summary: {
        Args: { candidate_uuid: string }
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_scholarships: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          applicable_for_summary: string
          course_stream_summary: string
          deadline: string
          id: number
          max_scholarship_per_student: string
          name: string
          offered_by_university: string
          scholarship_overview: string
          scholarship_type: string
          similarity: number
          url: string
        }[]
      }
      normalize_skill_name: {
        Args: { skill_text: string }
        Returns: string
      }
      profile_text_changed: {
        Args: {
          new_rec: Database["public"]["Tables"]["profiles"]["Row"]
          old_rec: Database["public"]["Tables"]["profiles"]["Row"]
        }
        Returns: boolean
      }
      refresh_candidate_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      regenerate_all_embeddings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scholarship_text_changed: {
        Args: {
          new_rec: Database["public"]["Tables"]["scholarships"]["Row"]
          old_rec: Database["public"]["Tables"]["scholarships"]["Row"]
        }
        Returns: boolean
      }
      search_candidates: {
        Args:
          | { job: string; k?: number }
          | {
              match_limit?: number
              query_embedding: string
              similarity_threshold?: number
            }
        Returns: {
          current_company: string
          current_position: string
          email: string
          id: string
          location: string
          name: string
          resume_text: string
          similarity: number
          years_of_experience: number
        }[]
      }
      search_candidates_advanced: {
        Args: {
          job_uuid: string
          k?: number
          location_filter?: string
          min_experience?: number
          min_score?: number
        }
        Returns: {
          candidate_id: string
          current_company: string
          email: string
          location: string
          name: string
          score: number
          years_experience: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
