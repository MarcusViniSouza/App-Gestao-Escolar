import  React, { Component } from 'react';

import { DrawerActions } from 'react-navigation';

import {  Accordion, Container, CheckBox, 
          Card, CardItem, DatePicker, 
          Header, Left, Body, 
          StyleProvider , Button, 
          Icon, Title,
          Content, List, ListItem, 
          Text, Right, Thumbnail,
          Form, Item, Picker, Label, Input } from 'native-base';

import { Alert, Modal, StyleSheet, View, FlatList, ScrollView, 
         RefreshControl, TouchableHighlight, TouchableOpacity, 
         ActivityIndicator, Linking  } from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import Icone from "react-native-vector-icons/Ionicons";

import Load from '../../componentes/load';
import SemRegistro  from '../../componentes/semregistro';
import { getApi }  from '../../services/api';
import { stylesPadrao } from '../../style/style';

import AsyncStorage from '@react-native-community/async-storage';


export default class Contatos extends Component {
    static navigationOptions = {
        title: 'Contatos',
        headerStyle: {backgroundColor: "#123751"},
        headerTintColor: "#FFF"
      }

      constructor(props) {
        super(props);

        this.state = { 
            contatos: [],
            page: 1,
            tipochave: 'T',
            modalVisible: false,
            carregando: false,
            loading: false,
            refreshing: false,
            searchInput : '' 
        };
      }
    
      loadRepositories = async () => {
        if (this.state.loading) return;
    
        const { page } = this.state;
    
        this.setState({ loading: true });
        
        const quantidadeRegistros = this.state.contatos.length;

        var parametros = { tipo: this.state.tipochave, registros : quantidadeRegistros };
    
        const response = await getApi(`ListarTelefones/${JSON.stringify(parametros)}`);
    
        this.setState({
          contatos: [ ...this.state.contatos, ...response.result  ],
          page: page + 1,
          loading: false,
        });
      }

      renderFooter = () => {
        if (!this.state.loading) return null;
        return (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        );
      };

        setContatos = (value) => {
            this.setState({ contatos : value });
        }

        getContatos = async () => {
         try {
            
            this.setContatos();

            this.setState({ carregando: true });

            const quantidadeRegistros = 0;

            var parametros = { tipo: this.state.tipochave, registros : quantidadeRegistros };
            
            const response = await getApi(`ListarTelefones/${JSON.stringify(parametros)}`);
             
             this.setContatos(response.result);

             this.setState({ carregando: false }); 

            } catch (error){
                console.log(error);
            }
        }

        setModalVisible(visible, buscar) {
            this.setState({modalVisible: visible});
    
            if (buscar === true){
              this.getContatos();
            }
          }

        onValueChangeTipo = (value) => {
            this.setState({
              tipochave: value
            });
          }

        _onRefresh = () => {
          this.setState({refreshing: true});
          this.getContatos().then(() => {
            this.setState({refreshing: false});
          });
        }

        ligarPara = (value) => {
          Linking.openURL(`tel:${value}`); 
        }

