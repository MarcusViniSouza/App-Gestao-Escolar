import  React, { Component } from 'react';

import { DrawerActions } from 'react-navigation';

import { Container, 
        Header, Left, Body, 
        StyleProvider , Button, 
        Icon, Spinner, Title,
        Content, List, ListItem, Text, Right} from 'native-base';

import { View, Alert, StyleSheet, FlatList, ScrollView, 
         RefreshControl, TouchableOpacity, BackHandler } from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import AsyncStorage from '@react-native-community/async-storage';

import Load from '../../componentes/load';
import Loader from '../../componentes/loader';

import { getApi }  from '../../services/api';

export default class EscolaAluno extends Component {
    static navigationOptions = {
        title: 'Escolas',
        headerStyle: {backgroundColor: "#007AFF"},
        headerTintColor: "#FFF",
        header: null,
      }

      constructor(props){
        super(props);
  
          this.state = {
            escolas : [],
            carregando: false,
            refreshing: false,
            acessando: false,
            textoAcessando: '',
          }
  
          this.escolasUsuario();
       }

       componentWillMount = () => {
        BackHandler.addEventListener('hardwareBackPress', () => true);
      }    

    setDadosEscola = async (escolaSelecionada) => {
        try {
          await AsyncStorage.setItem('dadosescolaaluno', JSON.stringify(escolaSelecionada));
        } catch (e) {
          console.error('erro ao salvar dados da escola.'); 
        }
      }

      selecionar(nomeEscola) {
        this.setState({ acessando: true, textoAcessando: 'Aguarde' });

        const { navigate } = this.props.navigation;
        this.setDadosEscola(nomeEscola);
        navigate('MenuAluno',{escola: nomeEscola.ESCOLA, id: nomeEscola.CODIGO});

        this.setState({ acessando: false, textoAcessando: '' });
      }

      handleEscolas = (value) => {
        this.setState({ escolas : value});
     }

      escolasUsuario = async () => {

        let idusuario = []; 
        AsyncStorage.getItem('dadosusuarioaluno').then(async res => {
          idusuario = JSON.parse(res)

          this.setState({ carregando: true });

          this.handleEscolas();

          if (idusuario.ID !== null) {
            const response = await getApi(`EscolasAluno/${idusuario.ID}`);

            this.handleEscolas(response.result);

            this.setState({ carregando: false }); 
          }
        });
     };

     _onRefresh = () => {
      this.setState({refreshing: true});
      this.escolasUsuario().then(() => {
        this.setState({refreshing: false});
      });
    }

    logout(){
      const { navigate } = this.props.navigation;
      navigate('MainAluno');
    }

    render(){
        return (
          <StyleProvider style={getTheme(material)}>  
            <Container>
              <Header>

                <Body>
                  <Title>Escolas</Title>
                </Body>

                <Right>
                  <Button small transparent onPress={() => this.logout()}>
                    <Icon name='md-log-out' />
                     <Text>
                      Sair
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
               <View> 
                 <Loader loading={this.state.acessando} texto={this.state.textoAcessando} />
                <List>

                 <ScrollView refreshControl={
                             <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}/>}>
                                      
                      <FlatList
                        data={this.state.escolas}
                        // keyExtractor={(item, index) => item.CODIGO}
                        renderItem={( { item } ) => (
                         <List>
                          <ListItem>
                            <Left>
                              <TouchableOpacity onPress={() => this.selecionar(item)}>
                               <Text>{item.ESCOLA}</Text>
                              </TouchableOpacity> 
                            </Left>
                            
                            <Right>
                             <TouchableOpacity onPress={() => this.selecionar(item)}>
                              <Icon name="arrow-forward" />
                             </TouchableOpacity> 
                            </Right>
                          </ListItem>
                         </List> 
                        )}
                    />
                                      
                  </ScrollView> 

                </List>

              </View>
              }  

            </Container>
          </StyleProvider> 
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C1C1C1',
  }
});
