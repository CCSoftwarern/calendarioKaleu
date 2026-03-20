import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Scheduler } from './views/scheduler/scheduler';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Scheduler],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('kaleu-system');
}
