import React, { Component } from 'react';

import { DrawerActions, NavigationEvents } from 'react-navigation';

import {
  Accordion, ActionSheet, Container, CheckBox, DatePicker,
  Header, Left, Body,
  StyleProvider, Button,
  Icon, Title,
  Content, List, ListItem,
  Text, Right, Thumbnail,
  Form, Item, Picker, Label, Input, Subtitle
} from 'native-base';

import {
  DatePickerAndroid, Modal, StyleSheet, View, FlatList, ScrollView, RefreshControl,
  TouchableHighlight, TouchableOpacity, Alert
} from 'react-native';

import { Root, Popup } from 'popup-ui';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import Icone from "react-native-vector-icons/Ionicons";

import Load from '../../componentes/load';
import Loader from '../../componentes/loader';
import SemRegistro from '../../componentes/semregistro';
import { getApi } from '../../services/api';
import {
  getValidaEtapaEncerrada, getAulasProfessor,
  getDisciplinasProfessor, getTurmasProfessor,
  getFrequenciaTurma, SalvarFaltas
} from '../../services/rest';

import { stylesPadrao } from '../../style/style';

import { format } from 'date-fns';

import {
  setRegistroStorage,
  getRegistroStorage,
  salvarStorage,
  buscarStorage
} from '../../services/storage';

import Aluno from './img/boy.png';
import Aluna from './img/girl.png';

import { Constantes } from '../../classes/constantes';

let constPeriodos = new Constantes();

var periodos = constPeriodos.periodos(4);

export default class Frequencias extends Component {
  static navigationOptions = {
    title: 'Frequências',
    headerStyle: { backgroundColor: "#123751" },
    headerTintColor: "#FFF"
  }

  constructor(props) {
    super(props);

    this.state = {
      chosenDate: `${new Date().getUTCDate()}.${new Date().getUTCMonth() + 1}.${new Date().getUTCFullYear()}`,
      androidDate: `${new Date().getUTCDate()}/${new Date().getUTCMonth() + 1}/${new Date().getUTCFullYear()}`,
      value: 50,
      indexTurma: '',
      indexDisciplina: '',
      idGrade: '',
      idTurma: '',
      idSerie: '',
      idAnoLetivo: '',
      idProf: '',
      idEscola: '',
      idUser: '',
      periodo: '',
      nomePeriodo: '',
      turmas: [],
      nomeTurma: '',
      disciplinas: [],
      nomeDisciplina: '',
      alunos: [],
      aulas: [],
      nomeAula: '',
      indexAula: '',
      idAula: '',
      etapaEncerrada: false,
      exibirBotao: false,
      modalVisible: false,
      carregando: false,
      refreshing: false,
      salvando: false,
      modalSalvando: false,
      searchInput: '',
      buscando: false,
      textoBuscando: ''
    };
  }

  limparFiltros = () => {
    this.setState({
      etapaEncerrada: false,
      exibirBotao: false,
      indexTurma: '',
      idTurma: '',
      idSerie: '',
      nomeTurma: '',
      periodo: '',
      nomePeriodo: '',
      indexAula: '',
      idAula: '',
      nomeAula: '',
      indexDisciplina: '',
      idGrade: '',
      nomeDisciplina: '',
      alunos: [],
      aulas: [],
      disciplinas: []
    });
  }

  componentDidMount() {
    if (this.state.alunos.length === 0) {
      this.setModalVisible(!this.state.modalVisible, false);
    }
  }

  mensagemPopup = (titulo, texto, tipo) => {
    Popup.show({
      type: tipo,
      title: titulo,
      button: false,
      textBody: texto,
      buttontext: 'Ok',
      callback: () => Popup.hide()
    });
  }

  setDate = async (newDate, newDateNormal) => {
    await this.setState({
      chosenDate: newDate,
      androidDate: newDateNormal,
      indexAula: '',
      idAula: '',
      nomeAula: '',
      aulas: []
    });
  }

  setDateAndroid = async () => {
    try {
      const { action, year, month, day, } = await DatePickerAndroid.open({ date: new Date() });

      if (action !== DatePickerAndroid.dismissedAction) {
        await this.setDate(`${day}.${month + 1}.${year}`, `${day}/${month + 1}/${year}`);

        await this.getAulas();
      }

    } catch ({ code, message }) {
      console.warn('Não é possível abrir o seletor de datas', message);
    }
  };

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

