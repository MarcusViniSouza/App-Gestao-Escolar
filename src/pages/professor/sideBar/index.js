import React, { Component } from "react";
import { Image } from "react-native";
import {
  Content,
  Text,
  List,
  ListItem,
  Icon,
  Container,
  Left,
  Right,
  Badge
} from "native-base";

import styles from "./style";

import { getApi }  from '../../../services/api';

import AsyncStorage from '@react-native-community/async-storage';

const drawerCover = require("../../../imagens/Fundo.png");
const drawerImage = require("../../../imagens/logo.png");
const conteudo = require("../img/conteudo.png");
const datas = [
    {
        name: "Home",
        route: "Menu",
        icon: "home",
        bg: "#477EEA"
    },
    {
      name: "Registro de Conteúdo",
      route: "RegistroConteudo",
      icon: "md-clipboard",
      bg: "#477EEA"
    },
    {
      name: "Forma de Avaliação",
      route: "FormaAvaliacao",
      icon: "md-book",
      bg: "#477EEA"
    },
    {
        name: "Registro de Notas",
        route: "Notas",
        icon: "albums",
        bg: "#477EEA"
    },
    {
        name: "Registro de Frequência",
        route: "Frequencias",
        icon: "md-checkmark",
        bg: "#477EEA"
    },
    {
        name: "Horários",
        route: "Aulas",
        icon: "calendar",
        bg: "#477EEA"
    },
    // {
    //     name: "Notificação",
    //     route: "Notificacao",
    //     icon: "notifications",
    //     bg: "#477EEA"
    // },
    // {
    //     name: "Contatos",
    //     route: "Contatos",
    //     icon: "md-call",
    //     bg: "#477EEA"
    // }
];

class SiderBar extends Component{
  constructor(props){
      super(props);
      this.state = {
          shadowOffsetWidth: 1,
          shadowRadius: 4,
          idAnoLetivo : 0,
          acesso : []
      };

    // this.getParametrosAcesso();
  }

  setIdAnoLetivo = (value) => {
    this.setState({ idAnoLetivo : value });
  }

  getDadosAnoLetivo = async () => {
    let res = await AsyncStorage.getItem('dadosanoletivo');
    let infoAnoLetivo = JSON.parse(res);

    if (infoAnoLetivo.ID !== null) {
       this.setIdAnoLetivo(infoAnoLetivo.ID);
        return infoAnoLetivo.ID;
      }
  }

  getParametrosAcesso = async () => {
      try {
        let anoLetivo = await this.getDadosAnoLetivo();
        
        if (anoLetivo !== null){
            var parametros = { ano : anoLetivo };
            
            const response = await getApi(`parametrosAcesso/${JSON.stringify(parametros)}`);
            
            this.setState({ acesso : response.result[0] });
        }

      } catch (e){
          console.log(e);
      }
  }

  TemAcessoMenu = (tela) => {
    let resultado = true;
    if (this.state.acesso.length > 0){

        var telas = new array();
        if (tela === 'Notas'){
           resultado = this.state.acesso.PROFESSOR_NOTAS === true ? true : false;     
        } else if (tela === 'Frequências') {
            resultado = this.state.acesso.PROFESSOR_FALTAS === true ? true : false; 
        } else {
            resultado = true;  
        }
    }
 }

  acaoBotaoMenu = (data) => {

    if (data === 'Menu') {
      this.props.navigation.navigate(data);
      this.props.navigation.closeDrawer();
    } else {
      this.props.navigation.navigate(data);
    }
  }

  render(){
      return(
          <Container>
            <Content
             bounces={false}
             style={{ flex: 1, baackgroundColor: "#fff", top: -1 }}
            >
            
            <Image source={drawerCover} style={styles.drawerCover} />
            <Image square style={styles.drawerImage} source={drawerImage} />

            <List
             dataArray={datas}
             renderRow={data => (
                  <ListItem 
                        button
                        noBorder
                        onPress={() => this.acaoBotaoMenu(data.route)}  
                        >
                        <Left> 
                        <Icon
                        active
                        name={data.icon}
                        style={{ color: "#7777", fontSize: 26, width:30 }}
                        />

                        <Text style={styles.text}>
                        {data.name}
                        </Text>
                        </Left>

                        {data.types && 
                        <Right style={{ flex: 1 }}>
                        <Badge
                        style={{
                            borderRadius: 3,
                            height: 25,
                            width: 72,
                            backgroundColor: data.bg
                        }}     
                        >
                            <Text style={styles.badgeText}>
                            {`${data.types} Types`}
                            </Text>
                        </Badge>
                        </Right>}
                  </ListItem> 
            )
           }
          />
         </Content>
        </Container>
      );
  }
}

export default SiderBar;