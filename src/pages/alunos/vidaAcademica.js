import React, { Component } from 'react';

import { DrawerActions, NavigationEvents } from 'react-navigation';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import { stylesPadrao } from '../../style/style';
import { getApi }  from '../../services/api';
import Load from '../../componentes/load';
import Loader from '../../componentes/loader';
import SemRegistro  from '../../componentes/semregistro';

import {  Accordion, ActionSheet, Container,  
          Header, Left, Card, CardItem, Body, Badge, 
          StyleProvider , Button, 
          Icon, Title, Subtitle,
          Content, List, ListItem, 
          Text, Right, Thumbnail, Toast,
          Form, Item, Picker, Label, Input, 
          Spinner, Col, Row, Grid, Segment,
          Footer, FooterTab  } from 'native-base';

import { Modal, View, Alert, StyleSheet, ScrollView, TextInput, 
         RefreshControl, TouchableOpacity, FlatList } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import Icone from "react-native-vector-icons/Ionicons";

var periodos = ["1º Etapa", "2º Etapa", "3º Etapa", "Recuperação"];

export default class VidaAcademica extends Component {
    static navigationOptions = {
        title: 'Notas',
        headerStyle: {backgroundColor: "#123751"},
        headerTintColor: "#FFF"
      }

      constructor(props) {
        super(props);
        
        this.state = {
          infoAnoLetivo: '',
          idUsuario: '',
          historicoVidaAcademica: [],

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
            this.getIdUsuario(infoUsuario.ID);

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
       setVidaAcademica = (value) => {
         this.setState({ historicoVidaAcademica : value });
       }

       getVidaAcademica = async () => {
           try {

            this.setState({ carregando: true });

            let anoLetivo = await this.getDadosAnoLetivo();

            if (this.state.idTurma !== ''){
              var parametros = { matricula: this.state.idUsuario, etapa: this.state.periodo+1, 
                                 ano: anoLetivo, turma: this.state.idTurma};
            } else {
              var parametros = { matricula: this.state.idUsuario, etapa: this.state.periodo+1, 
                                 ano: anoLetivo, turma: 0};
            }

            const response = await getApi(`VidaAcademica/${JSON.stringify(parametros)}`);

            this.setVidaAcademica(response.result);

           } catch(erro){

           }

           this.setState({ carregando: false });
       }
     //Fim da busca de registros para a tela

      _onRefresh = () => {
        this.setState({refreshing: true});
        this.getVidaAcademica().then(() => {
          this.setState({refreshing: false});
        });
      }
      //Fim Ações da Tela

      //Filtro
     onValueChangePeriodo = async (value) => {
       await this.setState({
          periodo: value,
          nomePeriodo: periodos[value]
        });

        await this.getVidaAcademica();
      }

      onValueChangeIdTurma = async (value) => {
        await this.setState({
           indexTurma: value,
           idTurma: this.state.turmas[value].CSI_CODTUR,
           nomeTurma: this.state.turmas[value].TURMA
         });
 
         if (this.state.periodo !== ''){
          await this.getVidaAcademica();
         }
       } 

      setTurmas = (value) => {
        this.setState({ turmas : value });
      }

      getTurmas = async () => {
        try {
          this.setState({ buscando: true, textoBuscando: 'Carregando Turmas' });  

         var parametros = { matricula: this.state.idUsuario};

          const response = await getApi(`VidaAcademicaTurmas/${JSON.stringify(parametros)}`);

          this.setTurmas(response.result);
        } catch(error){

        } 
   
       this.setState({ buscando: false, textoBuscando: '' });
      }
     //Fim Filtro

     //Controla Modal
     setModalVisible(visible, buscar) {
        this.setState({modalVisible: visible});

        if (buscar === true){
          this.getVidaAcademica();
        } 
      }
      //Fim Controle Modal

      limparFiltros = () => {
        this.setState({
          historicoVidaAcademica: [],

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
        });
      }
  

    render(){
        return (  
          <StyleProvider style={getTheme(material)}>  
            <Container>
            <NavigationEvents onWillFocus={() => {
                this.getTurmas();
           }}/>

              {/* Cabeçalho da pagina   */}
              <Header>

                <Left>
                  <Button transparent onPress={() => {this.props.navigation.navigate('MenuAluno');} } >
                    <Icon name='arrow-back' />
                  </Button>
                </Left>

                <Body>
                  <Title>Vida</Title>
                  <Subtitle>Acadêmica</Subtitle>
                </Body>

                <Right>
                  <Button transparent onPress={() => this.limparFiltros()}>
                    <Icon name='md-funnel' />
                    <Text style={styles.textTurma}>
                      Limpar
                    </Text>
                  </Button> 
                </Right>
                
              </Header>
              {/* Fim cabeçalho da pagina */}

            {/* Campo de busca da pagina */}
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
                    <Loader loading={this.state.buscando} texto={this.state.textoBuscando} />

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

              {/* Fim do campo de busca da pagina */}

              {/* Dados da pagina */}
               { 
                 this.state.carregando &&
                 <Load texto={'Aguarde Carregando os registros..'} />
                } 

                {
                 !this.state.carregando &&
                 <View style={styles.containernotas}>


                   {
                    this.state.nomePeriodo !== '' &&  
                    
                    <View style={styles.conteinerTurma}>
                      <Text style={styles.textTurma}>{this.state.nomePeriodo}</Text>
                    </View>
                    }


                  {
                    !this.state.carregando &&
                    // <View style={styles.containernotas}>
                    <List>
                      <ScrollView refreshControl={
                       <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh}/>}>
                          <FlatList
                            data={this.state.historicoVidaAcademica.filter(item => item.DISCIPLINA.toLocaleUpperCase().includes(this.state.searchInput))}
                            keyExtractor={(item, index) => item.ID}
                            renderItem={( { item } ) => (
                                <ListItem style={{flex: 0}}>
                                  <Body>
                                    <Text style={{fontStyle: "italic", color: "#123751", fontSize: 14, fontWeight: '500'}}>{item.DISCIPLINA}</Text>
                                    <Text note style={styles.textDescricaoStyle}>Nota: {item.NOTA}  Faltas: {item.FALTA}</Text>
                                  </Body>

                                  <Right>
                                    <Text note style={styles.textDescricaoStyle}>Carga Horária: {item.AULAS}</Text>
                                  </Right>
                                </ListItem>
                            )}
                          />
                      </ScrollView> 
                    </List>
                //   </View>
                  }


                 {
                  (this.state.historicoVidaAcademica.length === 0) &&
                  <SemRegistro texto={'Favor Selecione uma etapa!'}/>
                 }
                </View>
               } 
               {/* Fim dos dados da pagina */}
              
                 <Footer>
                   <FooterTab>
                     <Button vertical onPress={() => this.onValueChangePeriodo(0)}>
                       <Text>1º Etapa</Text>
                     </Button>

                     <Button vertical onPress={() => this.onValueChangePeriodo(1)}>
                       <Text>2º Etapa</Text>
                     </Button>

                     <Button vertical onPress={() => this.onValueChangePeriodo(2)}>
                       <Text>3º Etapa</Text>
                     </Button>

                     <Button vertical onPress={() => this.onValueChangePeriodo(3)}>
                       <Text>Rec. Final</Text>
                     </Button>
                   </FooterTab>
                 </Footer>

            </Container>
          </StyleProvider> 
        );
    }
}

// Style da pagina
const styles = StyleSheet.create({
  containernotas:{
    flex: 1,
    marginBottom: 40
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
    fontSize: 12,
    fontWeight: '500'
  },
  textAvaliacaoStyle: {
    color: "#fff",
    fontSize: 10,
    fontWeight: '500'
   },
   bottonSalvar: {
    marginTop : 5,
    marginBottom: 2
  }
});
//Fim do style da pagina