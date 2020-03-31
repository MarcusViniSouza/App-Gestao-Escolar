export class Constantes {

    constructor(){}

    periodos(qtde){
       if (qtde === 5){
         var periodos = ["1º Trimestre", "2º Trimestre", "3º Trimestre", "4º Trimestre", "Recuperação"];  
         return periodos;
       } else {
         var periodos = ["1º Trimestre", "2º Trimestre", "3º Trimestre", "Recuperação"];  
         return periodos;
       }
    }

    tipoAvaliacao(){
        return ["Avaliação","Recuperação","Ponto Extra","Atividade","Recuperação de Item","Recuperação Parcial"];
    }
}
