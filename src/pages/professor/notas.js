import React, { Component } from 'react';

import { DrawerActions, NavigationEvents } from 'react-navigation';

import {
  ActionSheet, Container,
  Header, Left, Card, CardItem, Body, Badge,
  StyleProvider, Button,
  Icon, Title,
  Content, List, ListItem,
  Text, Right, Thumbnail, Toast,
  Form, Item, Picker, Label, Input, Spinner, Subtitle
} from 'native-base';

import {
  Modal, View, Alert, StyleSheet, ScrollView, TextInput,
  RefreshControl, Dimensions, TouchableOpacity, FlatList
} from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import { stylesPadrao } from '../../style/style';
import { getApi } from '../../services/api';
import Load from '../../componentes/load';
import Loader from '../../componentes/loader';
import SemRegistro from '../../componentes/semregistro';

import AsyncStorage from '@react-native-community/async-storage';

import {
  setRegistroStorage,
  getRegistroStorage,
  salvarStorage,
  buscarStorage
} from '../../services/storage';

import Icone from "react-native-vector-icons/Ionicons";

import Aluno from './img/boy.png';
import Aluna from './img/girl.png';

import { Root, Popup } from 'popup-ui';

import { Constantes } from '../../classes/constantes';

let constPeriodos = new Constantes();

const { height: HEIGHT } = Dimensions.get('window');

var periodos = constPeriodos.periodos(4);

export default class Notas extends Component {
  static navigationOptions = {
    title: 'Notas',
    headerStyle: { backgroundColor: "#123751" },
    headerTintColor: "#FFF"
  }

  constructor(props) {
    super(props);

    this.state = {
      indexTurma: '',
      idTurma: this.props.navigation.getParam('turma'),
      idSerie: '',
      periodo: this.props.navigation.getParam('periodo'),
      nomePeriodo: this.props.navigation.getParam('nomePeriodo'),
      idAnoLetivo: '',
      idProf: '',
      idEscola: '',
      idUser: this.props.navigation.getParam('usuario'),
      turmas: [],
      nomeTurma: this.props.navigation.getParam('nomeTurma'),
      alunos: [],
      avaliacoes: [],
      indexAvaliacao: '',
      idAvaliacao: this.props.navigation.getParam('avaliacao'),
      nomeAvaliacao: this.props.navigation.getParam('nomeAvaliacao'),
      idGrade: this.props.navigation.getParam('grade'),
      indexDisciplina: '',
      disciplinas: [],
      nomeDisciplina: this.props.navigation.getParam('nomeDisciplina'),
      alunosPorAvaliacao: [],
      etapaEncerrada: this.props.navigation.getParam('etapaEncerrada'),
      refreshing: false,
      modalVisible: false,
      salvando: false,
      modalSalvando: false,
      buscando: false,
      textoBuscando: '',
      searchInput: '',
      lancarNotasPelaAvaliacao: this.props.navigation.getParam('lancarNotasPelaAvaliacao')
    };

  }

  limparFiltros = () => {
    this.setState({
      etapaEncerrada: false,
      lancarNotasPelaAvaliacao: false,
      indexTurma: '',
      idTurma: '',
      idSerie: '',
      nomeTurma: '',
      periodo: '',
      nomePeriodo: '',
      indexAvaliacao: '',
      idAvaliacao: '',
      nomeAvaliacao: '',
      indexDisciplina: '',
      idGrade: '',
      nomeDisciplina: '',
      alunos: [],
      avaliacoes: [],
      disciplinas: [],
      alunosPorAvaliacao: [],
      filtro: ''
    });
  }

  ValidaUsoTela = async () => {
    if (this.state.lancarNotasPelaAvaliacao === true) {
      this.getAlunosPorAvaliacao();
    } else {
      
      const filtro = await this.buscarFiltro();
      
      if (filtro === false) {
        await this.setState({  alunosPorAvaliacao: [] });
      }

      if (this.state.alunosPorAvaliacao.length === 0 && this.state.alunos.length === 0) {
        this.setModalVisible(!this.state.modalVisible, false);
      }
    }
  }

