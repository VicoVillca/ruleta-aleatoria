import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { OrganizerPageComponent } from './pages/organizer-page/organizer-page.component';
import { ThemeService } from '../core/services/theme.service';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { Toolbar } from 'primeng/toolbar';
import { labels } from '../core/constants/labels.constants';
import { messages } from '../core/constants/messages.constants';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, 
    RouterOutlet, 
    InputTextModule, 
    ButtonModule, 
    MessageModule, 
    FormsModule, 
    ThemeToggleComponent,
    Toolbar,
    OrganizerPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  label = labels;
  message = messages;
  
  constructor(public themeService: ThemeService){
  }

}