  setModalVisible(visible, buscar) {
    this.setState({ modalVisible: visible });

    if (buscar === true) {
      this.getAlunos();
    } else if (visible === true) {
      if (this.state.turmas.length === 0) {
        this.getTurmas();
      }
    }
  }

  onValueChangeIdTurma = async (value) => {
    await this.setState({
      indexTurma: value,
      idTurma: this.state.turmas[value].CSI_CODTUR,
      nomeTurma: this.state.turmas[value].CSI_NOMTUR,
      idSerie: this.state.turmas[value].CSI_CODSER,
      falta: false,
      disciplinas: [],
      nomeDisciplina: '',
      indexDisciplina: '',
      idGrade: '',
      aulas: [],
      nomeAula: '',
      indexAula: ''
    });

    this.getDisciplinas();
  }

  onValueChangeIdDisciplina = async (value) => {
    await this.setState({
      indexDisciplina: value,
      idGrade: this.state.disciplinas[value].CSI_CODGRA,
      nomeDisciplina: this.state.disciplinas[value].DISCIPLINA,
      aulas: [],
      nomeAula: '',
      indexAula: ''
    });

    if (this.state.aulas.length === 0 || this.state.chosenDate !== '') {
      await this.getAulas();
    }
  }

  onValueChangeIndexAula = (value) => {
    this.setState({
      indexAula: value,
      idAula: this.state.aulas[value].id_dia,
      nomeAula: this.state.aulas[value].aula
    });
  }

  onValueChangePeriodo = async (value) => {
    await this.setState({
      periodo: value,
      nomePeriodo: periodos[value]
    });
  }

  setFalta = (text, item) => {
    let registros = [];

    registros = this.state.alunos;

    let idx = registros.indexOf(item);

    const valor = text === 0 ? 1 : 0;

    registros[idx].presenca = valor;

    this.setState({ alunos: registros });
  }

  //Busca Dados da Escola Selecionada
  setIdEscola = (value) => {
    this.setState({ idEscola: value });
  }

  getDadosEscola = async () => {
    const infoEscola = await getRegistroStorage('dadosescola')

    if (infoEscola) {
      const { CODIGO } = infoEscola;
      this.setIdEscola(CODIGO);

      return CODIGO;
    }
  }

  //Busca Dados do Ano Letivo
  setIdAnoLetivo = (value) => {
    this.setState({ idAnoLetivo: value });
  }

  getDadosAnoLetivo = async () => {
    const infoAnoLetivo = await getRegistroStorage('dadosanoletivo');

    if (infoAnoLetivo) {
      const { ID } = infoAnoLetivo;

      this.setIdAnoLetivo(ID);

      return ID;
    }
  }

  setIdProf = (value) => {
    this.setState({ idProf: value });
  }

  setIdUsuario = (value) => {
    this.setState({ idUser: value });
  }

  getDadosUsuario = async () => {
    const infoUsuario = await getRegistroStorage('dadosusuario');

    if (infoUsuario) {
      const { ID_PROF, ID } = infoUsuario;

      this.setIdProf(ID_PROF);
      this.setIdUsuario(ID);

      return ID_PROF;
    }
  }

  setAulas = (value) => {
    this.setState({ aulas: value });
  }

  getAulas = async () => {
    try {
      this.setState({ buscando: true, textoBuscando: 'Carregando Aulas' });

      var parametros = {
        grade: this.state.idGrade,
        turma: this.state.idTurma,
        ano: this.state.idAnoLetivo,
        data: this.state.chosenDate
      };

      if (this.state.idGrade !== null && this.state.idTurma !== null) {

        const response = await getAulasProfessor(parametros);

        const { aula } = response[0];

        if (aula !== '0') {
          this.setAulas(response);
        } else {
          Alert.alert('Atenção', 'Nenhuma Aula Registrada para este dia');
        }

      } else {
        Alert.alert('Atenção', 'Selecione os itens acima!');
      }

    } catch (e) {
      console.log(e);
    }
    this.setState({ buscando: false, textoBuscando: '' });
  }

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
        // const response = await getApi(`TurmasProf/${JSON.stringify(parametros)}`);

        const response = await getTurmasProfessor(parametros);

