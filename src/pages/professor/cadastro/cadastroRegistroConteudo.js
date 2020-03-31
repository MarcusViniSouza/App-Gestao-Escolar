import React, { Component } from 'react';

import { DrawerActions } from 'react-navigation';

import {
  Container, Header, Left, Right, Body,
  Content, Subtitle, Form, Text, Icon,
  Item, Input, Label, StyleProvider,
  Button, Title, ActionSheet, Toast, Textarea,
  ListItem
} from 'native-base';

import {
  TouchableOpacity, Modal, View, Alert, DatePickerAndroid,
  StyleSheet, ScrollView, RefreshControl,
  Platform, KeyboardAvoidingView, TextInput
} from 'react-native';

import getTheme from '../../../../native-base-theme/components';
import material from '../../../../native-base-theme/variables/material';
import platform from '../../../../native-base-theme/variables/platform';
import Load from '../../../componentes/load';
import Loader from '../../../componentes/loader';
import SemRegistro from '../../../componentes/semregistro';

import { Root, Popup } from 'popup-ui';

import Icone from "react-native-vector-icons/Ionicons";

import { getApi } from '../../../services/api';

import AsyncStorage from '@react-native-community/async-storage';

import { Constantes } from '../../../classes/constantes';

let constPeriodos = new Constantes();

var periodos = constPeriodos.periodos(4);
var tiposAvaliacao = constPeriodos.tipoAvaliacao();

