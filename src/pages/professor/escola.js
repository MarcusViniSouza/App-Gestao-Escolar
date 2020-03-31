import React, { Component } from 'react';

import { DrawerActions, NavigationEvents } from 'react-navigation';

import {
  Container,
  Header, Left, Body,
  StyleProvider, Button,
  Icon, Spinner, Title,
  Content, List, ListItem, Text, Right
} from 'native-base';

import {
  View, Alert, StyleSheet, FlatList, ScrollView,
  RefreshControl, TouchableOpacity, BackHandler
} from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import { setRegistroStorage, getRegistroStorage } from '../../services/storage';

import Load from '../../componentes/load';
import Loader from '../../componentes/loader';

import { getApi } from '../../services/api';

export default class Escola extends Component {
  static navigationOptions = {
    title: 'Escolas',
    headerStyle: { backgroundColor: "#007AFF" },
    headerTintColor: "#FFF",
    header: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      escolas: [],
      carregando: false,
      refreshing: false,
      acessando: false,
      textoAcessando: '',
      idSegUser: ''
    }
  }

  componentWillMount = () => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
  }

  selecionar = async (nomeEscola) => {
    this.setState({ acessando: true, textoAcessando: 'Aguarde' });

    await setRegistroStorage('dadosescola', nomeEscola);
    const { navigate } = this.props.navigation;
    navigate('Menu');

    this.setState({ acessando: false, textoAcessando: '' });
  }

  handleEscolas = (value) => {

    this.setState({ escolas: value, idSegUser: value[0].ID });
  }

  escolasUsuario = async () => {
    this.setState({ carregando: true });

    const idUsuario = await getRegistroStorage('dadosusuario');
    
    if (idUsuario) {
      const { ID } = idUsuario;
      const response = await getApi(`Escolas/${ID}`);
      
      this.handleEscolas(response.result);

      this.setState({ carregando: false });
    }
  };

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.escolasUsuario().then(() => {
      this.setState({ refreshing: false });
    });
  }

  salvarAcesso = async () => {
    try {
      var parametros = { ID_USER: this.state.idSegUser, TIPO_ACESSO: 'OUT' };

      const response = await getApi(`SalvarAcesso/${JSON.stringify(parametros)}`);

    } catch (e) {
      console.log(e);
    }
  }

  logout = async () => {
    await this.salvarAcesso();
    const { navigate } = this.props.navigation;
    navigate('Main');
  }

  render() {
    return (
      <StyleProvider style={getTheme(material)}>
        <Container>
          <NavigationEvents onWillFocus={() => {
            this.escolasUsuario();
          }} />
          <Header>

            <Body>
              <Title>Escolas</Title>
            </Body>

            <Right>
              <Button small transparent onPress={() => this.logout()}>
                <Icon name='md-log-out' />
                <Text>
                  Sair
                     </Text>
              </Button>
            </Right>

          </Header>

          {

            this.state.carregando &&
            <Load texto={'Aguarde Carregando os registros..'} />

          }
          {
            !this.state.carregando &&
            <View>
              <Loader loading={this.state.acessando} texto={this.state.textoAcessando} />
              <List>

                <ScrollView refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh} />}>

                  <FlatList
                    data={this.state.escolas}
                    // keyExtractor={(item, index) => item.CODIGO}
                    renderItem={({ item }) => (
                      <List>
                        <ListItem>
                          <Left>
                            <TouchableOpacity onPress={() => this.selecionar(item)}>
                              <Text styles={styles.textoStyle}>{item.ESCOLA}</Text>
                            </TouchableOpacity>
                          </Left>

                          <Right>
                            <TouchableOpacity onPress={() => this.selecionar(item)}>
                              <Icon name="arrow-forward" />
                            </TouchableOpacity>
                          </Right>
                        </ListItem>
                      </List>
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
  container: {
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C1C1C1',
  },
  textoStyle: { fontSize: 10, fontWeight: '500' }
});
