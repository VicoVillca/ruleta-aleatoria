import { Component, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { CodeInputComponent } from "../../components/code-input/code-input.component";
import { CodeOutputComponent } from "../../components/code-output/code-output.component";
import { Toast } from "primeng/toast";
import { MessageService } from "primeng/api";
import { JavaValidatorService } from "../../../core/services/java-validator.service";
import { labels } from "../../../core/constants/labels.constants";
import { messages } from "../../../core/constants/messages.constants";
import { SortData } from "../../../core/models/code-block.model";

@Component({
  selector: "app-organizer-page",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    CodeInputComponent,
    CodeOutputComponent,
    Toast,
  ],
  templateUrl: "./organizer-page.component.html",
  styleUrls: ["./organizer-page.component.scss"],
})
export class OrganizerPageComponent {
  listaUsuarios:SortData[] = [];

  @ViewChild('miHijo') miHijo!: CodeOutputComponent;

  label = labels;
  message = messages;

  constructor(
    private messageService: MessageService
  ) {}

  onCodeChange(listaUsuarios:SortData[]) {
    console.log("onCodeChange");
    this.listaUsuarios = listaUsuarios;
  }
  
  onGirarRuleta(){
    console.log("Giramos Ruleta");
    this.miHijo.spinWheelReal();
  }

  viewMessage(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }
}