export default class CadastrarFormaAvaliacao extends Component {
  static navigationOptions = {
    title: 'Cadastrar Registro de Conteúdo',
    headerStyle: { backgroundColor: "#123751" },
    headerTintColor: "#FFF",
    header: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      data: `${new Date().getUTCDate()}/${new Date().getUTCMonth() + 1}/${new Date().getUTCFullYear()}`,
      dataFormatada: `${new Date().getUTCDate()}.${new Date().getUTCMonth() + 1}.${new Date().getUTCFullYear()}`,
      editando: this.props.navigation.getParam('editando'),
      clonando: this.props.navigation.getParam('clonando'),
      id: this.props.navigation.getParam('id'),
      descricao: '',
      aulas: '',
      diaLetivo: true,
      enderecoIp: '',
      idEscola: this.props.navigation.getParam('escola'),
      idAno: this.props.navigation.getParam('ano'),
      ano: this.props.navigation.getParam('anoTexto'),
      etapa: this.props.navigation.getParam('etapa'),
      turma: this.props.navigation.getParam('turma'),
      grade: this.props.navigation.getParam('grade'),
      professor: this.props.navigation.getParam('professor'),
      usuario: this.props.navigation.getParam('usuario'),
      buscando: false,
      textoBuscando: '',
      podeSalvar: true,
      registroEdicao: this.props.navigation.getParam('registro'),

      indexTurma: '',
      idTurma: '',
      idSerie: '',
      nomeTurma: '',
      indexDisciplina: '',
      idGrade: '',
      nomeDisciplina: '',
      disciplinas: [],
      turmas: [],
    }
  }

  componentDidMount() {
    if (this.state.editando === true || this.state.clonando === true) {
      this.getDadosCadastro();
    }
  }

  onValueChangeIdTurma = async (value) => {
    await this.setState({
      indexTurma: value,
      idTurma: this.state.turmas[value].CSI_CODTUR,
      idSerie: this.state.turmas[value].CSI_CODSER,
      idCurso: this.state.turmas[value].CSI_CODCUR,
      nomeTurma: this.state.turmas[value].CSI_NOMTUR
    });

    this.getDisciplinas();
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

      var parametros = {
        serie: this.state.idSerie,
        escola: this.state.idEscola,
        ano: this.state.idAno,
        professor: this.state.professor
      };

      const response = await getApi(`getDisciplinasProfessor/${JSON.stringify(parametros)}`);

      const { DISCIPLINA } = response.result[0];

      if (DISCIPLINA !== '0') {
        this.setDisciplinas(response.result);
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
      let codigoAnoLetivo = this.state.idAno;
      let codigoProfessor = this.state.professor;
      let codigoEscola = this.state.idEscola;

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

  getDadosCadastro = async () => {
    try {
      const { ID, DATA, QTDE_AULAS, LETIVO, CONTEUDO } = this.state.registroEdicao;

      var arrDataNormal = DATA.split('/');
      var dia = arrDataNormal[0];
      var mes = arrDataNormal[1];
      var ano = arrDataNormal[2];

      await this.setDate(`${dia}.${mes}.${ano}`);

      if (LETIVO === 'False') {
        await this.setDiaLetivo(false);
      } else {
        await this.setDiaLetivo(true);
      }

      await this.setDescricao(CONTEUDO);

      var idValido = ID;

      await this.setState({ id: idValido, data: DATA, aulas: QTDE_AULAS });

      await this.getTurmas();

    } catch (error) {

    }
  }

  setDiaLetivo = (value) => {
    this.setState({ diaLetivo: value });
  }

  setDate(newDate) {
    this.setState({ dataFormatada: newDate });
  }

  setDescricao = (value) => {
    this.setState({ descricao: value });
  }

  setData = async () => {
    try {

      var arrData = this.state.data.split("/");
      const { action, year, month, day, } = await DatePickerAndroid.open({ date: new Date(arrData[2], arrData[1] - 1, arrData[0]) });

      if (action !== DatePickerAndroid.dismissedAction) {
        await this.setDate(`${day}.${month + 1}.${year}`);
        await this.setState({ data: `${day}/${month + 1}/${year}` });

        await this.validarDataAvaliacao();
      }
    } catch ({ code, message }) {
      console.warn('Não é possível abrir o seletor de datas', message);
    }
  };

  exibirMensagem = (texto, tipo) => {
    Toast.show({
      text: texto,
      buttonText: "Ok",
      position: "top",
      type: tipo,
      duration: 5000
    });
  }

  validarDataAvaliacao = async () => {
    if (this.state.clonando === true) {
      var parametros = { data: this.state.dataFormatada, turma: this.state.idTurma, grade: this.state.idGrade, ano: this.state.idAno };
    } else {
      var parametros = { data: this.state.dataFormatada, turma: this.state.turma, grade: this.state.grade, ano: this.state.idAno };
    }

    const response = await getApi(`DataConteudo/${JSON.stringify(parametros)}`);

    let resultado = response.result;

    if (resultado == 1) {
      if (this.state.clonando === true) {
        Alert.alert('Atenção', 'Já existe uma aula registrada para o dia informado, Deseja Substituir o conteúdo e a quantidade de aulas?',
          [
            { text: 'Não', style: 'cancel', },
            { text: 'Sim', onPress: () => this.clonarRegistroConteudo() },
          ],
          { cancelable: false },
        );
      } else {
        this.mensagem('Warning', 'Atenção', 'Já existe uma aula registrada para o dia informado!', null);
        this.setState({ podeSalvar: false });
      }
    } else {
      if (this.state.clonando === true) {
        this.clonarRegistroConteudo();
      } else {
        this.setState({ podeSalvar: true });
      }
    }

  }

  salvarRegistro = () => {
    if (this.state.clonando === true) {
      this.validarDataAvaliacao();
    } else {
      this.salvarRegistroConteudo();
    }
  }

  clonarRegistroConteudo = async () => {
    try {

      this.setState({ buscando: true, textoBuscando: 'Clonando Conteúdo' });

      if (this.state.idTurma === '') {
        this.mensagem('Warning', 'Atenção', 'Favor Selecionar uma Turma!', null);
      } else if (this.state.idGrade === '') {
        this.mensagem('Warning', 'Atenção', 'Favor Selecionar uma Disciplina!', null);
      } else {
        var parametros = {
          id: this.state.id, data: this.state.dataFormatada,
          qtde: this.state.aulas, escola: this.state.idEscola, id_ano: this.state.idAno,
          etapa: this.state.etapa, turma: this.state.idTurma, grade: this.state.idGrade,
          ano: this.state.ano, user: this.state.usuario
        };

        const response = await getApi(`ClonarConteudo/${JSON.stringify(parametros)}`);

        let resultado = response.result;

        if (resultado.result == 'false') {
          this.mensagem('Warning', 'Atenção', resultado.msg, null);
        } else
          if (resultado.result == 'true') {
            this.mensagem('Success', 'Atenção', resultado.msg, this.voltarTela());
          }
      }


    } catch (error) {

    }

    this.setState({ buscando: false, textoBuscando: '' });
  }

  voltarTela = () => {
    this.props.navigation.navigate('RegistroConteudo');
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

  salvarRegistroConteudo = async () => {
    try {

      if (this.state.podeSalvar === false) {
        this.mensagem('Warning', 'Atenção', 'Já existe uma aula registrada para o dia informado!', null);
      } else if (this.state.dataFormatada === '') {
        this.mensagem('Warning', 'Atenção', 'Favor informe uma Data!', null);
      } else if (this.state.descricao === '') {
        this.mensagem('Warning', 'Atenção', 'informe uma Descrição!', null);
      } else {

        this.setState({ buscando: true, textoBuscando: 'Salvando Conteúdo' });

        let id = this.state.id;

        const response = await getApi(`SalvarConteudo/${id}/${this.state.idEscola}/${this.state.ano}/${this.state.idAno}/
                                     ${this.state.grade}/${this.state.turma}/${this.state.etapa}/${this.state.dataFormatada}/
                                     ${this.state.aulas}/${this.state.ip}/${this.state.diaLetivo}/${this.state.descricao}/
                                     ${this.state.usuario}/${false}/${false}`);

        let resultado = response.result;

        this.setState({ buscando: false, textoBuscando: '' });

        if (resultado.result == 'false') {
          this.mensagem('Warning', 'Atenção', resultado.msg, null);
        } else
          if (resultado.result == 'true') {
            this.mensagem('Success', 'Atenção', resultado.msg, this.voltarTela());
          }

      }
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    return (
      <StyleProvider style={getTheme(material)}>
        <Container>
          <Header>
            <Left>
              <Button transparent onPress={() => { this.props.navigation.navigate('RegistroConteudo'); }} >
                <Icon name='arrow-back' />
              </Button>
            </Left>

            <Body>
              <Title>Cadastrar</Title>
              <Subtitle>Registro de Conteúdo - {this.state.etapa}º Trimestre</Subtitle>
            </Body>

          </Header>

          <Popup />

          <ScrollView>
            <View style={styles.styleViewCampos}>
              <Loader loading={this.state.buscando} texto={this.state.textoBuscando} />

              <Item inlineLabel>
                <Label>Data:</Label>
                <Button transparent onPress={() => this.setData()}>
                  <Text style={styles.textDescricaoStyle}>
                    {this.state.data}
                  </Text>
                </Button>
              </Item>

              <Item inlineLabel>
                <Label>Qtde. Aulas:</Label>
                <TextInput
                  keyboardType={'numeric'}
                  value={this.state.aulas}
                  autoCapitalize="none"
                  onChangeText={(aulas) => this.setState({ aulas: aulas })}
                />
              </Item>

              {
                this.state.clonando === true &&
                <Item inlineLabel>
                  <Label>Turma:</Label>
                  <TouchableOpacity style={styles.styleCamposOpcao}
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
                      <Text style={styles.textDescricaoCampoStyle}>
                        Selecione uma Turma
                            </Text>
                    }
                    {
                      this.state.nomeTurma !== '' &&
                      <Text style={styles.textDescricaoCampoStyle}>
                        {this.state.nomeTurma}
                      </Text>
                    }
                  </TouchableOpacity>
                </Item>

              }

              {
                this.state.disciplinas.length > 0 &&
                <Item inlineLabel>
                  <Label>Disciplina:</Label>
                  <TouchableOpacity style={styles.styleCamposOpcao}
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
                      <Text style={styles.textDescricaoCampoStyle}>
                        Selecione uma disciplina
                              </Text>
                    }
                    {
                      this.state.nomeDisciplina !== '' &&
                      <Text style={styles.textDescricaoCampoStyle}>
                        {this.state.nomeDisciplina}
                      </Text>
                    }
                  </TouchableOpacity>
                </Item>
              }

              <Textarea value={this.state.descricao} rowSpan={5} bordered placeholder="Descrição Conteúdo" onChangeText={(descricao) => this.setState({ descricao: descricao })} />

              <ListItem>
                <TouchableOpacity onPress={() => this.setDiaLetivo(!this.state.diaLetivo)}>
                  <Icone name={this.state.diaLetivo == false ? 'md-square-outline' : 'md-checkbox'}
                    size={30}
                    color={this.state.diaLetivo == false ? '#FF4500' : '#2E8B57'} />
                </TouchableOpacity>
                <Body>
                  <Text>Dia é Letivo?</Text>
                </Body>
              </ListItem>
            </View>
          </ScrollView>



          <View style={styles.bottonSalvar}>
            <Button block success
              onPress={() => this.salvarRegistro()}
              style={{ marginLeft: 10, marginRight: 10, marginBottom: 20 }}>
              <Text>Salvar</Text>
            </Button>

            <Button block danger
              onPress={() => { this.props.navigation.navigate('RegistroConteudo'); }}
              style={{ marginLeft: 10, marginRight: 10, marginBottom: 20 }}>
              <Text>Cancelar</Text>
            </Button>
          </View>

        </Container>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  textBranco: {
    color: "white",
    fontSize: 10
  },
  bottonSalvar: {
    marginTop: 5,
    marginBottom: 2
  },
  styleViewCampos: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    flex: 1
  },
  textDescricaoStyle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  },
  textDescricaoCampoStyle: {
    fontSize: 12,
    fontWeight: '500'
  },
  styleCamposOpcao: {
    height: 30,
    marginBottom: 15,
    marginLeft: 5,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'flex-start'
  }
});