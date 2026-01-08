import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { SortData } from "../../../core/models/code-block.model";
import { messages } from "../../../core/constants/messages.constants";
import { Dialog } from 'primeng/dialog';

@Component({
  selector: "app-code-output",
  standalone: true,
  imports: [CommonModule, ButtonModule,Dialog],
  templateUrl: "./code-output.component.html",
  styleUrls: ["./code-output.component.scss"],
})
export class CodeOutputComponent implements AfterViewInit, OnChanges {
  @Input() listaUsuarios: SortData[] = [];
  @ViewChild('wheelCanvas') wheelCanvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  public spinning = false;
  private currentRotation = 0;
  private animationId: number = 0;
  private winnerIndex = -1;
  
  message = messages;
  winner: SortData | null = null;
  showWinner = false;
  totalProbability = 0;

  // Audio
  private isSoundEnabled = true;
  private lastSegmentCrossed = -1;
  private soundCooldown = false;
  private audioContext: any;

    showDialog() {
        this.showWinner = true;
    }

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.initializeAudio();
    if (this.listaUsuarios?.length > 0) {
      this.calculateProbability();
      this.drawWheel();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["listaUsuarios"] && this.listaUsuarios?.length > 0) {
      this.calculateProbability();
      this.winner = null;
      this.showWinner = false;
      this.currentRotation = 0;
      this.drawWheel();
    }
  }

  private initializeAudio(): void {
    try {
      // Inicializar Web Audio API (siempre disponible como fallback)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext);
    } catch (e) {
      console.log('Web Audio API no disponible');
      this.isSoundEnabled = false;
    }
  }

  private playWheelTick(speed: number): void {
    if (!this.isSoundEnabled || this.soundCooldown) return;
    
    // Usar Web Audio API (siempre funciona, no necesita archivos)
    this.playWebAudioSound(speed);
    
    this.soundCooldown = true;
    setTimeout(() => this.soundCooldown = false, 30);
  }

  private playWebAudioSound(speed: number): void {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Ajustar según velocidad
      const baseFreq = 700;
      const freqVariation = speed * 100;
      const frequency = Math.min(1200, baseFreq + freqVariation);
      
      const duration = 0.04 + (speed * 0.02); // 0.04 a 0.06 segundos
      const baseVolume = 0.15;
      const volume = Math.min(0.25, baseVolume + (speed * 0.02));
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      // Envolvente ADSR rápida
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
      
    } catch (e) {
      console.log('Error en Web Audio:', e);
    }
  }

  toggleSound(): void {
    this.isSoundEnabled = !this.isSoundEnabled;
    console.log('Sonido', this.isSoundEnabled ? 'activado' : 'desactivado');
  }

  private calculateProbability(): void {
    if (this.listaUsuarios?.length > 0) {
      this.totalProbability = this.listaUsuarios.length;
    }
  }

  private initializeCanvas(): void {
    const canvas = this.wheelCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (context) this.ctx = context;
  }

  private drawWheel(): void {
    if (!this.ctx || !this.listaUsuarios?.length) return;
    
    const canvas = this.wheelCanvas.nativeElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.currentRotation);
    
    let currentAngle = 0;
    const segmentAngle = (2 * Math.PI) / this.listaUsuarios.length;
    
    this.listaUsuarios.forEach((item, index) => {
      const endAngle = currentAngle + segmentAngle;
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, currentAngle, endAngle);
      this.ctx.closePath();
      
      this.ctx.fillStyle = item.color || this.getColor(index);
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      this.ctx.save();
      this.ctx.rotate(currentAngle + segmentAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 40px Arial';
      
      const name = item.nombre.length > 10 ? item.nombre.substring(0, 10) + '...' : item.nombre;
      this.ctx.fillText(name, radius - 10, 5);
      
      this.ctx.restore();
      currentAngle = endAngle;
    });
    
    this.ctx.restore();
    this.drawPointer(centerX, centerY, radius);
    
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#000';
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  private drawPointer(centerX: number, centerY: number, radius: number): void {
    this.ctx.save();
    
    this.ctx.beginPath();
    this.ctx.moveTo(centerX + radius + 5, centerY);
    this.ctx.lineTo(centerX + radius - 15, centerY - 10);
    this.ctx.lineTo(centerX + radius - 15, centerY + 10);
    this.ctx.closePath();
    
    this.ctx.fillStyle = '#f00';
    this.ctx.fill();
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  private getColor(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return colors[index % colors.length];
  }

  spinWheelReal(): void {
    if (!this.listaUsuarios?.length || this.spinning) return;
    
    this.spinning = true;
    this.showWinner = false;
    this.winner = null;
    this.winnerIndex = -1;
    this.lastSegmentCrossed = -1;
    
    const totalTurns = this.getRandomInt(50, 20);
    const finalAngleDegrees = this.getRandomInt(359, 0);
    const totalRotationRadians = -(totalTurns * 2 * Math.PI + (finalAngleDegrees * Math.PI / 180));
    
    const velocityProfile = [
      8, 7, 6, 5, 4.5, 4, 3.8, 3.6, 3.4, 3.2,
      3.0, 3.0, 2.9, 2.9, 2.8, 2.8, 2.7, 2.7, 2.6, 2.6,
      2.5, 2.5, 2.4, 2.4, 2.3, 2.3, 2.2, 2.2, 2.1, 2.1,
      2.0, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1,
      1.0, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5,
      0.45, 0.4, 0.38, 0.36, 0.34, 0.32, 0.30, 0.28, 0.26, 0.24,
      0.22, 0.20, 0.18, 0.16, 0.14, 0.13, 0.12, 0.11, 0.10, 0.09,
      0.08, 0.07, 0.065, 0.06, 0.055, 0.05, 0.045, 0.04, 0.035, 0.03,
      0.028, 0.026, 0.024, 0.022, 0.020, 0.018, 0.016, 0.014, 0.012, 0.010,
      0.009, 0.008, 0.007, 0.006, 0.005, 0.004, 0.003, 0.002, 0.001, 0.0005,
      0.0003, 0.0002, 0.0001, 0.00005, 0.00003, 0.00002, 0.00001, 0.000005, 0.000002, 0.000001
    ];
    
    const startTime = Date.now();
    const duration = 9000;
    const startRotation = this.currentRotation;
    
    const totalSteps = velocityProfile.length;
    let cumulativePosition = 0;
    const positions: number[] = [0];
    
    for (let i = 0; i < totalSteps; i++) {
      cumulativePosition += velocityProfile[i];
      positions.push(cumulativePosition);
    }
    
    const finalPosition = positions[totalSteps];
    for (let i = 0; i <= totalSteps; i++) {
      positions[i] /= finalPosition;
    }
    
    let lastDisplayedDegree = -1;
    let animationComplete = false;
    
    const animate = () => {
      if (animationComplete) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const step = Math.floor(progress * totalSteps);
      const stepProgress = (progress * totalSteps) - step;
      
      let easeProgress;
      if (step >= totalSteps - 1) {
        easeProgress = 1;
      } else {
        easeProgress = positions[step] + (positions[step + 1] - positions[step]) * stepProgress;
      }
      
      this.currentRotation = startRotation + (totalRotationRadians * easeProgress);
      this.drawWheel();
      
      // DETECTAR CUÁNDO CRUZA UN SEGMENTO
      const currentSegment = this.getCurrentSegment();
      if (currentSegment !== this.lastSegmentCrossed && currentSegment >= 0) {
        const currentSpeed = velocityProfile[Math.min(step, totalSteps - 1)];
        this.playWheelTick(currentSpeed);
        this.lastSegmentCrossed = currentSegment;
      }
      
      const currentAngleDegrees = easeProgress * finalAngleDegrees;
      const currentDegree = Math.floor(currentAngleDegrees);
      
      if (currentDegree !== lastDisplayedDegree) {
        console.log(currentDegree + '°');
        lastDisplayedDegree = currentDegree;
      }
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        animationComplete = true;
        
        this.currentRotation = startRotation + totalRotationRadians;
        this.drawWheel();
        
        this.detectWinnerFromAngle(finalAngleDegrees);
        this.spinning = false;
        this.showWinner = true;
        
        // Sonido final cuando se detiene
        if (this.isSoundEnabled) {
          setTimeout(() => {
            this.playFinalSound();
          }, 200);
        }
      }
    };
    
    this.animationId = requestAnimationFrame(animate);
  }

  private playFinalSound(): void {
    if (!this.audioContext) return;
    
    try {
      // Sonido final más grave y largo
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = 400; // Más grave
      oscillator.type = 'sine';
      
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      oscillator.start(now);
      oscillator.stop(now + 0.8);
      
    } catch (e) {
      console.log('Error sonido final:', e);
    }
  }

  // Método para detectar en qué segmento está el puntero
  private getCurrentSegment(): number {
    if (!this.listaUsuarios?.length) return -1;
    
    // Calcular ángulo bajo el puntero (0 a 2π)
    let angleUnderPointer = -this.currentRotation;
    while (angleUnderPointer < 0) angleUnderPointer += 2 * Math.PI;
    while (angleUnderPointer >= 2 * Math.PI) angleUnderPointer -= 2 * Math.PI;
    
    const segmentAngle = (2 * Math.PI) / this.listaUsuarios.length;
    return Math.floor(angleUnderPointer / segmentAngle);
  }

  private detectWinnerFromAngle(angleDegrees: number): void {
    if (!this.listaUsuarios?.length) return;
    
    let normalizedAngle = angleDegrees % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;
    
    const segmentDegrees = 360 / this.listaUsuarios.length;
    let accumulatedDegrees = 0;
    
    for (let i = 0; i < this.listaUsuarios.length; i++) {
      const segmentEnd = accumulatedDegrees + segmentDegrees;
      
      if (normalizedAngle >= accumulatedDegrees && normalizedAngle < segmentEnd) {
        this.winnerIndex = i;
        this.winner = this.listaUsuarios[i];
        return;
      }
      
      accumulatedDegrees = segmentEnd;
    }
    
    if (normalizedAngle >= 359.9) {
      this.winnerIndex = 0;
      this.winner = this.listaUsuarios[0];
    }
  }

  private getRandomInt(max: number, min: number = 1): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  resetWheel(): void {
    this.currentRotation = 0;
    this.winner = null;
    this.showWinner = false;
    this.spinning = false;
    this.winnerIndex = -1;
    this.lastSegmentCrossed = -1;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.drawWheel();
  }
}