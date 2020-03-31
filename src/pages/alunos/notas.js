import React, { Component } from 'react';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import { stylesPadrao } from '../../style/style';
import { getApi }  from '../../services/api';
import Load from '../../componentes/load';
import Loader from '../../componentes/loader';
import SemRegistro  from '../../componentes/semregistro';

import {  ActionSheet, Container,  
          Header, Left, Card, CardItem, Body, Badge, 
          StyleProvider , Button, 
          Icon, Title, Subtitle,
          Content, List, ListItem, 
          Text, Right, Thumbnail, Toast,
          Form, Item, Picker, Label, Input, Spinner  } from 'native-base';

import { Modal, View, Alert, StyleSheet, ScrollView, TextInput, 
         RefreshControl, TouchableHighlight, TouchableOpacity, FlatList } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import Icone from "react-native-vector-icons/Ionicons";

import Aluno from './img/boy.png';
import Aluna from './img/girl.png';

import { Constantes } from '../../classes/constantes';

let constPeriodos = new Constantes();

var periodos = constPeriodos.periodos(4);

export default class NotasAluno extends Component {
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
          notasAluno: [],

          periodo: '',
          nomePeriodo: '',

          turmas: [],
          indexTurma: '',
          idTurma: '',
          idSerie: '',
          nomeTurma: '',
          descricaoTurmaSelecionada: '',

          avaliacoes: [],

          idEscola: '',

