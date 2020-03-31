import  React, { Component } from 'react';

import { DrawerActions } from 'react-navigation';

import { Container, 
        Header, Left, Body, 
        StyleProvider , Button, 
        Icon, Title, Text, Badge,
        Content, List, ListItem, 
        Right, Separator, SwipeRow,
        Thumbnail } from 'native-base';

import { View, Alert, StyleSheet, FlatList } from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';
import platform from '../../../native-base-theme/variables/platform';

import { getApi }  from '../../services/api';

import AsyncStorage from '@react-native-community/async-storage';

import Load from '../../componentes/load';

import Prova from './img/prova.png';

export default class AvaliacoesTurma extends Component {
    static navigationOptions = {
        title: 'Notas por Aluno',
        headerStyle: {backgroundColor: "#123751"},
        headerTintColor: "#FFF",
        header: null,
      }

      constructor(props){
        super(props);

        this.state = {
          imagem: this.props.navigation.getParam('icone'),
          ano : this.props.navigation.getParam('ano'),
          turma: this.props.navigation.getParam('turma'),
          etapa: this.props.navigation.getParam('etapa'),
          usuario: this.props.navigation.getParam('usuario'),
          avaliacoes: [],
          carregando: false
        }

        this.getAvaliacoes();
      }

      setAvaliacoes = (value) =>{
        this.setState({ avaliacoes: value });
      }

      getAvaliacoes = async () => {
        try {  
          if (this.state.ano !== null && this.state.turma !== null && this.state.etapa !== null){

            this.setState({ carregando: true });

            var parametros = { ano: this.state.ano, 
                               turma: this.state.turma, 
                               etapa: this.state.etapa,
                               usuario: this.state.usuario };

            const response = await getApi(`AvaliacoesTurma/${JSON.stringify(parametros)}`);

            this.setAvaliacoes(response.result);

            this.setState({ carregando: false });
          }
        } 
        catch (e){
          console.log(e);
        }
      }
    render(){
        return (
          <StyleProvider style={getTheme(material)}>  
            <Container>
              <Header>
                <Left>
                  <Button transparent  onPress={() => {this.props.navigation.navigate('Notas');} } >
                    <Icon name='arrow-back' />
                  </Button>
                </Left>

                <Body>
                  <Title>Avaliações da Turma</Title>
                </Body>
                
              </Header>

               <Content>
               { 
                 this.state.carregando &&
                 <Load texto={'Aguarde Carregando os registros..'} />
               }
               {
                 !this.state.carregando &&
                 <List>
                 <FlatList
                   data={this.state.avaliacoes}
                   renderItem={( { item } ) => (
                    <ListItem avatar>
                      <Left>
                        <Thumbnail square source={Prova} />
                      </Left>
                      <Body>
                        <Text>{item.CONTEUDO}</Text>
                        <Text note>Data: {item.DATA}</Text>
                        <Text note>Tipo: {item.TIPO_NOTA}</Text>
                        <Text note>Descrição: {item.DESCRICAO}</Text>
                      </Body>
                      <Right>
                        <Text note>Valor: {item.VALOR}</Text>
                      </Right>
                   </ListItem>
                   )}
                 />
                 </List>
               }
              </Content>

            </Container>
          </StyleProvider> 
        );
    }
}


