// src/app/components/theme-toggle/theme-toggle.component.ts
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button 
      [icon]="themeService.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
      [text]="true" 
      [rounded]="true" 
      severity="secondary"
      (onClick)="toggleTheme()"
      [title]="themeService.isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'">
    </p-button>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}