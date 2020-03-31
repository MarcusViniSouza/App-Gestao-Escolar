import  React, { Component } from 'react';

import { DrawerActions } from 'react-navigation';

import {  Accordion, Container, CheckBox, DatePicker, 
          Header, Left, Body, 
          StyleProvider , Button, 
          Icon, Title,
          Content, List, ListItem, 
          Text, Right, Thumbnail,
          Form, Item, Picker, Label, Input } from 'native-base';

import { Alert, Modal, StyleSheet, ScrollView, RefreshControl, View, TouchableOpacity } from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import Load from '../../componentes/load';
import SemRegistro  from '../../componentes/semregistro';
import { getApi }  from '../../services/api';
import { stylesPadrao } from '../../style/style';

import AsyncStorage from '@react-native-community/async-storage';


export default class NotificacaoAluno extends Component {
    static navigationOptions = {
        title: 'Notificações',
        headerStyle: {backgroundColor: "#123751"},
        headerTintColor: "#FFF"
      }

      constructor(props) {
        super(props);

        this.state = { 
            idUser: this.props.navigation.getParam('idUsuario'),
            notificacoes : this.props.navigation.getParam('notificacoes'),
            carregando: false,
            refreshing: false
        };
      }

      exibirMensagem = (texto, tipo) => {
        Toast.show({
          text: texto,
          buttonText: "Ok",
          position: "bottom",
          type: tipo,
          duration: 5000
        });
      }    

      setNotificacaoVisualizada = async (item) => {
        try {
          let dataFormatada = `${new Date().getUTCDate()}.${new Date().getUTCMonth() + 1}.${new Date().getUTCFullYear()}`;   
          var parametros = {data : dataFormatada,
                            id: item.ID,
                            usuario: this.state.idUser, 
                            tipo : 'A'};

          const response = await getApi(`NotificacaoVisualizada/${JSON.stringify(parametros)}`);
        } catch(e){
          console.log(e);
        }
      }

        setNotificacoes = (value) => {
            this.setState({ notificacoes : value });
        }

        getNotificacoes = async () => {
         try {
            this.setState({ carregando: true });

            var parametros = { todas: true, usuario: this.state.idUser };
          
            const response = await getApi(`NotificacoesAluno/${JSON.stringify(parametros)}`);
             
             this.setNotificacoes(response.result);

             this.setState({ carregando: false }); 

            } catch (error){
                console.log(error);
            }
        }

        _onRefresh = () => {
          this.setState({refreshing: true});
          this.getNotificacoes().then(() => {
            this.setState({refreshing: false});
          });
        }

        _renderHeader(item, expanded) {
            return (
              <View style={{
                flexDirection: "row",
                padding: 10,
                justifyContent: "space-between",
                alignItems: "center" ,
                backgroundColor: "#123751",
                marginBottom: 5
                 }} >
                <Text style={{ fontWeight: "500", color: "#FFFF", fontSize: 10 }}>
                  {" "}{item.TITULO}
                </Text>

                {expanded ? <Icon style={{ fontSize: 18 }} name="md-remove-circle" /> : <Icon style={{ fontSize: 18 }} name="md-add-circle" />}   
              </View>
            );
          }

          _renderContent(item) {
            return (
             <List>

             <TouchableOpacity onPress={() => this.setNotificacaoVisualizada(item)}>
              <ListItem>
      
                <Body>
                  <Text style={styles.textDescricao}>
                      {item.DESCRICAO}
                  </Text>

                  <Text style={styles.textConteudo}>
                      {item.TEXTO}
                  </Text>
                </Body>

              </ListItem>
             </TouchableOpacity>   

            </List> 
            );
          }

    render(){
        return (  
            <StyleProvider style={getTheme(material)}>  
             <Container>
                <Header>
                
                  <Left>
                      <Button transparent onPress={() => {this.props.navigation.navigate('MenuAluno');} } >
                          <Icon name='arrow-back' />
                      </Button>
                  </Left>

                  <Body>
                   <Title>Notificações</Title>
                  </Body>

                  <Right>
                    <Button iconLeft small rounded onPress={() => this.getNotificacoes()}>
                      <Icon name='md-refresh' />
                      <Text style={styles.textBranco}>
                        Atualizar
                      </Text>
                    </Button> 
                  </Right>
                  
                </Header>

             { 
                this.state.carregando &&
                <Load texto={'Aguarde Carregando os registros..'} />
              } 
             {
             !this.state.carregando &&
              <View style={styles.containerNotificacoes}> 
                  {/* <ScrollView refreshControl={
                             <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}/>}> */}
                   <Accordion
                        dataArray={this.state.notificacoes} 
                        animation={true}
                        expanded={true}
                        renderHeader={this._renderHeader}
                        renderContent={this._renderContent}
                        onAccordionOpen={(index) => this.setNotificacaoVisualizada(index)}
                    /> 
                  {/* </ScrollView> */}
                </View>
              }

             </Container>
            </StyleProvider> 
        );
    }
}

const styles = StyleSheet.create({
  containerNotificacoes:{
    flex: 1,
    marginBottom: 30
  },
  textDescricao: {
  padding: 10,
  fontWeight: "500",
  fontStyle: "italic",
  color: "red"
 },
 textConteudo: {
  padding: 10,
  fontStyle: "italic",
  fontWeight: "500",
  fontSize: 12 
 },
 textBranco : {
  color: "white",
  fontSize: 10
 }
});