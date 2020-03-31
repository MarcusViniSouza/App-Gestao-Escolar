import React, { Component } from 'react';

import { DrawerActions, NavigationEvents } from 'react-navigation';

import {
  ActionSheet, Container, Card, CardItem, DeckSwiper,
  Header, Left, Body, Badge,
  StyleProvider, Button, Form,
  Item, Icon, Input, Title, Text,
  Content, List, ListItem,
  Label, Picker,
  Right, Separator, Spinner,
  Thumbnail, Subtitle, Toast
} from 'native-base';

import { Modal, View, Alert, StyleSheet, FlatList, ScrollView, RefreshControl, SafeAreaView } from 'react-native';

import { Root, Popup } from 'popup-ui';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';
import platform from '../../../native-base-theme/variables/platform';
import Load from '../../componentes/load';
import Loader from '../../componentes/loader';
import SemRegistro from '../../componentes/semregistro';

import Icone from "react-native-vector-icons/Ionicons";

import { getValidaEtapaEncerrada, getDisciplinasProfessor, getTurmasProfessor, getDiasLetivosProfessor } from '../../services/rest';
import { getApi } from '../../services/api';
import { stylesPadrao } from '../../style/style';

import AsyncStorage from '@react-native-community/async-storage';

import IconeAulas from './img/aulas.png';

import { Constantes } from '../../classes/constantes';

let constPeriodos = new Constantes();

var periodos = constPeriodos.periodos(4);

import {
  setRegistroStorage,
  getRegistroStorage,
  salvarStorage,
  buscarStorage
} from '../../services/storage';

