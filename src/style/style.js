import  React, { Component } from 'react';

import { StyleSheet, Dimensions } from 'react-native';

const { width: WIDTH } = Dimensions.get('window');

export const stylesPadrao = StyleSheet.create({
    styleModalFiltro: { 
        marginTop: 10,
        marginLeft: 10, 
        marginRight: 10,
        flex: 1, 
     },
     styleCampoFiltro: {
      width: WIDTH - 55, height: 30 
     },
     styleViewFiltro: {
        height: 50,
        marginBottom: 10,
        marginLeft: 5, 
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
     styleButtonBuscar: { 
        marginLeft: 10, 
        marginRight: 10,
        marginBottom: 30
     },
     styleTexto: {
        fontSize: 12,
        fontWeight: '500'
    },
    styleTextoBranco: {
        color: '#f0f0f0',
        fontSize: 12,
        fontWeight: '500'
    },
    styleTextoTamanho14 : {
        fontSize: 14,
        fontWeight: '500'  
    }
  });