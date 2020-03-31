import  React, { Component } from 'react';

import { Text, Toast } from 'native-base';

import { Root, Popup } from 'popup-ui';

function exibirMensagem(texto, tipo){
  return  Toast.show({
      text: texto,
      buttonText: "Ok",
      position: "bottom",
      type: tipo,
      duration: 5000
    });
  };

  function mensagemPopup(titulo, texto, tipo){
    Popup.show({
      type: tipo,
      title: titulo,
      button: false,
      textBody: texto,
      buttontext: 'Ok',
      callback: () => Popup.hide()
    });
  };

