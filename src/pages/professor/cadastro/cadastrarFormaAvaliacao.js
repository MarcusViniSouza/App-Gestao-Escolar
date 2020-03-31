import React, { Component } from 'react';

import { DrawerActions } from 'react-navigation';

import {
  Container, Header, Left, Right, Body,
  Content, Subtitle, Form, Text, Icon,
  Item, Input, Label, StyleProvider,
  Button, Title, ActionSheet, Toast,
  ListItem
} from 'native-base';

import {
  Modal, View, Alert, DatePickerAndroid,
  StyleSheet, ScrollView, RefreshControl,
  CheckBox, TextInput, TouchableOpacity
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
    title: 'Cadastrar Forma de Avaliação',
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
      id: this.props.navigation.getParam('id'),
      descricao: '',
      nota: '',
      aulas: '',
      tipo: '',
      notaOld: '',
      itemRecuperar: '',
      descricaoTipoAvaliacao: '',
      diaLetivo: true,
      enderecoIp: '',
      idEscola: this.props.navigation.getParam('escola'),
      idAno: this.props.navigation.getParam('ano'),
      ano: this.props.navigation.getParam('anoTexto'),
      etapa: this.props.navigation.getParam('etapa'),
      turma: this.props.navigation.getParam('turma'),
      grade: this.props.navigation.getParam('grade'),
      usuario: this.props.navigation.getParam('usuario'),
      idProva: '',
      indexProva: '',
      descricaoAvaliacao: '',
      avaliacoes: [],
      buscando: false,
      textoBuscando: ''
    }
  }

  componentDidMount() {
    if (this.state.editando === true) {
      this.getDadosCadastro();
    }
  }

  getDadosCadastro = async () => {
    try {
      var parametros = { id: this.state.id };

      this.setState({ buscando: true, textoBuscando: 'Carregando Avaliação' });

      const response = await getApi(`DadosCadastro/${JSON.stringify(parametros)}`);

      const { DATA, DIA, MES, ANO, DESCRICAO, NOTA, AVALIACAO, RECUPERAR, LETIVO, AULAS } = response.result[0];

      await this.setDate(`${DIA}.${MES}.${ANO}`);

      await this.setDescricaoTipoAvaliacao(AVALIACAO - 1);

      if (RECUPERAR > 0) {
        const indexAvaliacao = this.state.avaliacoes.findIndex(val => val.CODIGO_NOTA == RECUPERAR);
        await this.onValueChangeIdAvaliacao(indexAvaliacao);
      }

      if (LETIVO === 'False') {
        await this.setDiaLetivo(false);
      } else {
        await this.setDiaLetivo(true);
      }

      await this.setState({ data: `${DIA}/${MES}/${ANO}`, descricao: DESCRICAO, nota: NOTA, notaOld: NOTA, aulas: AULAS });

    } catch (error) {

    }

    this.setState({ buscando: false, textoBuscando: '' });
  }

  setDiaLetivo = (value) => {
    this.setState({ diaLetivo: value });
  }

  setDescricaoTipoAvaliacao = async (value) => {
    if (value === 4) {
      await this.getAvaliacoes();
    } else {
      this.setState({
        idProva: '',
        indexProva: '',
        descricaoAvaliacao: ''
      });
    }

    this.setState({ descricaoTipoAvaliacao: tiposAvaliacao[value], tipo: value + 1 });
  }

  setDate(newDate) {
    this.setState({ dataFormatada: newDate });
  }

  setData = async () => {
    try {
      const { action, year, month, day, } = await DatePickerAndroid.open({ date: new Date() });

      if (action !== DatePickerAndroid.dismissedAction) {
        this.setDate(`${day}.${month + 1}.${year}`);
        this.setState({ data: `${day}/${month + 1}/${year}` });

        this.validarDataAvaliacao();
      }
    } catch ({ code, message }) {
      console.warn('Não é possível abrir o seletor de datas', message);
    }
  };

  onValueChangeIdAvaliacao = (value) => {
    this.setState({
      descricaoAvaliacao: this.state.avaliacoes[value].DESCRICAO,
      idProva: this.state.avaliacoes[value].CODIGO_NOTA
    });
  }

  setAvaliacoes = (value) => {
    this.setState({ avaliacoes: value });
  }

  getAvaliacoes = async () => {
    try {
      this.setState({ buscando: true, textoBuscando: 'Carregando Avaliações' });

      var parametros = {
        escola: this.state.idEscola, ano: this.state.idAno,
        etapa: this.state.etapa, grade: this.state.grade,
        turma: this.state.turma, ignorarItens: true
      };

      const response = await getApi(`FormacaoNotas/${JSON.stringify(parametros)}`);

      this.setAvaliacoes(response.result);

    } catch (e) {
      console.log(e);
    }

    this.setState({ buscando: false, textoBuscando: '' });
  }

  voltarTela = () => {
    this.props.navigation.navigate('FormaAvaliacao');
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

  validarDataAvaliacao = async () => {
    var parametros = {
      data: this.state.dataFormatada, descricao: this.state.descricao,
      turma: this.state.turma, grade: this.state.grade, ano: this.state.idAno
    };

    const response = await getApi(`ValidarDataFormacaoNotas/${JSON.stringify(parametros)}`);

    let resultado = response.result;

    if (resultado == 2) {
      this.mensagem('Danger', 'Atenção', 'Já existe uma aula registrada para o dia informado, Se continuar, o conteúdo será substituído pelo informado aqui.', null);
    } else
      if (resultado == 1) {
        this.mensagem('Warning', 'Atenção', 'Já existe uma avaliação registrada para o dia informado!', null);
      }
  }

  salvarFormaAvaliacao = async () => {
    try {
      if (this.state.tipo === 5 && this.state.idProva === '') {
        this.mensagem('Warning', 'Atenção', 'Favor informe um Item a recuperar!', null);
      } else if (this.state.dataFormatada === '') {
        this.mensagem('Warning', 'Atenção', 'Favor informe uma Data!', null);
      } else if (this.state.descricao === '') {
        this.mensagem('Warning', 'Atenção', 'informe uma Descrição!', null);
      } else if (this.state.nota === '') {
        this.mensagem('Warning', 'Atenção', 'Favor informe uma Nota!', null);
      } else if (this.state.tipo === '') {
        this.mensagem('Warning', 'Atenção', 'Favor informe um Tipo de Avaliação!', null);
      } else {

        this.setState({ buscando: true, textoBuscando: 'Salvando Avaliação' });

        var parametros = {
          data: this.state.dataFormatada, descricao: this.state.descricao, aulas: this.state.aulas,
          valor: this.state.nota, old: this.state.notaOld,
          tipo: this.state.tipo, letivo: this.state.diaLetivo,
          escola: this.state.idEscola, turma: this.state.turma,
          grade: this.state.grade, usuario: this.state.usuario,
          etapa: this.state.etapa, ano: this.state.idAno,
          anotext: this.state.ano, itemrecuperar: this.state.idProva,
          ip: this.state.enderecoIp, id: this.state.id === '' ? 0 : this.state.id
        };

        const response = await getApi(`SalvarFormacaoNotas/${JSON.stringify(parametros)}`);

        let resultado = response.result;

        this.setState({ buscando: false, textoBuscando: '' });

        if (resultado == -3) {
          this.mensagem('Warning', 'Atenção', 'A Data informada não pertence ao período selecionado!', null);
        } else
          if (resultado == -2) {
            this.mensagem('Warning', 'Atenção', 'Já existe uma recuperação informada!', null);
          } else
            if (resultado == -1) {
              this.mensagem('Danger', 'Atenção', 'Erro ao salvar Formação de notas!', null);
            } else
              if (resultado == 0) {
                this.mensagem('Success', 'Atenção', 'Formação de notas salvo com sucesso!', this.voltarTela());
              } else {
                this.mensagem('Warning', 'Atenção', 'O valor atribuído ao item á maior que o valor do periodo avaliativo!', null);
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
              <Button transparent onPress={() => { this.props.navigation.navigate('FormaAvaliacao'); }} >
                <Icon name='arrow-back' />
              </Button>
            </Left>

            <Body>
              <Title>Cadastrar</Title>
              <Subtitle>Forma de Avaliação</Subtitle>
            </Body>

          </Header>


          <Popup />

          <Form>

            <Loader loading={this.state.buscando} texto={this.state.textoBuscando} />

            <Item disabled>
              <Label>Data:</Label>
              {
                this.state.editando === true &&
                <Button transparent disabled onPress={() => this.setData()}>
                  <Text style={styles.textDescricaoStyleEditando}>
                    {this.state.data}
                  </Text>
                </Button>
              }
              {
                this.state.editando !== true &&
                <Button transparent onPress={() => this.setData()}>
                  <Text style={styles.textDescricaoStyle}>
                    {this.state.data}
                  </Text>
                </Button>
              }
            </Item>

            <Item inlineLabel>
              <Label>Descrição:</Label>
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                value={this.state.descricao}
                onChangeText={(text) => this.setState({ descricao: text })}
                returnKeyType="next"
                onSubmitEditing={() => { this.passInput.focus(); }}
                blurOnSubmit={false}
              />
            </Item>


            <Item inlineLabel>
              <Label>Nota:</Label>
              <TextInput
                ref={(input) => { this.passInput = input; }}
                editable={!this.state.editando}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType={'numeric'}
                value={this.state.nota}
                onChangeText={(text) => this.setState({ notaOld: this.state.nota, nota: text })}
                returnKeyType="next"
                onSubmitEditing={() => { this.passQtde.focus(); }} />

            </Item>

            <Item inlineLabel>
              <Label>Qtde. Aulas:</Label>
              <TextInput
                ref={(input) => { this.passQtde = input; }}
                editable={!this.state.editando}
                keyboardType={'numeric'}
                value={this.state.aulas}
                autoCapitalize="none"
                onChangeText={(aulas) => this.setState({ aulas: aulas })}
              />
            </Item>

            <Item inlineLabel>
              <Label>Tipo de Avaliação:</Label>
              {
                this.state.editando === true &&
                <Button transparent disabled
                  onPress={() =>
                    ActionSheet.show(
                      {
                        options: tiposAvaliacao,
                        title: "Tipo de Avaliação"
                      },
                      buttonIndex => {
                        this.setDescricaoTipoAvaliacao(buttonIndex)
                      }
                    )}
                >
                  <Text style={styles.textDescricaoStyleEditando}>
                    {this.state.descricaoTipoAvaliacao}
                  </Text>
                </Button>
              }
              {
                this.state.editando === false &&
                <Button transparent
                  onPress={() =>
                    ActionSheet.show(
                      {
                        options: tiposAvaliacao,
                        title: "Tipo de Avaliação"
                      },
                      buttonIndex => {
                        this.setDescricaoTipoAvaliacao(buttonIndex)
                      }
                    )}
                >
                  {
                    this.state.descricaoTipoAvaliacao === '' &&
                    <Text style={styles.textDescricaoStyle}>
                      Selecione um Tipo
                          </Text>
                  }
                  {
                    this.state.descricaoTipoAvaliacao !== '' &&
                    <Text style={styles.textDescricaoStyle}>
                      {this.state.descricaoTipoAvaliacao}
                    </Text>
                  }
                </Button>
              }
            </Item>

            {this.state.tipo === 5 &&
              <Item inlineLabel>
                <Label>Item a recuperar:</Label>
                {
                  this.state.editando === true &&
                  <Button transparent disabled
                    onPress={() =>
                      ActionSheet.show(
                        {
                          options: this.state.avaliacoes.map((item, index) => {
                            return item.DESCRICAO
                          }),
                          title: "Avaliações a Recuperar"
                        },
                        buttonIndex => {
                          this.onValueChangeIdAvaliacao(buttonIndex)
                        }
                      )}
                  >
                    <Text style={styles.textDescricaoStyleEditando}>
                      {this.state.descricaoAvaliacao}
                    </Text>
                  </Button>
                }

                {
                  this.state.editando === false &&
                  <Button transparent
                    onPress={() =>
                      ActionSheet.show(
                        {
                          options: this.state.avaliacoes.map((item, index) => {
                            return item.DESCRICAO
                          }),
                          title: "Avaliações a Recuperar"
                        },
                        buttonIndex => {
                          this.onValueChangeIdAvaliacao(buttonIndex)
                        }
                      )}
                  >
                    {
                      this.state.descricaoAvaliacao === '' &&
                      <Text style={styles.textDescricaoStyle}>
                        Selecione um Item
                            </Text>
                    }
                    {
                      this.state.descricaoAvaliacao !== '' &&
                      <Text style={styles.textDescricaoStyle}>
                        {this.state.descricaoAvaliacao}
                      </Text>
                    }
                  </Button>
                }
              </Item>
            }

            <ListItem>
              {
                this.state.editando === true &&
                <TouchableOpacity disabled onPress={() => this.setDiaLetivo(!this.state.diaLetivo)}>
                  <Icone name={this.state.diaLetivo == false ? 'md-square-outline' : 'md-checkbox'}
                    size={30}
                    color={this.state.diaLetivo == false ? '#FF4500' : '#2E8B57'} />
                </TouchableOpacity>
              }
              {
                this.state.editando === false &&
                <TouchableOpacity onPress={() => this.setDiaLetivo(!this.state.diaLetivo)}>
                  <Icone name={this.state.diaLetivo == false ? 'md-square-outline' : 'md-checkbox'}
                    size={30}
                    color={this.state.diaLetivo == false ? '#FF4500' : '#2E8B57'} />
                </TouchableOpacity>
              }
              <Body>
                <Text>Dia é Letivo</Text>
              </Body>
            </ListItem>

            <View style={styles.bottonSalvar}>
              <Button block success
                onPress={() => this.salvarFormaAvaliacao()}
                style={{ marginLeft: 10, marginRight: 10, marginBottom: 20 }}>
                <Text>Salvar</Text>
              </Button>

              <Button block danger
                onPress={() => { this.props.navigation.navigate('FormaAvaliacao'); }}
                style={{ marginLeft: 10, marginRight: 10, marginBottom: 20 }}>
                <Text>Cancelar</Text>
              </Button>
            </View>

          </Form>


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
  textDescricaoStyle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  },
  textDescricaoStyleEditando: {
    fontSize: 16,
    fontWeight: '500',
    color: '#C0C0C0'
  }
});