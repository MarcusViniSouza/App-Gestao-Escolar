import  React, { Component } from 'react';

import { Text, Spinner} from 'native-base';

import { View, StyleSheet } from 'react-native';


const Load = ({texto}) => { 
    return(
        <View style={styles.container}>
            <Spinner color='#123751' />
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
      fontSize: 15,
      color: '#123751'
  }
});

export default Load;