    render(){
        return (  
            <StyleProvider style={getTheme(material)}>  
             <Container>
                <Header>
                
                  <Left>
                      <Button transparent onPress={() => {this.props.navigation.navigate('Menu');} } >
                          <Icon name='arrow-back' />
                      </Button>
                  </Left>

                  <Body>
                   <Title>Contatos</Title>
                  </Body>

                  <Right>
                    <Button transparent onPress={() => {this.setModalVisible( !this.state.modalVisible,false) }}>
                      <Icone name='md-funnel' 
                            size={28} 
                            color={'#FFF'}/>
                      <Text style={styles.textFiltro}>Filtro</Text>
                    </Button>
                  </Right>
                  
                </Header>

                <Header searchBar rounded>
                  <Item>
              
                    <Input placeholder="Buscar" 
                            onChangeText={(searchInput) => this.setState({ searchInput: searchInput.toLocaleUpperCase()})} 
                            ref='searchInput'
                    />

                    <TouchableOpacity onPress={() => { this.refs.searchInput._root.clear(), this.setState({ searchInput: '' }) }}>  
                      <Icon name="close" />
                    </TouchableOpacity>
                  </Item>
                </Header>


                <View >
               <Modal
                  animationType="slide"
                  transparent={false}
                  visible={this.state.modalVisible}
                  onRequestClose={() => {
                    Alert.alert('Para fechar clique em Sair.');
                  }}>

                 <Header>
                    <Left>
                      <Button transparent onPress={() => this.setModalVisible(false,false)}>
                        <Icon name='arrow-back' />
                        <Text style={styles.textFiltro}>
                          Voltar
                        </Text>
                      </Button>
                    </Left>

                    <Body>
                      <Title>Filtros Contatos</Title>
                    </Body>
                  
                  </Header>

                 <Form style={stylesPadrao.styleModalFiltros}>   

                   <View>
                    <View style={stylesPadrao.styleViewFiltro}>  
                      <Label note numberOfLines={1} >Tipo de Contato:</Label>
                      <Item picker>
                        <Picker
                          mode="dropdown"
                          iosIcon={<Icon name="arrow-down" />}
                          placeholder="Selecione um tipo de Contato"
                          placeholderStyle={{ color: "#fff" }}
                          placeholderIconColor="#fff"
                          selectedValue={this.state.tipochave}
                          onValueChange={this.onValueChangeTipo.bind(this)}
                        >
                          <Picker.Item label="Todos" value="T" />
                          <Picker.Item label="Aluno" value="A" />
                          <Picker.Item label="Professor" value="P" />
                          <Picker.Item label="Professor Substituto" value="S" />
                          <Picker.Item label="Funcionário" value="O" />
                          <Picker.Item label="Fornecedor" value="F" />
                        </Picker>
                      </Item>
                    </View>
                  </View>

                 </Form>

                 <Button block info style={stylesPadrao.styleButtonBuscar}
                            onPress={() => this.setModalVisible(false,true)}>
                      <Text>Buscar</Text>
                 </Button> 

               </Modal>
              </View>

             { 
                this.state.carregando &&
                <Load texto={'Aguarde Carregando os registros..'} />
              } 
             {
              !this.state.carregando &&
              <View style={styles.containerContatos}> 
                  <ScrollView refreshControl={
                             <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}/>}>
                   <FlatList
                        data={this.state.contatos.filter(item => item.NOME.toLocaleUpperCase().includes(this.state.searchInput))}
                        renderItem={( { item, index } ) => (
                          <Card>
                            <CardItem>
                              <Left>
                                 <Icone name={'md-person'} size={30}/>
                                <Body>
                                  <Text>{item.NOME}</Text>    
                                 <Text note>{item.TIPOCHAVE}</Text> 
                                </Body>
                              </Left>
                            </CardItem>
                       
                            <CardItem>
                              <Left>
                               {
                                  ((item.CELULAR !== '') && (item.CELULAR !== '(  )      -')) &&
                                  <Button transparent style={{height: 10, marginTop: 10}} onPress={() => this.ligarPara(item.CELULAR)}>
                                    <Icon name={'md-call'} style={styles.buttonLigarStyle}/>
                                    <Text note style={styles.textLigarStyle}>{item.CELULAR}</Text> 
                                  </Button> 
                                }
                              </Left>
                              {/* <Body>
                          
                              </Body> */}
                              <Right>
                               {
                                  ((item.TELEFONE !== '') && (item.TELEFONE !== '(  )      -')) &&
                                  <Button transparent style={{height: 10}} onPress={() => this.ligarPara(item.TELEFONE)}>
                                    <Icon name={'md-home'} style={styles.buttonLigarStyle}/>
                                    <Text note style={styles.textLigarStyle}>{item.TELEFONE}</Text> 
                                  </Button> 
                                }
                              </Right>
                            </CardItem>
                          </Card>
                        )}

                        // extraData={this.state}
                        onEndReached={() => this.loadRepositories()}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={() => this.renderFooter()}
                     />
                   
                  </ScrollView>

                {
                  this.state.contatos.length === 0 && 
                    <SemRegistro texto={'Favor Clique no botão de filtro\nPara buscar os registros!'}/>
                 }

                </View>
              } 

             </Container>
            </StyleProvider> 
        );
    }
}

const styles = StyleSheet.create({
  containerContatos:{
    flex: 1,
    marginBottom: 20
  },
  textDescricao: {
  padding: 10,
  fontStyle: "italic",
  color: "red"
 },
 textConteudo: {
  padding: 10,
  fontStyle: "italic",
 },
 contentCamposFiltro: { 
   marginTop: 10,
   marginLeft: 10, 
   marginRight: 10,
   flex: 1, 
   // flexDirection: 'row'
 },
 textFiltro: { 
   width: 70, 
   height: 25,
   marginBottom: 10,
   marginLeft: 5, 
   marginRight: 2,
   marginTop: 10,
   justifyContent: 'center',
   alignItems: 'center' 
 },
 buttonConsultar: { 
   marginLeft: 10, 
   marginRight: 10,
   marginBottom: 5 
 },
 buttonSalvar: { 
   marginLeft: 10, 
   marginRight: 10, 
   marginBottom: 30
 },
 buttonLigarStyle: {
    // fontSize: 10, 
    color: '#2E8B57'
 },
 textLigarStyle: {
    // fontSize: 10, 
    color: '#2E8B57'  
 },
 loading: {
  alignSelf: 'center',
  marginVertical: 20,
 },
 textFiltro:{
  color: "white", 
}
});