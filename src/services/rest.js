import React, { Component } from 'react';
import { getApi } from './api';

export async function getValidaEtapaEncerrada(idAnoLetivo, idGrade, idTurma, etapa) {
    const retorno = await getApi(`EtapaEncerrada/${idAnoLetivo}/${idGrade}/${idTurma}/${etapa}`);

    return retorno.result;
}

export async function getAulasProfessor(parametros) {
    const retorno = await getApi(`AulasPeriodo/${JSON.stringify(parametros)}`);

    return retorno.result;
}

export async function getDisciplinasProfessor(parametros) {
   const retorno = await getApi(`getDisciplinasProfessor/${JSON.stringify(parametros)}`);

   return retorno.result;
}

export async function getTurmasProfessor(parametros){
  const retorno = await getApi(`TurmasProf/${JSON.stringify(parametros)}`);

  return retorno.result;
}

export async function getFrequenciaTurma(parametros){
    const retorno = await getApi(`FrequenciasTurma/${JSON.stringify(parametros)}`);

    return retorno.result;
}

export async function getHorarioProfessor(parametros){
    const retorno = await getApi(`HorarioProfessor/${JSON.stringify(parametros)}`);

    return retorno.result;
}

export async function SalvarFaltas(parametros){
    const retorno = await getApi(`SalvarFaltas/${JSON.stringify(parametros)}`);

    return retorno;
}

export async function getDiasLetivosProfessor(parametros){
    const retorno = await getApi(`DiasLetivos/${JSON.stringify(parametros)}`);

    return retorno.result;
}