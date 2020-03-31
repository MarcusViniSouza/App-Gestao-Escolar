import React, { Component } from 'react';

import { DrawerActions } from 'react-navigation';

import {
  ActionSheet, Container,
  Header, Left, Body,
  StyleProvider, Button, Form,
  Item, Icon, Title, Text, Badge,
  Content, List, ListItem,
  Label, Picker, Toast,
  Right, Separator, Spinner,
  Thumbnail
} from 'native-base';

import { Modal, View, Alert, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';
import platform from '../../../native-base-theme/variables/platform';
import Load from '../../componentes/load';
import SemRegistro from '../../componentes/semregistro';

import Icone from "react-native-vector-icons/Ionicons";

import { getHorarioProfessor } from '../../services/rest';
import { getApi } from '../../services/api';
import { stylesPadrao } from '../../style/style';

import { getRegistroStorage } from '../../services/storage';

import IconeAulas from './img/aulas.png';

export default class Aulas extends Component {
  static navigationOptions = {
    title: 'Horários',
    headerStyle: { backgroundColor: "#123751" },
    headerTintColor: "#FFF",
    header: null,
  }

  constructor(props) {
    super(props);

    var year = new Date().getFullYear();

    this.state = {
      nome: this.props.navigation.getParam('nome'),
      imagem: this.props.navigation.getParam('icone'),
      diasemana: '',
      diasemanatext: '',
      periodo: '',
      ano: year,
      idProfessor: '',
      horarios: [],
      carregando: false,
      isFetching: false,
      modalVisible: false,
      dias: [{ dia: "SEGUNDA-FEIRA" },
      { dia: "TERÇA-FEIRA" },
      { dia: "QUARTA-FEIRA" },
      { dia: "QUINTA-FEIRA" },
      { dia: "SEXTA-FEIRA" }]
    }

    this.getIdProfessor();
  }

  getDiaSemana = async () => {
    var data = `${new Date().getUTCDate()}/${new Date().getUTCMonth() + 1}/${new Date().getUTCFullYear()}`;
    var arr = data.split("/").reverse();
    var dataFormatada = new Date(arr[0], arr[1] - 1, arr[2]);
    return dataFormatada.getDay();
  }

  setModalVisible(visible, buscar) {
    this.setState({ modalVisible: visible });

    if (buscar === true) {
      this.getHorarios(false);
    }
  }

  onValueChangeDiaSemana(value) {
    this.setState({
      diasemana: value,
      diasemanatext: this.state.dias[value].dia
    });
  }

  onValueChangePeriodo(value) {
    this.setState({
      periodo: value
    });
  }

  setHorarios = (value) => {
    this.setState({ horarios: value });
  }

  setIdProfessor = (value) => {
    this.setState({ idProfessor: value });
  }

  getIdProfessor = async () => {
    const infoUsuario = await getRegistroStorage('dadosusuario');

    if (infoUsuario) {
      await this.setIdProfessor(infoUsuario.CSI_CODPRO);

      var indexDiaSemana = await this.getDiaSemana();

      await this.onValueChangeDiaSemana(indexDiaSemana - 1);

      await this.getHorarios();
    }
  }

  getHorarios = async (atualizar) => {

    if (this.state.diasemana === '') {
      Alert.alert('Atenção', 'Favor Informe um dia da semana para filtro.');
    } else {

      const escola = await getRegistroStorage('dadosescola');

      if (escola) {
        this.setHorarios();

        this.setState({ carregando: true });

        if (escola.CODIGO !== null) {
          var parametros = {
            ano: this.state.ano,
            escola: escola.CODIGO,
            id: this.state.idProfessor
          };

          const response = await getHorarioProfessor(parametros);

          let diaSelecionado = this.state.diasemana;

          if (response.length === 0) {
            Toast.show({
              text: "Nenhum Horário programado para o dia!",
              buttonText: "Ok",
              position: "top",
              type: "success",
              duration: 3000
            });
          } else {
            this.setHorarios(response[0][diaSelecionado]);
          }

          this.setState({ carregando: false });
        }
      }
    }

  };

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getHorarios().then(() => {
      this.setState({ refreshing: false });
    });
  }

  render() {
    return (
      <StyleProvider style={getTheme(material)}>
        <Container>
          <Header>
            <Left>
              <Button transparent onPress={() => { this.props.navigation.navigate('Menu'); }} >
                <Icon name='arrow-back' />
              </Button>
            </Left>

            <Body>
              <Title>Horários</Title>
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
                    <Text style={styles.textDia}>
                      Voltar
                        </Text>
                  </Button>
                </Left>

                <Body>
                  <Title>Filtros Aulas</Title>
                </Body>

              </Header>

              <Form style={stylesPadrao.styleModalFiltro}>
                <View style={stylesPadrao.styleViewFiltro}>
                  <Label note numberOfLines={1} >Dia da Semana:</Label>
                  <Button style={stylesPadrao.styleCampoFiltro} bordered dark
                    onPress={() =>
                      ActionSheet.show(
                        {
                          options:
                            this.state.dias.map((item, index) => {
                              return item.dia
                            }),
                          title: "Dias"
                        },
                        buttonIndex => {
                          this.onValueChangeDiaSemana(buttonIndex)
                        }
                      )}
                  >
                    {
                      this.state.diasemanatext === '' &&
                      <Text style={stylesPadrao.styleTexto}>
                        Selecione um Dia da Semana
                            </Text>
                    }
                    {
                      this.state.diasemanatext !== '' &&
                      <Text style={stylesPadrao.styleTexto}>
                        Dia: {this.state.diasemanatext}
                      </Text>
                    }
                  </Button>

                </View>

              </Form>


              <Button block info style={stylesPadrao.styleButtonBuscar}
                onPress={() => this.setModalVisible(false, true)}>
                <Text>Buscar</Text>
              </Button>

            </Modal>
          </View>

          {
            this.state.carregando &&
            <Load texto={'Aguarde Carregando os registros..'} />
          }
          {
            !this.state.carregando &&
            <View style={styles.conteinerhorarios}>

              {
                this.state.diasemanatext !== '' &&
                <View style={styles.conteinerDia}>
                  <Text style={styles.textDia}>{this.state.diasemanatext}</Text>
                </View>
              }

              <List>
                <ScrollView refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh} />}>

                  <FlatList
                    data={this.state.horarios}
                    // keyExtractor={(item, index) => item.seq}
                    renderItem={({ item }) => (
                      <ListItem avatar style={styles.listStyle}>
                        <Left style={styles.leftStyle}>
                          <Text style={styles.textFiltro}>{item.seq}</Text>
                        </Left>
                        <Body>
                          <Text style={styles.textoDisciplina}>{item.disciplina}</Text>
                          <Text style={styles.textPeriodo}>{item.inicio} á {item.fim}</Text>
                          <Text note style={styles.text}></Text>
                          <Text note style={styles.text}>{item.descricao} - {item.turma}</Text>
                        </Body>
                      </ListItem>
                    )}
                  />

                </ScrollView>

              </List>

            </View>
          }

        </Container>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  textoDisciplina: {
    fontWeight: '500', textAlign: 'center',
    borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.35)'
  },
  listStyle: {
    alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderWidth: 0.5, borderColor: '#123751',
    marginLeft: 5, marginRight: 5, marginBottom: 5, marginTop: 5
  },
  leftStyle: {
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#123751', height: 101, width: 30, borderRadius: 4, borderWidth: 0.5
  },
  conteinerhorarios: {
    flex: 1
  },
  text: {
    fontSize: 12, fontWeight: '500', textAlign: 'center'
  },
  textPeriodo: {
    color: "#FFF", fontWeight: '500', backgroundColor: '#123751', textAlign: 'center',
    borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.35)'
  },
  contentFiltros: {
    height: 50,
    marginBottom: 10,
    marginLeft: 5,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  contentCamposFiltro: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    flex: 1
  },
  textFiltro: {
    color: "#fff", fontWeight: '500'
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
  conteinerDia: {
    alignItems: 'center',
    backgroundColor: '#123751'
  },
  textDia: {
    color: "white", fontWeight: '500'
  }
});



