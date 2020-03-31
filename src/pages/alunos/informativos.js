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
          Text, Right, Thumbnail, Toast,
          Form, Item, Picker, Label, Input, Spinner, 
          Tab, Tabs, TabHeading, Segment,Footer, FooterTab  } from 'native-base';

import { Modal, View, Alert, StyleSheet, ScrollView, TextInput, 
         RefreshControl, TouchableOpacity, FlatList } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import Icone from "react-native-vector-icons/Ionicons";

import { Constantes } from '../../classes/constantes';

let constPeriodos = new Constantes();

var periodos = constPeriodos.periodos(4);

export default class Informativos extends Component {
    static navigationOptions = {
        title: 'Informativos',
        headerStyle: {backgroundColor: "#123751"},
        headerTintColor: "#FFF"
      }

      constructor(props) {
        super(props);
        
        this.state = {
            infoAnoLetivo: '',
            idUsuario: '',
            avaliacoes: [],
  
            periodo: '',
            nomePeriodo: '',
  
            turmas: [],
            indexTurma: '',
            idTurma: '',
            nomeTurma: '',
  
            refreshing: false,
            modalVisible: false,
            buscando: false,
            textoBuscando: '',
            searchInput: '' 
        };

        this.usuarioLogado();
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

           await this.getDadosAnoLetivo();

           await this.getTurmas();
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
       setAvaliacoes = (value) => {
         this.setState({ avaliacoes : value });
       }

       getAvaliacoes = async () => {
         try {

          if (this.state.idTurma === '') {
             Alert.alert('Atenção','Favor Selecione uma turma!');
          } else {
            this.setState({ carregando: true });

            var parametros = {ano: this.state.idAnoLetivo, turma: this.state.idTurma, etapa: this.state.periodo+1 };
    
            const response = await getApi(`Avaliacoes/${JSON.stringify(parametros)}`);
    
            this.setAvaliacoes(response.result);
          }

         } catch(error){
           Alert.alert('Erro ao buscar avaliações!');
         }  

         this.setState({ carregando: false });
       } 

     //Fim da busca de registros para a tela

      _onRefresh = () => {
        this.setState({refreshing: true});
        this.getAvaliacoes().then(() => {
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
            backgroundColor: "#A9A9A9",
            marginBottom: 5
             }}>
          <Text style={{ fontWeight: "500", color: "#FFFF", fontSize: 10 }}>
              {" "}{item.professor} - Disciplina: {item.disciplina}
            </Text>

            {expanded ? <Icon style={{ fontSize: 18 }} name="md-remove-circle" /> : <Icon style={{ fontSize: 18 }} name="md-add-circle" />}
          </View>
        );
      }

      _renderContent(item) {
        return (
          <List>
            <ScrollView>
                <FlatList
                  data={item.avaliacoes}
                  keyExtractor={(item, index) => item.ID}
                  renderItem={( { item } ) => (
                    <ListItem style={{flex: 0}}>
                      {/* <Left>
                        <Thumbnail source={{ uri: 'Image URL' }} />
                      </Left> */}

                      <Body>
                        <Text style={{fontStyle: "italic", color: "#123751", fontSize: 12, fontWeight: '500'}}>{item.avaliacao}</Text>
                        <Text note style={{fontSize: 10}}>Valor: {item.valor}</Text>
                      </Body>

                      <Right>
                      <Text note style={{fontSize: 10}}>Data: {item.data}</Text>
                      </Right>
                    </ListItem>
                  )}
                />
            </ScrollView> 
          </List>

        );
      }
      //Fim Ações da Tela
  

       //Filtro
     onValueChangePeriodo = async (value) => {
        await this.setState({
           periodo: value,
           nomePeriodo: periodos[value]
         });

         if (this.state.periodo !== ''){
            await this.getAvaliacoes();
         }
       }
 
       onValueChangeIdTurma = (value) => {

        if (value !== '') {
            this.setState({
              indexTurma: value,
              idTurma: this.state.turmas[value].ID,
              nomeTurma: this.state.turmas[value].TURMA
            });
        }
 
       } 

      setTurmas = (value) => {
        this.setState({ turmas : value });
      }

