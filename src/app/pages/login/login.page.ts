import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonCard,
    IonCardContent
  ]
})
export class LoginPage {
  email = '';
  password = '';
  mensaje = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async login() {
    const { data, error } = await this.supabaseService.login(
      this.email,
      this.password
    );

    if (error) {
      this.mensaje = error.message;
      return;
    }

    // Guardar datos del usuario en el estado o localStorage si es necesario
    if (data?.user) {
      // Puedes guardar el usuario en un servicio o localStorage
      localStorage.setItem('user', JSON.stringify({
        email: data.user.email,
        id: data.user.id,
        created_at: data.user.created_at
      }));
    }

    this.router.navigateByUrl('/home');
  }

  async register() {
    const { error } = await this.supabaseService.register(
      this.email,
      this.password
    );

    if (error) {
      this.mensaje = error.message;
      return;
    }

    this.mensaje = 'Usuario registrado, revisa tu correo para la confirmacion.';
  }
}
