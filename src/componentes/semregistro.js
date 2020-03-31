import  React, { Component } from 'react';

import { Text } from 'native-base';

import { View, StyleSheet, Image, Dimensions } from 'react-native';

import buscar from '../imagens/buscar.png';

const { width: WIDTH } = Dimensions.get('window');

const SemRegistro = ({texto}) => { 
    return(
        <View style={styles.container}>
            <Image source={buscar} style={styles.logo}/>
            <Text style={styles.text}>{texto}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
  },
  text: {
      textAlign: 'center',
      fontSize: 15,
      color: '#000',
      fontWeight: '500', 
      opacity: 0.5
  },
  logo: { width: 100, height: 100, opacity: 0.5 }
});

export default SemRegistro;