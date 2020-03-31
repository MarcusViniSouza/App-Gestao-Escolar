import React, { Component } from 'react';

import { DrawerActions, NavigationEvents } from 'react-navigation';

import {
  ActionSheet, Container, Card, CardItem, DeckSwiper,
  Header, Left, Body,
  StyleProvider, Button, Form,
  Item, Icon, Input, Title, Text, Badge,
  Content, List, ListItem,
  Label, Picker,
  Right, Separator, Spinner,
  Thumbnail, Subtitle, Toast
} from 'native-base';

import { Modal, View, Alert, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';

import { Root, Popup } from 'popup-ui';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';
import platform from '../../../native-base-theme/variables/platform';
import Load from '../../componentes/load';
import Loader from '../../componentes/loader';
import SemRegistro from '../../componentes/semregistro';

import Icone from "react-native-vector-icons/Ionicons";

import { getApi } from '../../services/api';
import { stylesPadrao } from '../../style/style';

import AsyncStorage from '@react-native-community/async-storage';

import IconeAulas from './img/aulas.png';

import { Constantes } from '../../classes/constantes';

import {
  setRegistroStorage,
  getRegistroStorage,
  salvarStorage,
  buscarStorage
} from '../../services/storage';

let constPeriodos = new Constantes();

var periodos = constPeriodos.periodos(4);
var tiposAvaliacao = ["Avaliação", "Recuperação", "Ponto Extra", "Atividade", "Recuperação de Item", "Recuperação Parcial"];

export default class FormaAvaliacao extends Component {
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
      dadosTrimestre: [],
      formaAvaliacoes: [],
      buscando: false,
      textoBuscando: ''
    }

  }

  limparFiltros = () => {
    this.setState({
      etapaEncerrada: false,
      indexTurma: '',
      idTurma: '',
      idSerie: '',
      idGrade: '',
      nomeTurma: '',
      periodo: '',
      nomePeriodo: '',
      indexDisciplina: '',
      nomeDisciplina: '',
      disciplinas: [],
      turmas: [],
      dadosTrimestre: [],
      formaAvaliacoes: []
    });
  }

  componentDidMount() {
    if (this.state.formaAvaliacoes.length === 0) {
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
      nomeTurma: this.state.turmas[value].CSI_NOMTUR
    });

    await this.setState({
      indexDisciplina: '',
      idGrade: '',
      nomeDisciplina: ''
    });

    this.getDisciplinas();
  }

  onValueChangePeriodo = async (value) => {
    if (this.state.turmas.length === 0) {
      await this.getTurmas();
    } else {
      await this.onValueChangeIdTurma(this.state.indexTurma);
    }

    this.setState({
      periodo: value,
      nomePeriodo: periodos[value]
    });

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

        const response = await getApi(`getDisciplinasProfessor/${JSON.stringify(parametros)}`);

        const { DISCIPLINA } = response.result[0];

        if (DISCIPLINA !== '0') {
          this.setDisciplinas(response.result);
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
      let codigoAnoLetivo = await this.getDadosAnoLetivo();
      let codigoProfessor = await this.getDadosUsuario();
      let codigoEscola = await this.getDadosEscola();

      this.setState({ buscando: true, textoBuscando: 'Carregando Turmas' });

      var parametros = {
        ano: codigoAnoLetivo,
        professor: codigoProfessor,
        escola: codigoEscola
      };

      if (codigoAnoLetivo !== null && codigoProfessor !== null && codigoEscola !== null) {
        const response = await getApi(`TurmasProf/${JSON.stringify(parametros)}`);

        this.setTurmas(response.result);
      }
    }
    catch (e) {
      console.log(e);
    }

    this.setState({ buscando: false, textoBuscando: '' });
  }

  //Busca as Formas de Avaliação
  setFormaAvaliacao = (value) => {
    this.setState({ formaAvaliacoes: value });
  }

  getFormaAvaliacao = async () => {
    try {

      const filtro = await this.buscarFiltro();

      if (this.state.nomeTurma !== '' || this.state.nomePeriodo !== '' || this.state.nomeDisciplina !== '' || filtro === true) {

        this.setState({ carregando: true });

        let codigoAnoLetivo = await this.getDadosAnoLetivo();
        let idAnoLetivo = await this.getDadosAnoLetivo();
        let idEscola = await this.getDadosEscola();

        var parametros = {
          escola: idEscola, ano: idAnoLetivo,
          etapa: this.state.periodo + 1, grade: this.state.idGrade,
          turma: this.state.idTurma, ignorarItens: false
        };

        const response = await getApi(`FormacaoNotas/${JSON.stringify(parametros)}`);

        await this.setFormaAvaliacao(response.result);

        await this.salvarFiltro();

        await this.getEtapaEncerrada();

        this.setState({ carregando: false });

        await this.getNotasPorEtapa();
      }
    } catch (e) {
      console.log(e);
    }
  }

  //Busca Dados do Trimestre
  setNotasPorEtapa = (value) => {
    this.setState({ dadosTrimestre: value });
  }

  getNotasPorEtapa = async () => {
    try {
      let idAnoLetivo = await this.getDadosAnoLetivo();

      var parametros = { ano: idAnoLetivo, grade: this.state.idGrade, turma: this.state.idTurma };

      const response = await getApi(`NotasPorEtapa/${JSON.stringify(parametros)}`);

      this.setNotasPorEtapa(response.result);
    } catch (e) {
      console.log(e);
    }
  }

  setEtapaEncerrada = (value) => {
    this.setState({ etapaEncerrada: value });
  }

  getEtapaEncerrada = async () => {
    try {
      const response = await getApi(`EtapaEncerrada/${this.state.idAnoLetivo}/${this.state.idGrade}/${this.state.idTurma}/${this.state.periodo + 1}`);

      this.setEtapaEncerrada(response.result);
    } catch (error) {

    }
  }

  setModalVisible(visible, buscar) {
    this.setState({ modalVisible: visible });

    if (buscar === true) {
      this.getFormaAvaliacao();
    }
  }

  salvarFiltro = async () => {

    await salvarStorage('dadosFiltro', {
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
        nomeTurma: dadosFiltro.arrayTurma[dadosFiltro.indexTurma].CSI_NOMTUR,
        turmas: dadosFiltro.arrayTurma,

        indexDisciplina: dadosFiltro.indexDisciplina,
        idGrade: dadosFiltro.arrayDisciplina[dadosFiltro.indexDisciplina].CSI_CODGRA,
        nomeDisciplina: dadosFiltro.arrayDisciplina[dadosFiltro.indexDisciplina].DISCIPLINA,
        disciplinas: dadosFiltro.arrayDisciplina,
      });

    }
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
      var parametros = { codigo: codigo, usuario: this.state.idUser };

      const response = await getApi(`ExcluirFormacao/${JSON.stringify(parametros)}`);

      let resultado = response.result;

      if (resultado === 1) {
        this.setState({ formaAvaliacoes: '' });
        this.mensagem('Success', 'Atenção', 'Avaliação Excluida com Sucesso!', this.getFormaAvaliacao());
      } else {
        this.mensagem('Danger', 'Atenção', 'Erro ao Excluir Avaliação!', null);
      }

    } catch (e) {
      console.log(e);
    }
  }

  editarRegistro = (codigo) => {
    const { navigate } = this.props.navigation;
    navigate('CadastrarFormaAvaliacao', {
      grade: this.state.idGrade, escola: this.state.idEscola,
      ano: this.state.idAnoLetivo, turma: this.state.idTurma,
      etapa: this.state.periodo + 1, anoTexto: this.state.anoTexto,
      usuario: this.state.idUser,
      id: codigo,
      editando: true
    });
  }

  incluirRegistro = () => {
    const { navigate } = this.props.navigation;
    navigate('CadastrarFormaAvaliacao', {
      grade: this.state.idGrade, escola: this.state.idEscola,
      ano: this.state.idAnoLetivo, turma: this.state.idTurma,
      etapa: this.state.periodo + 1, anoTexto: this.state.anoTexto,
      usuario: this.state.idUser,
      id: '',
      editando: false
    });
  }

  lancarNotas = (codigo, nome) => {
    const { navigate } = this.props.navigation;

    navigate('Notas', {
      grade: this.state.idGrade, turma: this.state.idTurma,
      periodo: this.state.periodo, avaliacao: codigo,
      lancarNotasPelaAvaliacao: true, nomeTurma: this.state.nomeTurma,
      etapaEncerrada: this.state.etapaEncerrada, nomeAvaliacao: nome,
      nomePeriodo: this.state.nomePeriodo, usuario: this.state.idUser,
      nomeDisciplina: this.state.nomeDisciplina, lancarNotasPelaAvaliacao: true
    });
  }

  render() {
    return (
      <StyleProvider style={getTheme(material)}>
        <Container>
          <NavigationEvents onWillFocus={() => {
            this.getFormaAvaliacao();
          }} />
          <Header>
            <Left>
              <Button transparent onPress={() => { this.props.navigation.navigate('Menu'); }} >
                <Icon name='arrow-back' />
              </Button>
            </Left>

            <Body>
              <Title>Forma</Title>
              <Subtitle>de Avaliação</Subtitle>
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
                <Button iconLeft small rounded onPress={() => this.getFormaAvaliacao()}>
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
              onShow={() => {this.buscarFiltro();}}
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
                  <Title>Filtros Forma</Title>
                  <Subtitle>de Avaliação</Subtitle>
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
                        Selecione uma Periodo
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
                  <Text style={styles.textAvaliacaoStyle}>{this.state.nomePeriodo}</Text>
                </View>
              }

              <List>
                <ScrollView>
                  <FlatList
                    data={this.state.formaAvaliacoes}
                    keyExtractor={(item, index) => item.CODIGO_NOTA}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      // <DeckSwiper
                      //     dataSource={this.state.formaAvaliacoes}
                      //     renderItem={item =>
                      <Card transparent style={{ elevation: 3 }}>
                        <CardItem>
                          <Left>
                            <Text style={styles.textoTrimestre}>Data: {item.DATA}</Text>
                          </Left>

                          <Right>
                            <Text style={styles.textNotas}>Letivo:
                          <Icone name={item.LETIVO === 'True' ? "md-checkmark-circle" : "md-checkmark-circle-outline"}
                                color={item.LETIVO === 'True' ? '#2E8B57' : '#FF4500'}
                                style={{ fontSize: 12 }} />
                            </Text>
                          </Right>
                        </CardItem>

                        <CardItem>
                          <Body>
                            <Text style={styles.textNotas}>Descrição: {item.DESCRICAO} - Valor: {item.VALOR}</Text>
                            <Text style={styles.textNotas}>Tipo: {tiposAvaliacao[item.TIPO - 1]}</Text>
                          </Body>
                        </CardItem>

                        {
                          this.state.etapaEncerrada === false &&
                          <CardItem>
                            <Left>
                              <Button iconLeft small rounded info onPress={() => this.editarRegistro(item.CODIGO_NOTA)}>
                                <Icon name="md-create" />
                                <Text style={stylesPadrao.styleTextoBranco}>Editar</Text>
                              </Button>
                            </Left>

                            <Body>
                              <Button iconLeft small rounded info onPress={() => Alert.alert('Atenção', 'Deseja Excluir Avaliação?',
                                [
                                  { text: 'Não', style: 'cancel', },
                                  { text: 'Sim', onPress: () => this.deletarRegistro(item.CODIGO_DIA) },
                                ],
                                { cancelable: false },
                              )}>
                                <Icon name="md-trash" />
                                <Text style={stylesPadrao.styleTextoBranco}>Excluir</Text>
                              </Button>
                            </Body>

                            <Right>
                              <Button iconLeft small rounded info onPress={() => this.lancarNotas(item.CODIGO_NOTA, `${item.DESCRICAO} - Valor:${item.VALOR}`)}>
                                <Icon name="albums" />
                                <Text style={stylesPadrao.styleTextoBranco}>Notas</Text>
                              </Button>
                            </Right>
                          </CardItem>
                        }

                      </Card>
                      //     }
                      // />

                    )}
                  />
                </ScrollView>
              </List>

              {
                this.state.formaAvaliacoes.length === 0 &&
                <SemRegistro texto={'Nenhum Registro Encontrado.\nPara buscar os registros clique em filtro!'} />
              }
            </View>
          }
          {/* Fim Lista com as Formas de Avaliação */}

          {/* Lista com os Dados do trimestre */}
          {
            (this.state.dadosTrimestre.length !== 0) &&
            <List>
              <View style={styles.containerTituloDetalhesAvaliacao}>
                <View style={styles.containerStyloTituloDetalhesAvaliacao}>
                  <Text style={styles.textoTituloDetalhesAvaliacao}>.: Informações dos Trimestres</Text>
                </View>
              </View>

              <ScrollView>
                <FlatList
                  data={this.state.dadosTrimestre}
                  horizontal={true}
                  renderItem={({ item }) => (

                    <View style={styles.containerDetalhesAvaliacao}>

                      <View style={styles.containerItensDetalhesAvaliacao}>
                        <Card transparent>
                          {/* <CardItem>
                               <Text style={styles.textoDetalhesAvaliacao}>{item.DESCRICAOETAPA}</Text>
                              </CardItem> */}

                          <CardItem>
                            <Left>
                              <Text style={styles.textoTrimestre}>{item.DESCRICAOETAPA}</Text>
                              <Body>
                                <Text style={styles.textoDetalhesAvaliacao}>Nota Maxima: {item.NOTABIMESTRE}</Text>
                                <Text style={styles.textoDetalhesAvaliacao}>Nota a Distribuir: {item.NOTADISRTIBUIR}</Text>
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
          {/* Fim Lista com os Dados do trimestre */}

        </Container>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  containerDetalhesAvaliacao: {
    flex: 2, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'stretch'
  },
  containerItensDetalhesAvaliacao: {
    flex: 1,
    borderRadius: 4, borderWidth: 0.5, borderColor: '#123751',
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 8
  },
  textoDetalhesAvaliacao: {
    fontSize: 12, fontWeight: '500'
  },
  textoTrimestre: {
    fontSize: 12, fontWeight: '500', color: '#123751'
  },
  containerTituloDetalhesAvaliacao: {
    flex: 1, flexDirection: 'column', justifyContent: 'center',
    alignItems: 'stretch'
  },
  containerStyloTituloDetalhesAvaliacao: {
    height: 30, backgroundColor: '#123751',
    borderRadius: 4, borderWidth: 0.5, borderColor: '#d6d7da',
    marginLeft: 5, marginRight: 5
  },
  textoTituloDetalhesAvaliacao: {
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
    // color: "white" 
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
    // padding: 20
    // backgroundColor: 'skyblue'
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
    fontSize: 10
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