import React, { Component } from 'react';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import { stylesPadrao } from '../../style/style';
import { getApi }  from '../../services/api';
import Load from '../../componentes/load';
import Loader from '../../componentes/loader';
import SemRegistro  from '../../componentes/semregistro';

import {  Accordion, ActionSheet, Container, DeckSwiper, 
          Header, Left, Card, CardItem, Body, Badge, 
          StyleProvider , Button, 
          Icon, Title, Subtitle,
          Content, List, ListItem, 
          Text, Right, Thumbnail, Toast, Tab, Tabs, 
          Form, Item, Picker, Label, Input, Spinner, Col, Row, Grid, Segment  } from 'native-base';

import { Animated, Easing, Modal, View, Alert, StyleSheet, ScrollView, TextInput, 
         RefreshControl, TouchableOpacity, FlatList } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import Icone from "react-native-vector-icons/Ionicons";

import IconeFinanceiro from './img/total.png';

var periodos = ["1º Etapa", "2º Etapa", "3º Etapa", "Recuperação"];

export default class Financeiro extends Component {
    static navigationOptions = {
        title: 'Financeiro',
        headerStyle: {backgroundColor: "#123751"},
        headerTintColor: "#FFF"
      }

      constructor(props) {
        super(props);
        this.SlideInLeft = new Animated.Value(0);
        
        this.state = {
          infoAnoLetivo: '',
          idUsuario: '',
          parcelasAberta: [],
          parcelasPagas: [],

          refreshing: false,
          modalVisible: false,
          buscando: false,
          textoBuscando: '',
          searchInput: '' 
        };

        this.usuarioLogado();
      }

      componentDidMount () {
        this.spring();
      }
  
      spring () {
        this.SlideInLeft.setValue(0);
        Animated.timing(this.SlideInLeft, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start()
      }
      
      //Busca dados do Aluno logado
      getIdUsuario = (value) => {
        this.setState({ idUsuario: value });
      }

      usuarioLogado = async () => {

        let infoUsuario = []; 
        AsyncStorage.getItem('dadosusuarioaluno').then(async res => {
          infoUsuario = JSON.parse(res)

          if (infoUsuario.ID !== null) {
           await this.getIdUsuario(infoUsuario.ID);

           await this.getFinanceiro();
          }
        });

        // await this.getDadosAnoLetivo();
     };
     //Fim da busca dos dados do aluno logado

     //Busca dados do ano letivo
     setIdAnoLetivo = (value) => {
        this.setState({ idAnoLetivo : value });
      }

      getDadosAnoLetivo = async () => {
        let res = await AsyncStorage.getItem('dadosanoletivoaluno');
        let infoAnoLetivo = JSON.parse(res);

        if (infoAnoLetivo.ID !== null) {
           this.setIdAnoLetivo(infoAnoLetivo.ID);
            return infoAnoLetivo.ID;
          }

        await this.getDadosEscola();
      }
     //Fim da busca dos dados do ano letivo

     //Busca dados da escola
      setDadosEscola = (value) => {
        this.setState({ idEscola : value });
      }

      getDadosEscola = async () => {
        let res = await AsyncStorage.getItem('dadosescolaaluno');
        let dadosEscola = JSON.parse(res);

        if (dadosEscola.CODIGO !== null){
           this.setDadosEscola(dadosEscola.CODIGO);
           return dadosEscola.CODIGO; 
        }
      }
     //Fim da busca dos dados da escola

     //Busca Registros para a tela
       setFinanceiro = (value, valuePagas) => {
         this.setState({ parcelasAberta : value, parcelasPagas : valuePagas });
       }

       getFinanceiro = async () => {
           try {

            this.setState({ carregando: true });

            var parametros = { matricula: this.state.idUsuario};

            const responseAPagar = await getApi(`ParcelasAbertaAluno/${JSON.stringify(parametros)}`);
            const responsePagas = await getApi(`ParcelasPagasAluno/${JSON.stringify(parametros)}`);

            await this.setFinanceiro(responseAPagar.result,responsePagas.result);

           } catch(erro){

           }

           this.setState({ carregando: false });
       }

       parcelaVencida = (data) => {
         var strData = data;
         var partesData = strData.split("/");
         var dataConvertida = new Date(partesData[2], partesData[1] - 1, partesData[0]);

         if (dataConvertida <= new Date()){
           return true;
         } else {
           return false;
         }
       }

     //Fim da busca de registros para a tela

      _onRefresh = () => {
        this.setState({refreshing: true});
        this.getFinanceiro().then(() => {
          this.setState({refreshing: false});
        });
      }
      //Fim Ações da Tela
  

    render(){
        return (  
          <StyleProvider style={getTheme(material)}>  
            <Container>

              {/* Cabeçalho da pagina   */}
              <Header>

                <Left>
                  <Button transparent onPress={() => {this.props.navigation.navigate('MenuAluno');} } >
                    <Icon name='arrow-back' />
                  </Button>
                </Left>

                <Body>
                  <Title>Situação</Title>
                  <Subtitle>Financeira</Subtitle>
                </Body>

                <Right>
                  <Button iconLeft small rounded onPress={() => this.getFinanceiro()}>
                      <Icon name='md-refresh' />
                      <Text style={styles.textFiltro}>Atualizar</Text>
                    </Button> 
                </Right>
                
              </Header>
              {/* Fim cabeçalho da pagina */}

              <View style={{flex: 1}}>

                 <View style={styles.containerProfessor}>
                  <Text style={styles.textoUsuario}></Text>
                  {/* <Text note style={styles.textoUsuario}>Total Parcelas</Text>  */}
                 </View> 

                <View style={styles.containerEscola}>

                  <Animated.View  style={{flex: 1, width: 120, height: 70, 
                    borderRadius: 4, borderWidth: 0.6, borderColor: '#123751',
                    marginLeft: 5, marginRight: 5,
                    transform: [
                      {
                        translateX: this.SlideInLeft.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-600, 0]
                        })
                      }
                    ]}}>
                    <Card transparent>
                      <CardItem>