        this.setTurmas(response);
      }
    }
    catch (e) {
      console.log(e);
    }

    this.setState({ buscando: false, textoBuscando: '' });
  }

  setDisciplinas = (value) => {
    this.setState({ disciplinas: value });
  }

  getDisciplinas = async () => {
    try {

      if (this.state.chosenDate !== null) {

        this.setState({ buscando: true, textoBuscando: 'Carregando Disciplinas' });

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

  setAlunos = (value) => {
    this.setState({ alunos: value, exibirBotao: true });
  }

  getAlunos = async () => {
    try {

      if (this.state.nomeTurma === '' || this.state.nomeDisciplina === '' ||
        this.state.nomeAula === '') {
        this.mensagem('Warning', 'Atenção', 'Preencha todos os campos da tela de filtro!', null); 
      } else {
        if (this.state.aulas.length > 0) {
          this.setState({ carregando: true });

          this.setAlunos();

          let dataFormatada = this.state.chosenDate;
          let aulaSelecionada = parseInt(this.state.indexAula + 1);
          let valorAula = 0;

          if ((Number.isInteger(aulaSelecionada) === true) && (parseInt(aulaSelecionada) >= 0)) {
            valorAula = parseInt(aulaSelecionada);
          } else {
            valorAula = 1;
          }

          var parametros = {
            grade: this.state.idGrade,
            turma: this.state.idTurma,
            ano: this.state.idAnoLetivo,
            data: dataFormatada,
            aula: valorAula
          };

          const response = await getFrequenciaTurma(parametros);

          const { matricula } = response[0];

          if (matricula !== '0') {
            await this.setAlunos(response);
            await this.salvarFiltro();
            await this.getEtapaEncerrada();
          } else {
            this.mensagem('Warning', 'Atenção', 'Nenhuma Aula Registrada para este dia!', null);
          }

          this.setState({ carregando: false });
        } else {
          this.mensagem('Warning', 'Atenção', 'Nenhuma Aula Registrada para este dia!', null);
          this.setState({ carregando: false });
        }
      }

    } catch (error) {
      this.mensagem('Warning', 'Atenção', 'Erro ao buscar registros, verifique sua conexão ou tente novamente!', null);
    }
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getAlunos().then(() => {
      this.setState({ refreshing: false });
    });
  }

  onClose = async () => {
    await this.setModalVisible(!this.state.modalVisible, false);
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

      await this.getAulas();

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

  controleTela = async () => {
    const filtro = await this.buscarFiltro();

    if (this.state.alunosPorAvaliacao.length === 0 && this.state.alunos.length === 0) {
      this.setModalVisible(!this.state.modalVisible, false);
    }
  }

  salvarFrequencias = async () => {
    try {
      let erro = false;

      this.setState({ buscando: true, textoBuscando: 'Salvando Frequências.' });

      for (var i = 0, l = this.state.alunos.length; i < l; i++) {
        const arrayAvaliacoes = {
          matricula: this.state.alunos[i].matricula,
          aula: this.state.indexAula + 1,
          presenca: this.state.alunos[i].presenca,
          id_user: this.state.idUser,
          id_user_edit: this.state.idUser,
          id_dia: this.state.aulas[this.state.indexAula].id_dia
        }

        const response = await SalvarFaltas(arrayAvaliacoes);

        if (response <= 0) {
          erro = true;
        }
      }

      this.setState({ buscando: false, textoBuscando: '' });

      if (erro === false) {
        this.mensagem('Success', 'Atenção', 'Registro Salvo com Sucesso!', this.onClose());
      } else if (erro === true) {
        this.mensagem('Danger', 'Atenção', 'Erro ao Salvar Registros', Popup.hide());
      }

    } catch (e) {
      console.log(e);
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

  render() {
    return (
      <StyleProvider style={getTheme(material)}>
        <Container>
          <NavigationEvents onWillFocus={() => { this.controleTela(); }} />
          <Header>

            <Left>
              <Button transparent onPress={() => { this.props.navigation.navigate('Menu'); }} >
                <Icon name='arrow-back' />
              </Button>
            </Left>

            <Body>
              <Title>Registro</Title>
              <Subtitle>de Frequências</Subtitle>
            </Body>

            <Right>
              <Button transparent onPress={() => {
                this.setModalVisible(!this.state.modalVisible, false)
              }}>
                <Icone name='md-funnel'
                  size={28}
                  color={'#FFF'} />
                <Text style={styles.textTurma}>Filtro</Text>
              </Button>
            </Right>

          </Header>

          <Header searchBar rounded>
            <Item>

              <Input placeholder="Buscar"
                onChangeText={(searchInput) => this.setState({ searchInput: searchInput.toLocaleUpperCase() })}
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
                  <Button transparent onPress={() => this.setModalVisible(false, false)}>
                    <Icon name='arrow-back' />
                    <Text style={styles.textTurma}>
                      Voltar
                        </Text>
                  </Button>
                </Left>

                <Body>
                  <Title>Filtros</Title>
                  <Subtitle>Frequência</Subtitle>
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
                <View>
                  <View style={stylesPadrao.styleViewFiltro}>
                    <Label note numberOfLines={1}>Data:</Label>
                    <Button style={stylesPadrao.styleCampoFiltro} bordered dark onPress={() => this.setDateAndroid()}>
                      <View>
                        <Text>
                          {this.state.androidDate}
                        </Text>
                      </View>
                    </Button>
                  </View>
                </View>

                {
                  this.state.turmas.length > 0 &&
                  <View>
                    <View style={stylesPadrao.styleViewFiltro}>
                      <Label note numberOfLines={1}>Turmas:</Label>
                      <Button style={stylesPadrao.styleCampoFiltro} bordered dark
                        onPress={() =>
                          ActionSheet.show(
                            {
                              options:
                                this.state.turmas.map((item, index) => {
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
                          <Text style={styles.textDescricaoStyle}>
                            Selecione uma turma
                        </Text>
                        }
                        {
                          this.state.nomeTurma !== '' &&
                          <Text style={styles.textDescricaoStyle}>
                            Turma: {this.state.nomeTurma}
                          </Text>
                        }
                      </Button>


                    </View>
                  </View>
                }

                <View>
                  <View style={stylesPadrao.styleViewFiltro}>
                    <Label note numberOfLines={1}>Periodos:</Label>
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
                        <Text style={styles.textDescricaoStyle}>
                          Selecione uma Periodo
                          </Text>
                      }
                      {
                        this.state.nomePeriodo !== '' &&
                        <Text style={styles.textDescricaoStyle}>
                          Periodo: {this.state.nomePeriodo}
                        </Text>
                      }
                    </Button>

                  </View>
                </View>


                {
                  this.state.disciplinas.length > 0 &&
                  <View>
                    <View style={stylesPadrao.styleViewFiltro}>
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
                          <Text style={styles.textDescricaoStyle}>
                            Selecione uma disciplina
                                  </Text>
                        }
                        {
                          this.state.nomeDisciplina !== '' &&
                          <Text style={styles.textDescricaoStyle}>
                            Disciplina: {this.state.nomeDisciplina}
                          </Text>
                        }
                      </Button>

                    </View>
                  </View>
                }


                {this.state.aulas.length > 0 &&
                  <View>
                    <View style={stylesPadrao.styleViewFiltro}>
                      <Label note numberOfLines={1}>Aulas:</Label>
                      <Button style={stylesPadrao.styleCampoFiltro} bordered dark
                        onPress={() =>
                          ActionSheet.show(
                            {
                              options:
                                this.state.aulas.map((item, index) => {
                                  return item.aula
                                }),
                              title: "Aulas"
                            },
                            buttonIndex => {
                              this.onValueChangeIndexAula(buttonIndex)
                            }
                          )}
                      >
                        {
                          this.state.nomeAula === '' &&
                          <Text style={styles.textDescricaoStyle}>
                            Selecione uma Aula
                              </Text>
                        }
                        {
                          this.state.nomeAula !== '' &&
                          <Text style={styles.textDescricaoStyle}>
                            {this.state.nomeAula}
                          </Text>
                        }

                      </Button>

                    </View>
                  </View>
                }

              </Form>

              <Button block info style={stylesPadrao.styleButtonBuscar}
                onPress={() => this.setModalVisible(false, true)}>
                <Text>Buscar</Text>
              </Button>

            </Modal>
          </View>

          {
            this.state.salvando &&
            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.modalSalvando}
              onRequestClose={() => {
                Alert.alert('Clique em Sair para fechar esta tela.');
              }}>
              <Load texto={'Aguarde Salvando as Frequências..'} />
            </Modal>
          }

          {/* <Popup /> */}
          <Loader loading={this.state.buscando} texto={this.state.textoBuscando} />

          {

            this.state.carregando &&
            <Load texto={'Aguarde Carregando os registros..'} />

          }
          {
            !this.state.carregando &&

            <View style={styles.containerList}>

              {
                this.state.nomeTurma !== '' &&
                <View style={styles.conteinerTurma}>
                  <Text style={styles.textTurma}>{this.state.nomeTurma}</Text>
                </View>
              }
              {
                this.state.etapaEncerrada === true &&
                <View style={styles.conteinerTurma}>
                  <Text style={stylesPadrao.styleTextoBranco}>Diário: Encerrado</Text>
                </View>
              }
              {
                this.state.nomeDisciplina !== '' &&
                <View style={styles.conteinerTurma}>
                  <Text style={stylesPadrao.styleTextoBranco}>Disciplina: {this.state.nomeDisciplina}</Text>
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
                    data={this.state.alunos.filter(item => item.aluno.toLocaleUpperCase().includes(this.state.searchInput))}
                    renderItem={({ item, index }) => (
                      <ListItem thumbnail>

                        <Left>
                          <Thumbnail square source={item.sexo === 'Masculino' ? Aluno : Aluna} />
                        </Left>

                        <Body>
                          <Text style={styles.textList}>{item.aluno}</Text>
                          <Text note numberOfLines={1} style={styles.textList}>{item.situacao}</Text>
                        </Body>

                        <Right>
                          {
                            this.state.etapaEncerrada === false &&
                            <TouchableOpacity onPress={() => this.setFalta(item.presenca, item)}>
                              <Icone name={item.presenca == 1 ? 'md-square-outline' : 'md-checkbox'}
                                size={30}
                                color={item.presenca == 1 ? '#FF4500' : '#2E8B57'} />
                            </TouchableOpacity>
                          }
                          {
                            this.state.etapaEncerrada === true &&
                            <TouchableOpacity disabled onPress={() => this.setFalta(item.presenca, item)}>
                              <Icone name={item.presenca == 1 ? 'md-square-outline' : 'md-checkbox'}
                                size={30}
                                color={item.presenca == 1 ? '#FF4500' : '#2E8B57'} />
                            </TouchableOpacity>
                          }

                        </Right>
                      </ListItem>
                    )}

                    extraData={this.state}
                  />

                  {/* { this.state.alunos.length > 0 &&
                    <Button block success style={styles.buttonSalvar}
                     onPress={() => this.salvarFrequencias()}>
                     <Text>Salvar</Text>
                    </Button>
                  }  */}


                </ScrollView>

              </List>

              {
                this.state.alunos.length === 0 &&
                <SemRegistro texto={'Nenhum Registro Encontrado.\nPara buscar os registros clique em filtro!'} />
              }
            </View>

          }

          {
            (this.state.exibirBotao === true && this.state.etapaEncerrada === false) &&
            <View style={styles.containerSalvar}>
              <View style={styles.bottonsItens}>
                <Button block success style={styles.buttonSalvar}
                  onPress={() => this.salvarFrequencias()}>
                  <Text>Salvar</Text>
                </Button>
              </View>

              <View style={styles.bottonsItens}>
                <Button block danger
                  style={{ marginLeft: 10, marginRight: 10 }}
                  onPress={() => this.limparFiltros()}>
                  <Text>Cancelar</Text>
                </Button>
              </View>
            </View>
          }

        </Container>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  buttonSalvar: {
    marginLeft: 10,
    marginRight: 10
  },
  containerSalvar: {
    flex: 1, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'stretch',
  },
  bottonsItens: {
    flex: 1, width: 120, height: 100,
    marginLeft: 5, marginRight: 5
  },
  inputIcon: {
    position: 'absolute',
    top: -1,
    left: 9
  },
  containerList: {
    flex: 9,
    marginBottom: 50
  },
  textStyle: {
    // color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
    opacity: 0.5
  },
  textList: {
    fontSize: 10,
    fontWeight: '500'
  },
  textDescricaoStyle: {
    fontSize: 12,
    fontWeight: '500',
    // marginBottom: 10,
    // opacity: 0.5
  },
  conteinerTurma: {
    alignItems: 'center',
    backgroundColor: '#123751'
  },
  textTurma: {
    color: "white",
  },
  styleCampoFiltro: {
    width: 260, height: 30
  }
});