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
const datas = [
    {
        name: "Home",
        route: "MenuAluno",
        icon: "home",
        bg: "#477EEA"
    },
    {
        name: "Notas",
        route: "NotasModuloAluno",
        icon: "albums",
        bg: "#477EEA"
    },
    {
        name: "Vida Acadêmica",
        route: "VidaAcademica",
        icon: "md-filing",
        bg: "#477EEA"
    },
    {
        name: "Situação Financeira",
        route: "Financeiro",
        icon: "md-cash",
        bg: "#477EEA"
    },
    {
        name: "Informativos Escolar",
        route: "Informativos",
        icon: "md-clipboard",
        bg: "#477EEA"
    }
];

class SideBarAluno extends Component{
  constructor(props){
      super(props);
      this.state = {
          shadowOffsetWidth: 1,
          shadowRadius: 4,
          idAnoLetivo : 0,
          acesso : []
      };
  }

  acaoBotaoMenu = (data) => {

    if (data === 'MenuAluno') {
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

export default SideBarAluno;