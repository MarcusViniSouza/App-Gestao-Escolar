import React from 'react';
import axios from 'axios';
import { getRegistroStorage } from './storage';

export async function getApi(metodo) {
  const servidor = await getRegistroStorage('enderecoServer');
  let username = 'Siscol';
  let password = '#Siscol@';
  let basicAuth = `${username} : ${password}`;

  const { ip } = servidor;

  const api = axios.create({
    baseURL: `http://${ip}/datasnap/rest/TServerMethods1/`,
    headers: { auth: { Username: username, Password: password } }
  });

  const retorno = await api.get(metodo);

  return retorno.data;
}

export async function postApi(metodo, parametros) {
  let enderecoIp = await getRegistroStorage('enderecoServer');

  const retorno = await axios.post(`http://${enderecoIp}/datasnap/rest/TServerMethods1/${metodo}`,
    { parametros });

  return retorno.data;
}