                        <Left>
                           <Thumbnail square source={IconeFinanceiro} style={{height: 30, width: 30}}/> 
                         <Body>
                           <Text style={stylesPadrao.styleTextoTamanho14}>R$ 5.500,00</Text>
                           <Text note style={stylesPadrao.styleTextoTamanho14}>Valor Total Parcelas</Text> 
                         </Body>
                        </Left>

                      </CardItem>
                    </Card>
                  </Animated.View >

                </View>

              </View>

            {/* Campo de busca da pagina */}
            {/* <Header searchBar rounded>
                <Item>
            
                 <Input placeholder="Buscar" 
                        onChangeText={(searchInput) => this.setState({ searchInput: searchInput.toLocaleUpperCase()})} 
                        ref='searchInput'
                 />

                 <TouchableOpacity onPress={() => { this.refs.searchInput._root.clear(), this.setState({ searchInput: '' }) }}>  
                  <Icon name="close" />
                 </TouchableOpacity>
                </Item>
              </Header> */}
              {/* Fim do campo de busca da pagina */}

              {/* Dados da pagina */}
               { 
                 this.state.carregando &&
                 <Load texto={'Aguarde Carregando os registros..'} />
                } 

                {
                 !this.state.carregando &&
                 <View style={styles.containernotas}>
                   <Tabs>
                    <Tab heading="Parcelas em Aberto">
                     <List>
  
                      <ScrollView>
           
                            <FlatList
                              data={this.state.parcelasAberta}
                              renderItem={( { item } ) => (
                                <Card  transparent style={{ elevation: 3 }}>
                                <CardItem>
                                  <Left>
                                    <Text style={stylesPadrao.styleTexto}>Nosso Número: {item.NUMERO}</Text>
                                  </Left> 
          
                                   <Right>
                                   <Text style={{fontSize: 12, 
                                                 fontWeight: '500', 
                                                 color: this.parcelaVencida(item.VENCIMENTO) === true ? "#8B0000" : "#000000" }}>
                                      Vencimento: {item.VENCIMENTO}
                                    </Text>
                                    {/* {
                                      new Date(item.VENCIMENTO).toDateString() <= new Date().toDateString() &&
                                      <Text style={{fontSize: 12, fontWeight: '500', color: "#8B0000"}}>Vencimento: {item.VENCIMENTO}</Text>
                                    } 
                                    {
                                      new Date(item.VENCIMENTO).toDateString() > new Date().toDateString() &&
                                      <Text style={{fontSize: 12, fontWeight: '500', color: "#000000"}}>Vencimento: {item.VENCIMENTO}</Text>
                                    }
           */}
                                    
                                   </Right>
                                </CardItem>
          
                                <CardItem>
                                  <Left>
                                    <Text style={stylesPadrao.styleTexto}>{item.DESCRICAO}</Text>
                                    <Text style={stylesPadrao.styleTexto} note>{item.STATUS}</Text>
                                  </Left>
                                </CardItem>
          
                                <CardItem>
                                  <Left>
                                      <Text style={{fontSize: 12, fontWeight: '500', color: "#2E8B57"}}>Total: {item.VALOR_DOC}</Text>
                                  </Left>
          
                                  <Right>
                                      <Text style={{fontSize: 12, fontWeight: '500', color: "#006400"}}>Valor em Aberto: {item.VALOR_ABERTO}</Text>
                                  </Right>
                                </CardItem>
          
                              </Card>
                              )}

                              extraData={this.state}
                          />
         
                        </ScrollView> 
                      </List>

                    </Tab>

                    <Tab heading="Parcelas Pagas">
                      
                      <List>
    
                      <ScrollView>

                            <FlatList
                              data={this.state.parcelasPagas}
                              renderItem={( { item } ) => (
                                <Card  transparent style={{ elevation: 3 }}>
                                  <CardItem>
                                    <Left>
                                      <Text style={stylesPadrao.styleTexto}>Nosso Número: {item.NUMERO}</Text>
                                    </Left> 

                                    <Right>
                                      <Text style={{color: "#006400", fontSize: 12, fontWeight: '500'}}>Valor Pago: {item.VALOR_PAGO}</Text>
                                    </Right>
                                  </CardItem>

                                  <CardItem>
                                    <Left>
                                      <Text style={stylesPadrao.styleTexto}>{item.DESCRICAO}</Text>
                                      <Text style={stylesPadrao.styleTexto} note>{item.STATUS}</Text>
                                    </Left>
                                  </CardItem>

                                  <CardItem>
                                    <Left>
                                      <Text style={{color: "#191970", fontSize: 12, fontWeight: '500'}}>Vencimento: {item.VENCIMENTO}</Text>
                                    </Left>

                                    <Right> 
                                      <Text style={{color: "#191970", fontSize: 12, fontWeight: '500'}}>Pagamento: {item.PAGAMENTO}</Text>
                                    </Right>
                                  </CardItem>

                                </Card>
                              )}

                              extraData={this.state}
                          />

                        </ScrollView> 
                      </List>

                    </Tab>
             
                  </Tabs>

                    {
                     this.state.parcelasAberta.length === 0 &&
                     <SemRegistro texto={'Nenhum Parcela Encontrada!'}/>
                    }
                </View>
           }
               {/* Fim dos dados da pagina */}
              

