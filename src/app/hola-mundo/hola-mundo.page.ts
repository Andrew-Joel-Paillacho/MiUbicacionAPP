import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-hola-mundo',
  templateUrl: './hola-mundo.page.html',
  styleUrls: ['./hola-mundo.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HolaMundoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
