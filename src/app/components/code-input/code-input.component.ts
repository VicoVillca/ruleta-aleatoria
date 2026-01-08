import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { labels } from "../../../core/constants/labels.constants";
import { messages } from "../../../core/constants/messages.constants";
import { colores, LISTA_EXAMPLE } from "../../../core/constants/lista-examples.constant";
import { SortData } from "../../../core/models/code-block.model";

@Component({
  selector: "app-code-input",
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: "./code-input.component.html",
  styleUrls: ["./code-input.component.scss"],
})
export class CodeInputComponent implements OnInit {
  code: string = "";
  @Output() codeChange = new EventEmitter<SortData[]>();
  @Output() onGirarRuleta = new EventEmitter();
  @Output() limpiarPanel = new EventEmitter<string>();

  label = labels;
  message = messages;

  constructor() {}
  ngOnInit(): void {
    this.code = LISTA_EXAMPLE;
    this.onCodeChange(null);
  }


  onCodeChange($event: any) {
    console.log("onCodeChange");
    let listaUsuarios: SortData[] = [];
    let lista: string[] = this.code.split("\n");
    let i = 0;
    for (let usuario of lista) {
      let user: SortData = {
        id:i,
        nombre: usuario,
        color: colores[i]
      };
      i++;
      listaUsuarios.push(user);
    }
    this.codeChange.emit(listaUsuarios);
  }
  girarRuleta(){
    this.onGirarRuleta.emit();
  }
}
