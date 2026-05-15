import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { 
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle, 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonLabel,
  IonChip,
  IonAvatar,
  IonToast
} from '@ionic/angular/standalone';
import { NgIf, DatePipe, SlicePipe } from '@angular/common';
import { LocationService } from '../services/location';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent,
    IonButton, 
    NgIf,
    IonButtons,
    IonLabel,
    IonChip,
    IonAvatar,
    IonToast,
    DatePipe,
    SlicePipe
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  watchId: string | null = null;
  errorMsg = signal<string | null>(null);
  userEmail = signal<string | null>(null);
  userName = signal<string | null>(null);
  userId = signal<string | null>(null);
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastColor = signal<string>('success');
  fechaActual = signal<Date>(new Date());

  constructor(
    private loc: LocationService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarUsuario();
    await this.loc.ensurePermissions();
    await this.obtenerUbicacionActual();
    await this.iniciarSeguimiento();
    
    // Actualizar la fecha cada segundo
    setInterval(() => {
      this.fechaActual.set(new Date());
    }, 1000);
  }

  async cargarUsuario() {
    try {
      const { data: { user } } = await this.supabaseService.getCurrentUser();
      if (user && user.email) {
        this.userEmail.set(user.email);
        this.userId.set(user.id);
        const nombre = user.email.split('@')[0] || 'Usuario';
        this.userName.set(nombre);
      } else {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.email) {
            this.userEmail.set(user.email);
            this.userId.set(user.id);
            const nombre = user.email.split('@')[0] || 'Usuario';
            this.userName.set(nombre);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

  async obtenerUbicacionActual() {
    try {
      const pos = await this.loc.getCurrentPosition();
      this.latitude.set(pos.coords.latitude);
      this.longitude.set(pos.coords.longitude);
      this.errorMsg.set(null);
      this.fechaActual.set(new Date());
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'Error al obtener la ubicación actual');
    }
  }

  async iniciarSeguimiento() {
    try {
      this.watchId = await this.loc.watchPosition((pos) => {
        this.latitude.set(pos.coords.latitude);
        this.longitude.set(pos.coords.longitude);
        this.fechaActual.set(new Date());
      }, (err) => {
        this.errorMsg.set(err?.message ?? 'Error en seguimiento de ubicación');
      });
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'No se pudo iniciar el seguimiento');
    }
  }

  async detenerSeguimiento() {
    if (this.watchId) {
      await this.loc.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  async guardarUbicacion() {
    if (this.latitude() === null || this.longitude() === null) {
      this.mostrarMensaje('No hay ubicación disponible para guardar', 'warning');
      return;
    }

    if (!this.userId()) {
      this.mostrarMensaje('Usuario no identificado', 'danger');
      return;
    }

    try {
      this.mostrarMensaje('Guardando ubicación...', 'medium');
      
      await this.supabaseService.guardarUbicacion(
        this.latitude()!,
        this.longitude()!,
        this.userId()!
      );

      this.mostrarMensaje('✅ Ubicación guardada exitosamente', 'success');
      
      console.log('Ubicación guardada:', {
        lat: this.latitude(),
        lng: this.longitude(),
        userId: this.userId(),
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error al guardar:', error);
      this.mostrarMensaje('❌ Error al guardar ubicación: ' + (error.message || 'Error desconocido'), 'danger');
    }
  }

  mostrarMensaje(mensaje: string, color: string = 'success') {
    this.toastMessage.set(mensaje);
    this.toastColor.set(color);
    this.showToast.set(true);
    
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  async logout() {
    try {
      if (this.watchId) {
        await this.detenerSeguimiento();
      }
      
      await this.supabaseService.logout();
      localStorage.removeItem('user');
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.errorMsg.set('Error al cerrar sesión');
    }
  }

  ngOnDestroy() {
    if (this.watchId) this.loc.clearWatch(this.watchId);
  }
}