  onClose = async () => {
    if (this.state.lancarNotasPelaAvaliacao === true) {
      await this.limparFiltros();
    }
    await this.setModalVisible(!this.state.modalVisible, false);
  }

  // Bloco de Funções de notas por avaliação
  salvarNotas = async () => {
    let registros = [];
    let erro = false;

    this.setState({ buscando: true, textoBuscando: 'Salvando Notas.' });

    for (var i = 0, l = this.state.alunosPorAvaliacao.length; i < l; i++) {
      const arrayAvaliacoes = {
        id_user: this.state.idUser,
        id_nota: this.state.alunosPorAvaliacao[i].ID,
        matricula: this.state.alunosPorAvaliacao[i].CSI_MATALU,
        nota: this.state.alunosPorAvaliacao[i].NOTA === '' ? 0 : this.state.alunosPorAvaliacao[i].NOTA,
        id: this.state.alunosPorAvaliacao[i].CODNOTA
      }

      const response = await getApi(`SalvarNotas/${JSON.stringify(arrayAvaliacoes)}`);

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
  }

  editarNota = (text, item) => {
    let idx = this.state.alunosPorAvaliacao.indexOf(item);

    if (parseFloat(text) > parseFloat(this.state.alunosPorAvaliacao[idx].VALOR)) {
      this.mensagem('Warning', 'Atenção', 'Valor Informado não pode ser maior que a nota totla da avaliação!', null);
    } else {
      this.state.alunosPorAvaliacao[idx].NOTA = text.toString().replace(".", ",");
    }

  }

  setAlunosPorAvaliacao = (value) => {
    this.setState({ alunosPorAvaliacao: value });
  }

  getAlunosPorAvaliacao = async () => {
    try {
      var parametros = {
        turma: this.state.idTurma,
        grade: this.state.idGrade,
        matricula: '0',
        etapa: this.state.periodo + 1,
        avaliacao: this.state.idAvaliacao
      };

      if (parametros !== null) {
        this.setState({ carregando: true });

        const response = await getApi(`ListAvaliacoesAluno/${JSON.stringify(parametros)}`);

        await this.setAlunosPorAvaliacao(response.result);

        await this.salvarFiltro();

        await this.getEtapaEncerrada();

        this.setState({ carregando: false });

        if (this.state.alunosPorAvaliacao.length <= 0) {
          await this.limparFiltros();
          this.mensagem('Warning', 'Atenção', 'Nenhum Registro Encontrado!', null);
        }
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  // Fim de Funções de notas por avaliações

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
      if (this.state.etapaEncerrada === false && this.state.idAvaliacao === '') {
        this.mensagem('Warning', 'Atenção', 'Favor Informe os demais dados do filtro!', null);
      } else if (this.state.idAvaliacao === '') {
        this.getAlunos(false);
      } else {
        this.getAlunosPorAvaliacao();
      }
    }
  }

  onValueChangeIdTurma = async (value) => {
    await this.setState({
      indexTurma: value,
      idTurma: this.state.turmas[value].CSI_CODTUR,
      idSerie: this.state.turmas[value].CSI_CODSER,
      nomeTurma: this.state.turmas[value].CSI_NOMTUR,
      indexAvaliacao: '',
      idAvaliacao: '',
      nomeAvaliacao: '',
      indexDisciplina: '',
      idGrade: '',
      nomeDisciplina: '',
      avaliacoes: [],
      disciplinas: []
    });

    this.getDisciplinas();
  }

  onValueChangePeriodo = async (value) => {
    this.setState({
      periodo: value,
      nomePeriodo: periodos[value],
      indexTurma: '',
      idTurma: '',
      idSerie: '',
      nomeTurma: '',
      indexAvaliacao: '',
      idAvaliacao: '',
      nomeAvaliacao: '',
      indexDisciplina: '',
      idGrade: '',
      nomeDisciplina: '',
      alunos: [],
      avaliacoes: [],
      disciplinas: [],
      alunosPorAvaliacao: [],
    });

    await this.getTurmas();

    if (this.state.nomeDisciplina !== '') {
      await this.getAvaliacoes();
    }
  }

  onValueChangeIdAvaliacao = (value) => {
    this.setState({
      indexAvaliacao: value,
      idAvaliacao: this.state.avaliacoes[value].ID,
      nomeAvaliacao: this.state.avaliacoes[value].DESCRICAO + ' Valor: ' + this.state.avaliacoes[value].VALOR
    });
  }

  setAvaliacoes = (value) => {
    this.setState({ avaliacoes: value });
  }

  getAvaliacoes = async () => {
    try {

      if (this.state.periodo !== '') {

        this.setState({ buscando: true, textoBuscando: 'Carregando Avaliações' });

        var parametros = {
          turma: this.state.idTurma,
          grade: this.state.idGrade,
          etapa: this.state.periodo + 1
        };

        const response = await getApi(`ListaAvaliacoes/${JSON.stringify(parametros)}`);

        this.setAvaliacoes(response.result);
      } else {
        this.mensagem('Warning', 'Atenção', 'Favor Informe um periodo!', null);
      }

    } catch (e) {
      console.log(e);
    }

    this.setState({ buscando: false, textoBuscando: '' });
  }

  onValueChangeIdDisciplina = async (value) => {
    await this.setState({
      indexDisciplina: value,
      idGrade: this.state.disciplinas[value].CSI_CODGRA,
      nomeDisciplina: this.state.disciplinas[value].DISCIPLINA,
      indexAvaliacao: '',
      idAvaliacao: '',
      nomeAvaliacao: '',
      avaliacoes: []
    });

    this.getAvaliacoes();
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

  avaliacoesTurma(imagem) {
    const { navigate } = this.props.navigation;
    navigate('AvaliacaoTurma', {
      ano: this.state.idAnoLetivo,
      turma: this.state.idTurma,
      etapa: this.state.periodo,
      usuario: this.state.idUser,
      icone: imagem
    });
  }

  selecionar(codigo, aluno, imagem) {
    const { navigate } = this.props.navigation;
    navigate('NotasAluno', {
      id: codigo,
      nome: aluno,
      icone: imagem,
      serie: this.state.idSerie,
      escola: this.state.idEscola,
      ano: this.state.idAnoLetivo,
      professor: this.state.idProf,
      etapa: this.state.periodo + 1,
      turma: this.state.idTurma,
      usuario: this.state.idUser
    });
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
      const { ID_PROF, ID } = infoUsuario;

      this.setIdProf(ID_PROF);
      this.setIdUsuario(ID);

      return ID_PROF;
    }
  }

  setAlunos = (value) => {
    this.setState({ alunos: value });
  }

  getAlunos = async () => {
    try {

      if (this.state.nomeTurma === '' || this.state.nomePeriodo === '') {
        this.mensagem('Warning', 'Atenção', 'Preencha todos os campos da tela de filtro!', null);
      } else {
        this.setAlunos();

        this.setState({ carregando: true });

        var parametros = { turma: this.state.idTurma };

        if (this.state.idTurma !== null) {
          const response = await getApi(`ListaAlunosTurma/${JSON.stringify(parametros)}`);

          await this.setAlunos(response.result);

          await this.getEtapaEncerrada();

          this.setState({ carregando: false });
        }
      }
    }
    catch (e) {
      console.log(e);
    }
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

      await this.getAvaliacoes();

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

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getAlunos().then(() => {
      this.setState({ refreshing: false });
    });
  }

  notaNaMedia = (nota, total) => {
    // console.log(nota.toString().replace(",", ".") + ' ' + total.toString().replace(",", "."));
    var mediaAvaliacao = parseFloat(total) * 60 / 100;
    return parseFloat(nota) <= mediaAvaliacao ? false : true;
  }

  render() {
    return (
      <StyleProvider style={getTheme(material)}>
        <Container>
          <NavigationEvents onWillFocus={() => {
            this.ValidaUsoTela();
          }} />
          <Header>

            <Left>
              <Button transparent onPress={() => { this.props.navigation.navigate('Menu'); }} >
                <Icon name='arrow-back' />
              </Button>
            </Left>

            <Body>
              <Title>Notas</Title>
            </Body>

            <Right>
              {/* <Button transparent 
                          onPress={() => this.avaliacoesTurma()}>
                    <Icon name='folder' />
                  </Button> */}

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
                  <Button transparent onPress={() => this.setModalVisible(false, false)}>
                    <Icon name='arrow-back' />
                    <Text style={styles.textTurma}>
                      Voltar
                        </Text>
                  </Button>
                </Left>

                <Body>
                  <Title>Filtros Notas</Title>
                  <Subtitle>Notas</Subtitle>
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

              <Popup />
              <Form style={stylesPadrao.styleModalFiltro}>

                {/* <Loader loading={this.state.buscando} texto={this.state.textoBuscando} /> */}

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

                {
                  this.state.turmas.length > 0 &&
                  <View style={stylesPadrao.styleViewFiltro}>
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
                          Selecione uma Periodo
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

                {
                  this.state.avaliacoes.length > 0 &&
                  <View>
                    <View style={stylesPadrao.styleViewFiltro}>
                      <Label note numberOfLines={1}>Avaliações:</Label>
                      <Button style={stylesPadrao.styleCampoFiltro} bordered dark
                        onPress={() =>
                          ActionSheet.show(
                            {
                              options:
                                this.state.avaliacoes.map((item, index) => {
                                  return item.DESCRICAO
                                }),
                              title: "Avaliações"
                            },
                            buttonIndex => {
                              this.onValueChangeIdAvaliacao(buttonIndex)
                            }
                          )}
                      >
                        {
                          this.state.nomeAvaliacao === '' &&
                          <Text style={stylesPadrao.styleTexto}>
                            Selecione uma Avaliação
                            </Text>
                        }
                        {
                          this.state.nomeAvaliacao !== '' &&
                          <Text style={stylesPadrao.styleTexto}>
                            Avaliação: {this.state.nomeAvaliacao}
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
          
          <Loader loading={this.state.buscando} texto={this.state.textoBuscando} />

          {
            this.state.carregando &&
            <Load texto={'Aguarde Carregando os registros..'} />
          }

          {
            !this.state.carregando &&
            <View style={styles.containernotas}>
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
                this.state.nomeAvaliacao !== '' &&
                <View style={styles.conteinerTurma}>
                  <Text style={styles.textAvaliacaoStyle}>Avaliação: {this.state.nomeAvaliacao}</Text>
                </View>
              }
              {
                this.state.nomePeriodo !== '' &&

                <View style={styles.conteinerTurma}>
                  <Text style={stylesPadrao.styleTextoBranco}>{this.state.nomePeriodo}</Text>
                </View>
              }

              {
                this.state.idAvaliacao === '' &&
                <List>
                  <ScrollView refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={this._onRefresh} />}>

                    <FlatList
                      data={this.state.alunos.filter(item => item.CSI_NOMALU.toLocaleUpperCase().includes(this.state.searchInput))}
                      keyExtractor={(item, index) => item.CSI_MATALU}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <ListItem thumbnail>
                          <Left>
                            <Thumbnail square source={item.CSI_SEXALU === 'Masculino' ? Aluno : Aluna} />
                          </Left>
                          <Body>
                            <Text style={styles.textList}>{item.CSI_MATALU} - {item.CSI_NOMALU}</Text>
                            <Text note numberOfLines={1}
                              style={styles.textList}>{item.CSI_SITALU}(a)</Text>
                          </Body>
                          <Right>
                            <Button style={{ backgroundColor: "#007AFF" }}
                              onPress={() => this.selecionar(item.CSI_MATALU,
                                item.CSI_MATALU + ' - ' + item.CSI_NOMALU,
                                item.CSI_SEXALU === 'Masculino' ? Aluno : Aluna)}>
                              <Text style={styles.textList}>Visualizar</Text>
                            </Button>
                          </Right>
                        </ListItem>
                      )}
                    />

                  </ScrollView>
                </List>
              }
              {
                this.state.idAvaliacao !== '' &&
                <List>
                  <ScrollView>

                    <FlatList
                      data={this.state.alunosPorAvaliacao.filter(item => item.CSI_NOMALU.toLocaleUpperCase().includes(this.state.searchInput))}
                      keyExtractor={(item, index) => item.CSI_MATALU}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item, index }) => (
                        <ListItem thumbnail>
                          <Left>
                            <Thumbnail square source={item.CSI_SEXALU === 'Masculino' ? Aluno : Aluna} />
                          </Left>
                          <Body>
                            <Text style={styles.textList}>{item.CSI_MATALU} - {item.CSI_NOMALU}</Text>
                            {item.CSI_SITALU === 'RECEBIDO' &&
                              <Text note numberOfLines={1} style={styles.textList}>{`${item.CSI_SITALU}(A) - ${item.CSI_DATMAT}`}</Text>
                            }
                            {item.CSI_SITALU === 'TRANSFERIDO' &&
                              <Text note numberOfLines={1} style={styles.textList}>{`${item.CSI_SITALU}(A) - ${item.CSI_DATRAN}`}</Text>
                            }
                            {
                              item.CSI_SITALU === 'MATRICULADO' &&
                              <Text note numberOfLines={1} style={styles.textList}>{`${item.CSI_SITALU}(A)`}</Text>
                            }

                            {
                              (this.notaNaMedia(item.NOTA, item.VALOR) === false && this.state.etapaEncerrada === false && parseFloat(item.NOTA) > 0) &&
                              <Badge danger>
                                <Text style={stylesPadrao.styleTexto}>Nota: {parseFloat(item.NOTA.toString().replace(",", "."))}</Text>
                              </Badge>}
                            {
                              (this.notaNaMedia(item.NOTA, item.VALOR) === true && this.state.etapaEncerrada === false && parseFloat(item.NOTA) > 0) &&
                              <Badge success>
                                <Text style={stylesPadrao.styleTexto}>Nota: {parseFloat(item.NOTA.toString().replace(",", "."))}</Text>
                              </Badge>
                            }
                          </Body>

                          {
                            this.state.etapaEncerrada === false &&
                            <Right>
                              <TextInput
                                style={{ height: 40, borderColor: 'gray', borderWidth: 1, textAlign: 'center' }}
                                placeholder="Nota Obtida"
                                keyboardType={'number-pad'}
                                maxLength={20}
                                returnKeyType={'send'}
                                onChangeText={(text) => this.editarNota(text, item)}
                              />
                            </Right>
                          }
                          {
                            this.state.etapaEncerrada === true &&
                            <Right>
                              {
                                this.notaNaMedia(item.NOTA, item.VALOR) === false &&
                                <Badge danger>
                                  <Text style={stylesPadrao.styleTexto}>Nota: {parseFloat(item.NOTA.toString().replace(",", "."))}</Text>
                                </Badge>}
                              {
                                this.notaNaMedia(item.NOTA, item.VALOR) === true &&
                                <Badge success>
                                  <Text style={stylesPadrao.styleTexto}>Nota: {parseFloat(item.NOTA.toString().replace(",", "."))}</Text>
                                </Badge>
                              }
                            </Right>
                          }
                        </ListItem>
                      )}

                      extraData={this.state}
                    />

                  </ScrollView>
                </List>

              }

              {
                (this.state.alunosPorAvaliacao.length === 0 && this.state.alunos.length === 0) &&
                <SemRegistro texto={'Nenhum Registro Encontrado.\nPara buscar os registros clique em filtro!'} />
              }
            </View>
          }

          {
            (this.state.alunosPorAvaliacao.length > 0 && this.state.etapaEncerrada === false) &&
            <View style={styles.bottonSalvar}>
              <View style={styles.bottonsItens}>
                <Button block success
                  style={{ marginLeft: 10, marginRight: 10 }}
                  onPress={() => this.salvarNotas()}>
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
  containernotas: {
    flex: 9,
    marginBottom: 70
  },
  buttonSalvar: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 30
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
    flex: 1, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'stretch'
  },
  bottonsItens: {
    flex: 1, width: 120, height: 100,
    marginLeft: 5, marginRight: 5
  }
});