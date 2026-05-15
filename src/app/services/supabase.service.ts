import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  login(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  register(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password
    });
  }

  logout() {
    return this.supabase.auth.signOut();
  }

  // Obtener el usuario actual
  getCurrentUser() {
    return this.supabase.auth.getUser();
  }

  // Guardar ubicación en Supabase
  async guardarUbicacion(latitud: number, longitud: number, userId: string) {
    const { data, error } = await this.supabase
      .from('ubicaciones')
      .insert([
        {
          user_id: userId,
          latitud: latitud,
          longitud: longitud,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error al guardar ubicación:', error);
      throw error;
    }
    
    return data;
  }

  // Obtener historial de ubicaciones del usuario
  async obtenerUbicaciones(userId: string) {
    const { data, error } = await this.supabase
      .from('ubicaciones')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener ubicaciones:', error);
      throw error;
    }
    
    return data;
  }
  
}
