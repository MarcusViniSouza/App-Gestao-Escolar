import  React, { Component } from 'react';

import { Thumbnail, Card, CardItem, Body  } from 'native-base';

import {
    StyleSheet,
    ImageBackground,
    Image,
    Button,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Alert
  } from 'react-native';

import logo from './../imagens/icon.png';  
import bgImagem from './../imagens/Fundo.png';

import aluno from './../imagens/aluno.png';
import professor from './../imagens/professor.png';

import Icon from "react-native-vector-icons/Ionicons";

import AsyncStorage from '@react-native-community/async-storage';

import { getRegistroStorage, setRegistroStorage } from '../services/storage';

const { width: WIDTH } = Dimensions.get('window');

export default class Usuario extends Component {

    constructor(props){
        super(props);

        this.state = {
           tipousuario: ''
        }
    }

    componentDidMount = async () => {
       const tipoUsuario = await getRegistroStorage('tipoUsuario');

       if (tipoUsuario === 'A') {
          this.logarAluno();
       } else if (tipoUsuario === 'P') {
         this.logarProfessor();
       }
    }

    setTipoUsuario = async (value) => {
      try {
            await setRegistroStorage('tipoUsuario', value);
          } catch (e) {
            console.error('erro ao salvar tipo de usuário. '+ e.message); 
          }
    }

    logarProfessor = () => {
        this.setTipoUsuario('P');
        const { navigate } = this.props.navigation;
        navigate('Main');
    }

    logarAluno = () => {
        this.setTipoUsuario('A');
        const { navigate } = this.props.navigation;
        navigate('MainAluno');
    }

    render(){
    console.disableYellowBox = true;
     return (
      <ImageBackground source={bgImagem} style={styles.container}>
  
          <View style={styles.logoContainer}>
           <Image source={logo} style={styles.logo}/>
           <Text style={styles.logoText}>Siscol Mobile</Text>
          </View>
  
          <Text style={styles.textStyle}>Olá, Seja Bem Vindo(a)!</Text>
          <Text style={styles.textStyle}>Selecione como deseja acessar.</Text>

          <View style={styles.containerBotoes}>

            {/* <View style={styles.buttonstyle}>
             <TouchableOpacity style={styles.containerBotao} onPress={() => this.logarAluno()}>
               <Thumbnail square source={aluno} /> 
               <Text style={{ color: '#E0FFFF' }}>Aluno</Text>
             </TouchableOpacity> 
            </View> */}
    
            <View style={styles.buttonstyle}>
             <TouchableOpacity style={styles.containerBotao} onPress={() => this.logarProfessor()}>
               <Thumbnail square source={professor} /> 
               <Text style={{ color: '#E0FFFF' }}>Professor</Text>
             </TouchableOpacity> 
            </View>

          </View>
  
     
          {/* <Text style={{ fontSize: 10, color: 'white', marginTop: 70 }}>
              Siscol Mobile - Desenvolvido por RG System
          </Text> */}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
 containerBotoes : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch' },
 container: { flex: 1, width: null, height: null, justifyContent: 'center', alignItems: 'center', backgroundColor: '#123751'},
 buttonstyle: { flex: 1, width: 30, height: 78, borderRadius: 4, borderWidth: 0.5, 
                borderColor: '#E0FFFF',  marginLeft: 10, marginRight: 10, marginBottom: 5, marginTop: 15},
 containerBotao:{  alignItems: 'center', borderRadius: 4, borderWidth: 0.5 },
 textStyle: { color: 'white', fontSize: 15, fontWeight: '500', marginTop: 5, opacity: 0.5 },
 logo: { width: 150, height: 150 },
 logoContainer: { alignItems: 'center', marginBottom: 30 },
 logoText: { color: 'white', fontSize: 20, fontWeight: '500', marginTop: 10, opacity: 0.5 }
});