            </Container>
          </StyleProvider> 
        );
    }
}

// Style da pagina
const styles = StyleSheet.create({
  containerProfessor: {
    backgroundColor: '#123751', height: 70, justifyContent: 'center', alignItems: 'center'
  },
  containerEscola: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', position: 'absolute', top: 10
  },
  containerItemEscola: {
    flex: 1, width: 120, height: 70, 
    borderRadius: 4, borderWidth: 0.6, borderColor: '#123751',
    marginLeft: 5, marginRight: 5
  },
  textoUsuario : {
    color: "#fff",
    fontSize: 14,
    fontWeight: '500'
  },
  containernotas:{
    flex: 4,
    marginTop: 2,
    marginBottom: 40
  },
  contentFiltros: {
    height: 50,
    marginBottom: 15,
    marginLeft: 5, 
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  contentCamposFiltro: { 
    marginTop: 10,
    marginLeft: 10, 
    marginRight: 10,
    flex: 1, 
  },
  textFiltro: { 
    color: "#fff" 
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
  textList:{
    fontSize: 10
  },
  conteinerTurma:{
    alignItems: 'center',
    backgroundColor: '#123751',
    // height: 50, 
    marginBottom: 10
  },
  textTurma:{
    color: "white", 
  },
  textDescricaoStyle: {
    fontSize: 12, fontWeight: '500'
  },
  textAvaliacaoStyle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: '500'
   },
   bottonSalvar: {
    marginTop : 5,
    marginBottom: 2
  }
});
//Fim do style da pagina