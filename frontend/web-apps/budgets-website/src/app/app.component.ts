import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ZardToastComponent } from '@/shared/components/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ZardToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
