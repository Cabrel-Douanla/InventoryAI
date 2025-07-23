// Fichier: src/types/index.ts

export interface UserCompany {
  id: number;
  name: string;
  role: 'admin' | 'member';
}

export interface UserProfile {
  id: number;
  email: string;
  is_active: boolean;
  companies: UserCompany[];
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  activeCompanyId: number | null;
  isAuthenticated: boolean;
  
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  setActiveCompany: (companyId: number) => void;
  initializeAuth: () => void;
}

// Ce type est retourné par l'API de login
export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: UserProfile;
}

export interface JobSubmission {
    job_id: number;
    status: string;
    message: string;
}

export interface JobStatusResponse {
    job_id: number;
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
    created_at: string;
    started_at?: string;
    completed_at?: string;
    result: any; // Peut être une string (message) ou un objet (résultats de prédiction)
}

export interface PredictionResult {
    forecast_90_days: {
        dates: string[];
        predicted_demand: number[];
    };
    stock_optimization: {
        service_level_percent: number;
        recommended_safety_stock: number;
        reorder_point: number;
        inputs_summary: {
            avg_daily_demand_forecast: number;
            model_error_std_dev: number;
            lead_time_days: number;
        };
    };
}