import React from "react";
import { SafeAreaView, View } from 'react-native';
import { Root as RootBase } from "native-base";
import { Root as RootPopup, Popup } from "popup-ui";
import { createAppContainer, createStackNavigator, createDrawerNavigator } from 'react-navigation';

// Professor
import Main from './pages/professor/main';
import Home from './pages/professor/home';
import Notas from './pages/professor/notas';
import Escola from './pages/professor/escola';
import NotasAluno from './pages/professor/notasaluno';
import AvaliacaoTurma from './pages/professor/avaliacoesTurma';
import Aulas from './pages/professor/aulas';
import Frequencias from './pages/professor/frequencias';
import SideBar from "./pages/professor/sideBar";
import Notificacao from './pages/professor/notificacao';
import Usuario from './pages/usuarios';
import Contatos from './pages/professor/telefones';
import FormaAvaliacao from './pages/professor/formaavaliacao';
import CadastrarFormaAvaliacao from './pages/professor/cadastro/cadastrarFormaAvaliacao';
import RegistroConteudo from './pages/professor/registroConteudo';
import CadastrarRegistroConteudo from './pages/professor/cadastro/cadastroRegistroConteudo';

//Alunos
import MainAluno from './pages/alunos/main';
import EscolaAluno from './pages/alunos/escolaAluno';
import HomeAluno from './pages/alunos/home';
import NotasModuloAluno from './pages/alunos/notas';
import VidaAcademica from './pages/alunos/vidaAcademica';
import Financeiro from './pages/alunos/financeiro';
import Informativos from './pages/alunos/informativos';
import NotificacaoAluno from './pages/alunos/notificacaoAluno';
import SideBarAluno from "./pages/alunos/sideBar";

import AsyncStorage from '@react-native-community/async-storage';

// if (tipoUsuario === 'A') {
const AppNavigatorMenuAluno = createDrawerNavigator({
  MenuAluno: { screen: HomeAluno },
  NotasModuloAluno: { screen: NotasModuloAluno },
  VidaAcademica: { screen: VidaAcademica },
  Financeiro: { screen: Financeiro },
  Informativos: { screen: Informativos }
},
  {
    initialRouteName: "MenuAluno",
    contentOptions: {
      activeTintColor: "#123751",
      Icon: "home"
    },
    contentComponent: props => <SideBarAluno {...props} />
  });
// } else if (tipoUsuario === 'P' || this.tipoUsuario === ''){
const AppNavigatorMenuProfessor = createDrawerNavigator({
  Menu: { screen: Home },
  RegistroConteudo: { screen: RegistroConteudo },
  FormaAvaliacao: { screen: FormaAvaliacao },
  Notas: { screen: Notas },
  Frequencias: { screen: Frequencias },
  Aulas: { screen: Aulas },
  Escola: { screen: Escola },
  Notificacao: { screen: Notificacao }
},
  {
    initialRouteName: "Menu",
    contentOptions: {
      activeTintColor: "#123751",
      Icon: "home"
    },
    contentComponent: props => <SideBar {...props} />
  });
// }

const AppNavigatorLogin = createStackNavigator({
  Usuario: { screen: Usuario },
  Main: { screen: Main },
  MainAluno: { screen: MainAluno },
  NotasModuloAluno: { screen: NotasModuloAluno },
  VidaAcademica: { screen: VidaAcademica },
  Financeiro: { screen: Financeiro },
  Informativos: { screen: Informativos },
  NotasAluno: { screen: NotasAluno },
  NotificacaoAluno: { screen: NotificacaoAluno },
  AvaliacaoTurma: { screen: AvaliacaoTurma },
  Aulas: { screen: Aulas },
  Notificacao: { screen: Notificacao },
  Notas: { screen: Notas },
  Frequencias: { screen: Frequencias },
  RegistroConteudo: { screen: RegistroConteudo },
  FormaAvaliacao: { screen: FormaAvaliacao },
  CadastrarFormaAvaliacao: { screen: CadastrarFormaAvaliacao },
  CadastrarRegistroConteudo: { screen: CadastrarRegistroConteudo },
  EscolaAluno: { screen: EscolaAluno },
  AppNavigatorMenuAluno: { screen: AppNavigatorMenuAluno },
  AppNavigatorMenuProfessor: { screen: AppNavigatorMenuProfessor }
}, {
  defaultNavigationOptions: {
    header: null,
    headerStyle: { backgroundColor: "#123751" },
    activeTintColor: "#123751",
  }
},
  {
    initialRouteName: "AppNavigatorMenu",
    headerMode: "none"
  });

const AppContainer = createAppContainer(AppNavigatorLogin);

export default () =>
  <RootBase>
    <AppContainer />

    <View style={{ position: 'absolute' }}>
      <RootPopup>
        <Popup />
      </RootPopup>
    </View>

  </RootBase>;