      getTurmas = async () => {
        try {
          this.setState({ buscando: true, textoBuscando: 'Carregando Turmas' });  

          var parametros = {ano: this.state.idAnoLetivo, matricula: this.state.idUsuario};

          const response = await getApi(`Turmas/${JSON.stringify(parametros)}`);

          this.setTurmas(response.result);
        } catch(error){

        } 
   
       this.setState({ buscando: false, textoBuscando: '' });
      }
      //Fim Filtro
 
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
                  <Title>Informativos</Title>
                  <Subtitle>Escolar</Subtitle>
                </Body>

                {/* <Right>
                  <Button iconLeft small rounded onPress={() => this.getFinanceiro()}>
                      <Icon name='md-refresh' />
                      <Text style={stylesPadrao.styleTexto}>Atualizar</Text>
                    </Button> 
                </Right> */}
                
              </Header>
              {/* Fim cabeçalho da pagina */}

              {/* Dados da pagina */}

                 <Tabs>
                    <Tab heading={ <TabHeading>
                                      <Icon name="md-copy" />
                                      <Text style={stylesPadrao.styleTexto}>Avaliações e Atividades</Text>
                                   </TabHeading>}>

                        {
                          this.state.turmas.length !== 0 && 
                         <Header>
                          <Button style={stylesPadrao.styleCampoFiltro} bordered light
                              onPress={() =>
                              ActionSheet.show(
                              {
                                  options: this.state.turmas.map( (item, index) =>{
                                  return item.TURMA
                                  }),
                                  title: "Turmas"
                              },
                              buttonIndex => {
                                  this.onValueChangeIdTurma(buttonIndex)
                              }
                              )}
                            >
                              {
                              this.state.nomeTurma === '' &&
                              <Text style={stylesPadrao.styleTexto}>
                                  Selecione uma Turma
                              </Text>
                              }
                              {
                              this.state.nomeTurma !== '' &&
                              <Text style={stylesPadrao.styleTexto}>
                                  {this.state.nomeTurma}
                              </Text>
                              }
                          </Button>
                        </Header>
                        }

                    {
                      this.state.nomePeriodo !== '' &&  
                      
                      <View style={styles.conteinerTurma}>
                        <Text style={stylesPadrao.styleTextoBranco}>{this.state.nomePeriodo}</Text>
                      </View>
                    }

                        <View style={styles.containernotas}>
                        
                        <Loader loading={this.state.buscando} texto={this.state.textoBuscando} />

                        { 
                         this.state.carregando &&
                          <Load texto={'Aguarde Carregando os registros..'} />
                        } 
                        {
                         !this.state.carregando &&
                           <ScrollView refreshControl={
                            <RefreshControl
                               refreshing={this.state.refreshing}
                               onRefresh={this._onRefresh}/>}>
                            <Accordion
                                dataArray={this.state.avaliacoes} 
                                animation={true}
                                expanded={true}
                                renderHeader={this._renderHeader}
                                renderContent={this._renderContent}
                            /> 
                            </ScrollView>
                          }
                        </View>
        
                        <Footer>
                            <FooterTab>
                                <Button vertical onPress={() => this.onValueChangePeriodo(0)}>
                                 <Text style={styles.styleTexto}>1º Etapa</Text>
                                </Button>

                                <Button vertical onPress={() => this.onValueChangePeriodo(1)}>
                                 <Text style={stylesPadrao.styleTexto}>2º Etapa</Text>
                                </Button>

                                <Button vertical onPress={() => this.onValueChangePeriodo(2)}>
                                 <Text style={stylesPadrao.styleTexto}>3º Etapa</Text>
                                </Button>

                                <Button vertical onPress={() => this.onValueChangePeriodo(3)}>
                                 <Text style={stylesPadrao.styleTexto}>Rec. Final</Text>
                                </Button>
                            </FooterTab>
                         </Footer>
                     </Tab>


                     <Tab heading={ <TabHeading>
                                       <Icon name="md-calendar" />
                                       <Text style={stylesPadrao.styleTexto}>Eventos</Text>
                                    </TabHeading>}>
                       <SemRegistro texto={'Sem Registros!'}/>
                     </Tab>
                 </Tabs>

               {/* Fim dos dados da pagina */}
              

            </Container>
          </StyleProvider> 
        );
    }
}

// Style da pagina
const styles = StyleSheet.create({
  containernotas:{
    marginTop: 5,  
    flex: 1,
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