          refreshing: false,
          modalVisible: false,
          buscando: false,
          carregandoAvaliacoes: false,
          modalAvaliacoesVisible: false,
          DisciplinaSelecionada: '',
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
          }
        });

        await this.getDadosAnoLetivo();
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

       setNotasAluno = (value) => {
         this.setState({ notasAluno : value });
       }

       getNotasAluno = async () => {
           try {

            this.setState({ carregando: true });

            let idEscola = await this.getDadosEscola();

            var parametros = {serie: this.state.idSerie, escola: idEscola, ano: this.state.idAnoLetivo,
                              turma: this.state.idTurma, etapa: this.state.periodo+1, matricula: this.state.idUsuario};

            const response = await getApi(`NotasAluno/${JSON.stringify(parametros)}`);

            this.setNotasAluno(response.result);

           } catch(erro){

           }

           this.setState({ carregando: false });
       }

       setAvaliacoes = (value) => {
         this.setState({ avaliacoes: value });
       }

       getAvaliacoes = async (grade) => {
        try {

          this.setState({ carregandoAvaliacoes: true });  

          var parametros = {turma: this.state.idTurma, grade: grade, etapa: this.state.periodo+1, matricula: this.state.idUsuario};

          const response = await getApi(`AvaliacoesPorGrade/${JSON.stringify(parametros)}`);

          this.setAvaliacoes(response.result);

         } catch(erro){

         }

         this.setState({ carregandoAvaliacoes: false });
       }
     //Fim da busca de registros para a tela

     //Filtro
     onValueChangePeriodo = async (value) => {
        await this.setState({
          periodo: value,
          nomePeriodo: periodos[value]
        });

        if (this.state.turmas.length === 0){
          await this.getTurmas(); 
        } else {
          await this.onValueChangeIdTurma(this.state.indexTurma);
        }
      }

      onValueChangeIdTurma = async (value) => {
        await this.setState({
           indexTurma: value,
           idTurma: this.state.turmas[value].ID,
           idSerie: this.state.turmas[value].SERIE,
           nomeTurma: this.state.turmas[value].TURMA,
           descricaoTurmaSelecionada: this.state.turmas[value].TURMA + ' / ' + this.state.nomePeriodo 
         });
 
       } 
     //Fim Filtro 

     //Controla Modal
      setModalVisible(visible, buscar) {
        this.setState({modalVisible: visible});

        if (buscar === true){
          this.getNotasAluno();
        } 
      }

      setModalAvaliacoesVisible(visible, disciplina, grade) {
        this.setState({ modalAvaliacoesVisible: visible, DisciplinaSelecionada: disciplina });

        if (visible === true){
          this.getAvaliacoes(grade);
        }
      }
      //Fim Controle Modal

      //Ações da Tela
      limparFiltros = () => {
        this.setState({
          periodo: '',
          nomePeriodo: '',
          turmas: [],
          idTurma: '',
          nomeTurma: '',
          notasAluno: [],
          filtro : ''
        });
      }

      _onRefresh = () => {
        this.setState({refreshing: true});
        this.getNotasAluno().then(() => {
          this.setState({refreshing: false});
        });
      }

      notaNaMedia = (nota, total) => {
        var mediaAvaliacao = parseFloat(total)*60/100;
        return parseFloat(nota) <= mediaAvaliacao ? false : true;
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
                  <Title>Notas</Title>
                </Body>

                <Right>
            
                  <Button transparent onPress={() => {
                                              this.setModalVisible(!this.state.modalVisible,false)
                                              }}>
                    <Icone name='md-funnel' 
                           size={28} 
                           color={'#FFF'}/>
                    <Text style={styles.textTurma}>Filtro</Text>
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
              {/* Fim do campo de busca da pagina */}

              {/* Filtros da pagina */}
              <View>
               <Modal
                  animationType="slide"
                  transparent={false}
                  visible={this.state.modalVisible}
                  onRequestClose={() => {
                    Alert.alert('Clique em Sair para fechar esta tela.');
                  }}>

                  <Header>
                    <Left>
                      <Button transparent onPress={() => this.setModalVisible(false,false)}>
                        <Icon name='arrow-back' />
                        <Text style={styles.textTurma}>
                          Voltar
                        </Text>
                      </Button>
                    </Left>

                    <Body>
                      <Title>Filtros Notas</Title>
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

                <Form style={stylesPadrao.styleModalFiltro}>

                <Loader loading={this.state.buscando} texto={this.state.textoBuscando} />

                  <View style={stylesPadrao.styleViewFiltro}>  
                      <Label note numberOfLines={1} >Periodo:</Label>

                      <Button style={stylesPadrao.styleCampoFiltro} bordered dark
                          onPress={() =>
                          ActionSheet.show(
                            {
                              options: periodos,
                              title: "Periodos"
                            },
                            buttonIndex => {
                              this.onValueChangePeriodo(buttonIndex)
                            }
                          )}
                        >
                          {
                            this.state.nomePeriodo === '' &&
                            <Text style={stylesPadrao.styleTexto}>
                              Selecione um Periodo
                            </Text>
                          }
                          {
                            this.state.nomePeriodo !== '' &&
                            <Text style={stylesPadrao.styleTexto}>
                              Periodo: {this.state.nomePeriodo}
                            </Text>
                          }
                        </Button>

                    </View> 

                 {
                   this.state.turmas.length !== 0 && 
                 <View style={stylesPadrao.styleViewFiltro}> 
                  <Label note numberOfLines={1} >Turma:</Label>

                  <Button style={stylesPadrao.styleCampoFiltro} style={stylesPadrao.styleCampoFiltro} bordered dark
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
                            Turma: {this.state.nomeTurma}
                          </Text>
                        }
                      </Button>

                  </View>
                 } 

                  </Form>

                 <Button block info style={stylesPadrao.styleButtonBuscar}
                            onPress={() => this.setModalVisible(false,true)}>
                      <Text>Buscar</Text>
                 </Button> 

               </Modal>
              </View>
              {/* Fim dos filtros da pagina */}

              {/* Dados da pagina */}
               { 
                 this.state.carregando &&
                 <Load texto={'Aguarde Carregando os registros..'} />
                } 

                {
                 !this.state.carregando &&
                 <View style={styles.containernotas}>
                   {
                    this.state.descricaoTurmaSelecionada !== '' &&  
                    <View style={styles.conteinerTurma}>
                        <Text style={styles.textAvaliacaoStyle}>{this.state.descricaoTurmaSelecionada}</Text>
                      </View>
                    }

                  {
                    !this.state.carregando &&
                    <List>
                      <ScrollView refreshControl={
                       <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh}/>}>
                          <FlatList
                            data={this.state.notasAluno.filter(item => item.DISCIPLINA.toLocaleUpperCase().includes(this.state.searchInput))}
                            keyExtractor={(item, index) => item.CSI_CODGRA}
                            renderItem={( { item } ) => (
                              <ListItem> 
                                  {/* <Left>
                                    <Button style={{ backgroundColor: "#007AFF" }}>
                                      <Icon active name="md-eye" />
                                    </Button>
                                  </Left> */}

                                   <Left>
                                    <TouchableOpacity onPress={() => { this.setModalAvaliacoesVisible(!this.state.modalAvaliacoesVisible,
                                                                                                      item.DISCIPLINA, item.CSI_CODGRA);}}> 
                                     <Text style={stylesPadrao.styleTextoTamanho14}>{item.DISCIPLINA}</Text>
                                    </TouchableOpacity> 
                                   </Left>

                                  <Body>
                                 
                                  </Body> 
        
                                  <Right>
                                    <TouchableOpacity onPress={() => { this.setModalAvaliacoesVisible(!this.state.modalAvaliacoesVisible,
                                                                                                      item.DISCIPLINA, item.CSI_CODGRA);}}>
                                      <Badge info>
                                        <Text style={stylesPadrao.styleTexto}>{item.NOTA}</Text>
                                      </Badge>
                                    </TouchableOpacity> 
                                  </Right>
                              </ListItem>
                            )}
                          />
                      </ScrollView> 
                    </List>

                  }

                 {
                  (this.state.notasAluno.length === 0) &&
                  <SemRegistro texto={'Favor Clique no botão de filtro\nPara buscar os registros!'}/>
                 }
                </View>
               } 
               {/* Fim dos dados da pagina */}

               {/* Modal Avaliações Por Grade */}
                <View style={{marginTop: 22}}>
                  <Modal 
                    animationType="fade"
                    transparent={false}
                    presentationStyle="pageSheet"
                    visible={this.state.modalAvaliacoesVisible}
                    onRequestClose={() => {
                      Alert.alert('Atenção','Click no botão voltar para fechar!');
                    }}>

                  <Header>
                    <Left>
                      <Button transparent onPress={() => { this.setModalAvaliacoesVisible(!this.state.modalAvaliacoesVisible,'','');}}>
                        <Icon name='arrow-back' />
                        <Text style={styles.textTurma}>
                          Voltar
                        </Text>
                      </Button>
                    </Left>

                    <Body>
                      <Title>Avaliações</Title>
                      <Subtitle>Disciplina {this.state.DisciplinaSelecionada}</Subtitle>
                    </Body>
                  
                  </Header>  

                  { 
                    this.state.carregandoAvaliacoes &&
                    <Load texto={'Aguarde Carregando os registros..'} />
                  } 

                  {
                    !this.state.carregandoAvaliacoes &&

                    <View style={styles.containerAvaliacoes}>
                      <List>
                        <ScrollView>
                          <FlatList
                            data={this.state.avaliacoes}
                            renderItem={( { item } ) => (
                              <ListItem thumbnail> 
                                  {/* <Left>
                                  </Left> */}

                                  <Body>
                                   <Text style={stylesPadrao.styleTexto}>{item.DESCRICAO}</Text>
                                   <Text note style={stylesPadrao.styleTexto}>Valor: {item.VALOR} Pontos</Text>
                                  </Body> 
          
                                  <Right>
                                   { 
                                    this.notaNaMedia(item.NOTA,item.VALOR) === false &&
                                      <Badge danger>
                                        <Text style={stylesPadrao.styleTexto}>Nota: {item.NOTA}</Text> 
                                      </Badge> }
                                    {
                                      this.notaNaMedia(item.NOTA,item.VALOR) === true &&
                                      <Badge success>
                                        <Text style={stylesPadrao.styleTexto}>Nota: {item.NOTA}</Text>
                                      </Badge>
                                    }
                                  </Right>
                              </ListItem>
                            )}
                          />
                        </ScrollView> 
                      </List>
                    </View>
                   } 

                    </Modal>
                </View>
               {/* Fim do Modal Avaliações Por Grade */}
            </Container>
          </StyleProvider> 
        );
    }
}

// Style da pagina
const styles = StyleSheet.create({
  containernotas:{
    flex: 1,
    marginBottom: 30
  },
  containerAvaliacoes: {
    flex: 1,
    marginLeft: 5, 
    marginRight: 5, 
    marginBottom: 30
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
    backgroundColor: '#123751'
  },
  textTurma:{
    color: "white", 
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