export default class RegistroConteudo extends Component {
  static navigationOptions = {
    title: 'Forma de Avaliação',
    headerStyle: { backgroundColor: "#123751" },
    headerTintColor: "#FFF",
    header: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      carregando: false,
      isFetching: false,
      modalVisible: false,
      etapaEncerrada: false,
      searchInput: '',
      idAnoLetivo: '',
      idEscola: '',
      indexTurma: '',
      idTurma: '',
      idSerie: '',
      nomeTurma: '',
      periodo: '',
      nomePeriodo: '',
      indexDisciplina: '',
      idGrade: '',
      nomeDisciplina: '',
      idProf: '',
      idUser: '',
      disciplinas: [],
      turmas: [],
      conteudos: [],
      detalheConteudo: [],
      buscando: false,
      textoBuscando: ''
    }

  }

  limparFiltros = () => {
    this.setState({
      etapaEncerrada: false,
      idAnoLetivo: '',
      anoTexto: '',
      idEscola: '',
      indexTurma: '',
      idTurma: '',
      idSerie: '',
      nomeTurma: '',
      periodo: '',
      nomePeriodo: '',
      indexDisciplina: '',
      idGrade: '',
      idCurso: '',
      nomeDisciplina: '',
      idProf: '',
      idUser: '',
      disciplinas: [],
      turmas: [],
      conteudos: [],
      detalheConteudo: []
    });
  }

  componentDidMount() {
    if (this.state.conteudos.length === 0) {
      this.setModalVisible(!this.state.modalVisible, false);
    }
  }
  //Busca Dados da escola 
  setCodigoEscola = (value) => {
    this.setState({ idEscola: value });
  }

  getDadosEscola = async () => {
    const dadosEscola = await getRegistroStorage('dadosescola');

    if (dadosEscola) {
      const { CODIGO } = dadosEscola;

      this.setCodigoEscola(CODIGO);
      return CODIGO;
    }
  }

  //Busca Dados do Ano Letivo
  setIdAnoLetivo = (value) => {
    this.setState({ idAnoLetivo: value });
  }

  setAnoTexto = (value) => {
    this.setState({ anoTexto: value });
  }

  getDadosAnoLetivo = async () => {
    const infoAnoLetivo = await getRegistroStorage('dadosanoletivo');

    if (infoAnoLetivo) {
      const { ID, CSI_ANOLET } = infoAnoLetivo;

      this.setIdAnoLetivo(ID);
      this.setAnoTexto(CSI_ANOLET);
      return ID;
    }
  }

  //Buscar Dados do Usuário Logado
  setIdProf = (value) => {
    this.setState({ idProf: value });
  }

  setIdUsuario = (value) => {
    this.setState({ idUser: value });
  }

  getDadosUsuario = async () => {
    const infoUsuario = await getRegistroStorage('dadosusuario');

    if (infoUsuario) {
      const { ID, ID_PROF } = infoUsuario;

      await this.setIdProf(ID_PROF);
      await this.setIdUsuario(ID);
      return ID_PROF;
    }
  }

  onValueChangeIdTurma = async (value) => {
    await this.setState({
      indexTurma: value,
      idTurma: this.state.turmas[value].CSI_CODTUR,
      idSerie: this.state.turmas[value].CSI_CODSER,
      idCurso: this.state.turmas[value].CSI_CODCUR,
      nomeTurma: this.state.turmas[value].CSI_NOMTUR,
      indexDisciplina: '',
      idGrade: '',
      nomeDisciplina: '',
      disciplinas: []
    });

    this.getDisciplinas();
  }

  onValueChangePeriodo = async (value) => {
    this.setState({
      periodo: value,
      nomePeriodo: periodos[value]
    });

    if (this.state.turmas.length === 0) {
      await this.getTurmas();
    } else {
      await this.setState({
        indexDisciplina: '',
        idGrade: '',
        nomeDisciplina: '',
        disciplinas: []
      });
    }

  }

  onValueChangeIdDisciplina = async (value) => {
    await this.setState({
      indexDisciplina: value,
      idGrade: this.state.disciplinas[value].CSI_CODGRA,
      nomeDisciplina: this.state.disciplinas[value].DISCIPLINA
    });
  }

  setDisciplinas = (value) => {
    this.setState({ disciplinas: value });
  }

  getDisciplinas = async () => {
    try {

      this.setState({ buscando: true, textoBuscando: 'Carregando Disciplinas' });

      if (this.state.chosenDate !== null) {
        var parametros = {
          serie: this.state.idSerie,
          escola: this.state.idEscola,
          ano: this.state.idAnoLetivo,
          professor: this.state.idProf
        };

        const response = await getDisciplinasProfessor(parametros);

        const { DISCIPLINA } = response[0];

        if (DISCIPLINA !== '0') {
          this.setDisciplinas(response);
        }

      }

    } catch (error) {
      console.log(error);
    }

    this.setState({ buscando: false, textoBuscando: '' });
  }

  //Busca dados das turmas
  setTurmas = (value) => {
    this.setState({ turmas: value });
  }

  getTurmas = async () => {
    try {
      const codigoAnoLetivo = await this.getDadosAnoLetivo();
      const codigoProfessor = await this.getDadosUsuario();
      const codigoEscola = await this.getDadosEscola();

      this.setState({ buscando: true, textoBuscando: 'Carregando Turmas' });

      var parametros = {
        ano: codigoAnoLetivo,
        professor: codigoProfessor,
        escola: codigoEscola
      };

      if (codigoAnoLetivo !== null && codigoProfessor !== null && codigoEscola !== null) {
        const response = await getTurmasProfessor(parametros);

        this.setTurmas(response);
      }
    }
    catch (e) {
      console.log(e);
    }

    this.setState({ buscando: false, textoBuscando: '' });
  }

  setEtapaEncerrada = (value) => {
    this.setState({ etapaEncerrada: value });
  }

  getEtapaEncerrada = async () => {
    try {
      const etapa = this.state.periodo + 1
      const response = await getValidaEtapaEncerrada(this.state.idAnoLetivo, this.state.idGrade, this.state.idTurma, etapa);

      this.setEtapaEncerrada(response);
    } catch (error) {

    }
  }

  setModalVisible = async (visible, buscar) => {
    this.setState({ modalVisible: visible });

    if (buscar === true) {
      await this.salvarFiltro();
      this.getDiasLetivos();
    }
  }

  salvarFiltro = async () => {

    const retorno = await salvarStorage('dadosFiltro', {
      indexPeriodo: this.state.periodo,
      indexTurma: this.state.indexTurma,
      arrayTurma: this.state.turmas,
      indexDisciplina: this.state.indexDisciplina,
      arrayDisciplina: this.state.disciplinas
    });

  }

  buscarFiltro = async () => {

    await this.getDadosAnoLetivo();
    await this.getDadosUsuario();
    await this.getDadosEscola();

    const dadosFiltro = await buscarStorage('dadosFiltro');

    if (dadosFiltro) {

      await this.setState({
        periodo: dadosFiltro.indexPeriodo,
        nomePeriodo: periodos[dadosFiltro.indexPeriodo],

        indexTurma: dadosFiltro.indexTurma,
        idTurma: dadosFiltro.arrayTurma[dadosFiltro.indexTurma].CSI_CODTUR,
        idSerie: dadosFiltro.arrayTurma[dadosFiltro.indexTurma].CSI_CODSER,
        idCurso: dadosFiltro.arrayTurma[dadosFiltro.indexTurma].CSI_CODCUR,
        nomeTurma: dadosFiltro.arrayTurma[dadosFiltro.indexTurma].CSI_NOMTUR,
        turmas: dadosFiltro.arrayTurma,

        indexDisciplina: dadosFiltro.indexDisciplina,
        idGrade: dadosFiltro.arrayDisciplina[dadosFiltro.indexDisciplina].CSI_CODGRA,
        nomeDisciplina: dadosFiltro.arrayDisciplina[dadosFiltro.indexDisciplina].DISCIPLINA,
        disciplinas: dadosFiltro.arrayDisciplina,
      });

    }
  }

  setDiasLetivos = (value) => {
    this.setState({ conteudos: value });
  }

  getDiasLetivos = async () => {
    try {

      const filtro = await this.buscarFiltro();

      if (this.state.periodo !== '' || this.state.idAnoLetivo !== '' || this.state.idGrade !== '' || this.state.idTurma !== '' || filtro === true) {

        this.setState({ carregando: true });

        var parametros = { etapa: this.state.periodo + 1, ano: this.state.idAnoLetivo, grade: this.state.idGrade, turma: this.state.idTurma };

        const response = await getDiasLetivosProfessor(parametros);

        if (response[0].ID > 0) {
          await this.setDiasLetivos(response);
        } else {
          await this.setState({ conteudos: [] });
        }

        await this.getEtapaEncerrada();

        await this.getPrevistaRealizada();

      }

    } catch (error) {

    }

    this.setState({ carregando: false });
  }

  setPrevistaRealizada = (value) => {
    this.setState({ detalheConteudo: value });
  }

  getPrevistaRealizada = async () => {
    try {
      var parametros = {
        etapa: this.state.periodo + 1, ano: this.state.idAnoLetivo,
        grade: this.state.idGrade, turma: this.state.idTurma,
        escola: this.state.idEscola, curso: this.state.idCurso
      };

      const response = await getApi(`PrevistaRealizada/${JSON.stringify(parametros)}`);

      if (response.result.length > 0) {
        this.setPrevistaRealizada(response.result);
      }

    } catch (error) {

    }
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getDiasLetivos().then(() => {
      this.setState({ refreshing: false });
    });
  }

  mensagem = (type, title, textBody, acao) => {
    Popup.show({
      type: type,
      title: title,
      button: false,
      textBody: textBody,
      buttontext: 'Ok',
      callback: () => Popup.hide(acao)
    });
  }

  exibirMensagem = (texto, tipo) => {
    Toast.show({
      text: texto,
      buttonText: "Ok",
      position: "top",
      type: tipo,
      duration: 5000
    });
  }

  deletarRegistro = async (codigo) => {
    try {
      var parametros = { codigo: codigo, usuario: this.state.idUser, ano: this.state.idAnoLetivo };

      const response = await getApi(`ExcluirConteudo/${JSON.stringify(parametros)}`);

      let resultado = response.result;

      if (resultado === 0) {
        await this.setState({ formaAvaliacoes: '' });
        this.mensagem('Success', 'Atenção', 'Conteúdo Excluido com Sucesso!', this.getDiasLetivos());
      } else {
        this.mensagem('Danger', 'Atenção', 'Erro ao Excluir Conteúdo!', null);
      }

    } catch (e) {
      console.log(e);
    }
  }

  clonar = (item) => {
    const { navigate } = this.props.navigation;
    navigate('CadastrarRegistroConteudo', {
      grade: this.state.idGrade, escola: this.state.idEscola,
      ano: this.state.idAnoLetivo, turma: this.state.idTurma,
      etapa: this.state.periodo + 1, anoTexto: this.state.anoTexto,
      usuario: this.state.idUser, professor: this.state.idProf,
      id: item.ID, registro: item,
      editando: false, clonando: true
    });
  }

  editarRegistro = (item) => {
    const { navigate } = this.props.navigation;
    navigate('CadastrarRegistroConteudo', {
      grade: this.state.idGrade, escola: this.state.idEscola,
      ano: this.state.idAnoLetivo, turma: this.state.idTurma,
      etapa: this.state.periodo + 1, anoTexto: this.state.anoTexto,
      usuario: this.state.idUser, registro: item, editando: true, clonando: false
    });
  }

  incluirRegistro = () => {
    const { navigate } = this.props.navigation;
    navigate('CadastrarRegistroConteudo', {
      grade: this.state.idGrade, escola: this.state.idEscola,
      ano: this.state.idAnoLetivo, turma: this.state.idTurma,
      etapa: this.state.periodo + 1, anoTexto: this.state.anoTexto,
      usuario: this.state.idUser,
      id: '',
      editando: false, clonando: false
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StyleProvider style={getTheme(material)}>
          <Container>
            <NavigationEvents onWillFocus={() => {
              this.getDiasLetivos();
            }} />
            <Header>
              <Left>
                <Button transparent onPress={() => { this.props.navigation.navigate('Menu'); }} >
                  <Icon name='arrow-back' />
                </Button>
              </Left>

              <Body>
                <Title>Registro</Title>
                <Subtitle>de Conteúdo</Subtitle>
              </Body>

              <Right>
                <Button transparent onPress={() => {
                  this.setModalVisible(!this.state.modalVisible, false)
                }}>
                  <Icone name='md-funnel'
                    size={28}
                    color={'#FFF'} />
                  <Text style={styles.textDia}>Filtro</Text>
                </Button>
              </Right>

            </Header>

            {
              (this.state.nomeDisciplina !== '' && this.state.etapaEncerrada === false) &&
              <Header>
                <Left>
                  <Button iconLeft small rounded success onPress={() => this.incluirRegistro()}>
                    <Icon name='md-add' style={{ color: 'white' }} />
                    <Text style={styles.textBranco}>
                      Incluir
                </Text>
                  </Button>
                </Left>


                <Right>
                  <Button iconLeft small rounded onPress={() => this.getDiasLetivos()}>
                    <Icon name='md-refresh' style={{ color: 'white' }} />
                    <Text style={styles.textBranco}>
                      Atualizar
                  </Text>
                  </Button>
                </Right>
              </Header>
            }


            {/* Filtros da tela */}
            <View>
              <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                  Alert.alert('Clique em Sair para fechar esta tela.');
                }}
                onShow={() => { this.buscarFiltro(); }}
              >

                {/* Cabeçalho tela de filtros */}
                <Header>
                  <Left>
                    <Button transparent onPress={() => this.setModalVisible(false, false)}>
                      <Icon name='arrow-back' />
                      <Text style={styles.textTurma}>
                        Voltar
                        </Text>
                    </Button>
                  </Left>

                  <Body>
                    <Title>Filtros Registro</Title>
                    <Subtitle>de Conteúdo</Subtitle>
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
                {/* Fim Cabeçalho tela de filtros */}

                <Form style={stylesPadrao.styleModalFiltro}>

                  <Loader loading={this.state.buscando} texto={this.state.textoBuscando} />

                  {/* Campo com os Periodos  */}
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
                  {/* Fim Campo com os Periodos */}

                  {/* Campo com as Turmas */}
                  {
                    this.state.turmas.length > 0 &&
                    <View style={styles.styleViewFiltro}>
                      <Label note numberOfLines={1} >Turma:</Label>

                      <Button style={stylesPadrao.styleCampoFiltro} bordered dark
                        onPress={() =>
                          ActionSheet.show(
                            {
                              options: this.state.turmas.map((item, index) => {
                                return item.CSI_NOMTUR
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
                  {/* Fim Campo com as Turmas */}

                  {/* Campo com as Disciplinas */}
                  {
                    this.state.disciplinas.length > 0 &&
                    <View>
                      <View style={styles.styleViewFiltro}>
                        <Label note numberOfLines={1}>Disciplinas:</Label>
                        <Button style={stylesPadrao.styleCampoFiltro} bordered dark
                          onPress={() =>
                            ActionSheet.show(
                              {
                                options:
                                  this.state.disciplinas.map((item, index) => {
                                    return item.DISCIPLINA
                                  }),
                                title: "Disciplinas"
                              },
                              buttonIndex => {
                                this.onValueChangeIdDisciplina(buttonIndex)
                              }
                            )}
                        >
                          {
                            this.state.nomeDisciplina === '' &&
                            <Text style={stylesPadrao.styleTexto}>
                              Selecione uma disciplina
                            </Text>
                          }
                          {
                            this.state.nomeDisciplina !== '' &&
                            <Text style={stylesPadrao.styleTexto}>
                              Disciplina: {this.state.nomeDisciplina}
                            </Text>
                          }
                        </Button>

                      </View>
                    </View>
                  }
                  {/* Fim campo com as Disciplinas */}

                </Form>

                <Button block info style={stylesPadrao.styleButtonBuscar}
                  onPress={() => this.setModalVisible(false, true)}>
                  <Text>Buscar</Text>
                </Button>

              </Modal>
            </View>
            {/* Fim dos Filtros da tela */}

            {/* Lista com as Formas de Avaliação */}
            {
              this.state.carregando &&
              <Load texto={'Aguarde Carregando os registros..'} />
            }
            {
              !this.state.carregando &&
              <View style={styles.containerAvaliacoes}>

                {
                  this.state.nomeTurma !== '' &&
                  <View style={styles.conteinerTurma}>
                    <Text style={styles.textTurma}>{this.state.nomeTurma}</Text>
                  </View>
                }
                {
                  this.state.etapaEncerrada === true &&
                  <View style={styles.conteinerTurma}>
                    <Text style={styles.textTurma}>Diário: Encerrado</Text>
                  </View>
                }
                {
                  this.state.nomeDisciplina !== '' &&
                  <View style={styles.conteinerTurma}>
                    <Text style={styles.textAvaliacaoStyle}>Disciplina: {this.state.nomeDisciplina}</Text>
                  </View>
                }
                {
                  this.state.nomePeriodo !== '' &&

                  <View style={styles.conteinerTurma}>
                    <Text style={stylesPadrao.styleTextoBranco}>{this.state.nomePeriodo}</Text>
                  </View>
                }

                <List>
                  <ScrollView>
                    <FlatList
                      data={this.state.conteudos}
                      keyExtractor={(item, index) => item.ID}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <Card transparent style={{ elevation: 3 }}>
                          <CardItem>
                            <Left>
                              <Text style={styles.textoTrimestre}>Data: {item.DATA}</Text>
                            </Left>

                            <Right>
                              <Text style={styles.textNotas}>Aulas: {item.QTDE_AULAS} / Letivo:
                          <Icone name={item.LETIVO === 'True' ? "md-checkmark-circle" : "md-checkmark-circle-outline"}
                                  color={item.LETIVO === 'True' ? '#2E8B57' : '#FF4500'}
                                  style={{ fontSize: 12 }} />
                              </Text>
                            </Right>
                          </CardItem>

                          <CardItem>
                            <Body>
                              <Text style={styles.textNotas}>Conteúdo: {item.CONTEUDO}</Text>
                            </Body>
                          </CardItem>

                          {
                            this.state.etapaEncerrada === false &&
                            <CardItem>
                              <Left>
                                <Button iconLeft small rounded info onPress={() => this.editarRegistro(item)}>
                                  <Icon name="md-create" />
                                  <Text style={styles.textAvaliacaoStyle}>Editar</Text>
                                </Button>
                              </Left>

                              <Body>
                                <Button iconLeft small rounded info onPress={() => this.clonar(item)}>
                                  <Icon name="md-copy" />
                                  <Text style={styles.textAvaliacaoStyle}>Clonar</Text>
                                </Button>
                              </Body>

                              <Right>
                                <Button iconLeft small rounded info onPress={() => Alert.alert('Atenção', 'Deseja Excluir Registro de Conteúdo?',
                                  [
                                    { text: 'Não', style: 'cancel', },
                                    { text: 'Sim', onPress: () => this.deletarRegistro(item.ID) },
                                  ],
                                  { cancelable: false },
                                )}>
                                  <Icon name="md-trash" />
                                  <Text style={styles.textAvaliacaoStyle}>Excluir</Text>
                                </Button>
                              </Right>
                            </CardItem>
                          }
                        </Card>
                      )}
                    />

                  </ScrollView>
                </List>

                {
                  this.state.conteudos.length === 0 &&
                  <SemRegistro texto={'Nenhum Registro Encontrado.\nPara buscar os registros clique em filtro!'} />
                }
              </View>
            }

            {
              (this.state.detalheConteudo.length !== 0) &&
              <List>
                <View style={styles.containerTituloDetalhesConteudo}>
                  <View style={styles.containerStyloTituloDetalhesConteudo}>
                    <Text style={styles.textoTituloDetalhesConteudo}>.: Informativo Registro de Conteúdo</Text>
                  </View>
                </View>

                <ScrollView>
                  <FlatList
                    data={this.state.detalheConteudo}
                    renderItem={({ item }) => (

                      <View style={styles.containerDetalhesConteudo}>

                        <View style={styles.containerItensDetalhesConteudo}>
                          <Card transparent style={{ flex: 0 }}>

                            <CardItem>
                              <Left>
                                <Icon name="md-time" size={12} />

                                <Body>
                                  <Text style={styles.textoDetalhesConteudo}>Previstas: {item.prevista}</Text>
                                </Body>
                              </Left>
                            </CardItem>

                          </Card>
                        </View>

                        <View style={styles.containerItensDetalhesConteudo}>
                          <Card transparent style={{ flex: 0 }}>

                            <CardItem>
                              <Left>
                                <Icon name="md-calendar" size={12} />

                                <Body>
                                  <Text style={styles.textoDetalhesConteudo}>Registradas: {item.realizada}</Text>
                                </Body>
                              </Left>
                            </CardItem>

                          </Card>
                        </View>

                      </View>
                    )}
                  />
                </ScrollView>
              </List>
            }

          </Container>
        </StyleProvider>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  containerDetalhesConteudo: {
    flex: 2, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'stretch'
  },
  containerItensDetalhesConteudo: {
    flex: 1, width: 20, height: 50,
    borderRadius: 4, borderWidth: 0.5, borderColor: '#123751',
    marginLeft: 5, marginRight: 5, marginBottom: 5
  },
  textoDetalhesConteudo: {
    fontSize: 15, fontWeight: '500'
  },
  textoVencidoDetalhamentoFinanceiro: {
    fontSize: 10, color: '#FF0000'
  },
  containerTituloDetalhesConteudo: {
    flex: 1, flexDirection: 'column', justifyContent: 'center',
    alignItems: 'stretch'
  },
  containerStyloTituloDetalhesConteudo: {
    height: 50, backgroundColor: '#123751',
    borderRadius: 4, borderWidth: 0.5, borderColor: '#d6d7da',
    marginLeft: 5, marginRight: 5
  },
  textoTituloDetalhesConteudo: {
    color: '#FFFFFF', marginLeft: 5
  },

  containerAvaliacoes: {
    flex: 1,
    marginBottom: 80
  },
  textBranco: {
    color: "white",
    fontSize: 10
  },
  textTitulo: {
    color: "white"
  },
  textoTrimestre: {
    fontSize: 14,
    color: "red"
  },
  textNotas: {
    fontSize: 14, fontWeight: '500'
  },
  viewStyle: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    flexDirection: 'row'
  },
  item: {
    alignItems: "center",
    height: 60,
    width: 100,
    flexGrow: 1,
    backgroundColor: '#F0FFFF',
    margin: 2
  },
  styleViewFiltro: {
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
  textList: {
    fontSize: 10,
    fontWeight: '500'
  },
  conteinerTurma: {
    alignItems: 'center',
    backgroundColor: '#123751'
  },
  textTurma: {
    color: "white",
  },
  textDescricaoStyle: {
    fontSize: 12,
    fontWeight: '500'
  },
  textAvaliacaoStyle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: '500'
  },
  bottonSalvar: {
    marginTop: 5,
    marginBottom: 2
  }
});