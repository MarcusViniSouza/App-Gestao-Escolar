import React, { Component } from 'react';

import { DrawerActions, NavigationEvents } from 'react-navigation';

import {
  Body,
  Button,
  Badge,
  Container,
  Content,
  Card,
  CardItem,
  Footer,
  FooterTab,
  Header,
  Icon,
  Left,
  List,
  ListItem,
  Right,
  StyleProvider,
  Title,
  Text,
  Thumbnail,
  Toast
} from 'native-base';

import {
  Alert,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  BackHandler,
  View,
  ScrollView,
  FlatList
} from 'react-native';

import PopupMenu from '../../componentes/popupMenu';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import { getApi } from '../../services/api';

import IconeConteudo from './img/conteudo.png';
import IconeAvaliacao from './img/avaliacao.png';
import IconeNotas from './img/notas.png';
import IconeFrequencias from './img/frequencias.png';
import IconeEscola from './img/escola.png';
import Iconeusuario from './img/usuario.png';
import Icone from "react-native-vector-icons/Ionicons";

import { Root, Popup } from 'popup-ui';

import {
  setRegistroStorage,
  getRegistroStorage,
  salvarStorage,
  removeItemValue,
  listaChavesStorage,
  buscarStorage
} from '../../services/storage';

const { width: WIDTH } = Dimensions.get('window');

export default class Home extends Component {
  static navigationOptions = {
    title: 'Menu',
    headerStyle: { backgroundColor: "#123751" },
    headerTintColor: "#FFF",
    header: null,
  }

  constructor(props) {
    super(props);
    this.SlideInLeft = new Animated.Value(0);

    this.state = {
      escola: '',
      codEscola: '',
      usuario: '',
      idUsuario: '',
      idSegUser: '',
      quantidadeNotificacoes: '',
      notificacoes: [],
      anoLetivo: ''
    }
  }

  componentDidMount() {
    this.spring();
  }

  spring() {
    this.SlideInLeft.setValue(0)
    Animated.timing(this.SlideInLeft, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start()
  }

  componentWillMount = () => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
  }

  logando = async () => {
    await this.getDadosEscola();

    await this.usuarioLogado();

    await this.getNotificacoes();
  }

  exibirMensagem = (texto, tipo) => {
    Toast.show({
      text: texto,
      buttonText: "Ok",
      position: "bottom",
      type: tipo,
      duration: 5000
    });
  }


  handleUsuario = (value) => {
    this.setState({ usuario: value });
  }

  getIdUsuario = (value) => {
    this.setState({ idUsuario: value });
  }

  getDadosAnoLetivo = async () => {
    try {
      let idProf = this.state.idUsuario;
      let idEscola = this.state.codEscola;

      if (idProf !== null && idEscola !== null) {
        const response = await getApi(`AnosValidos/${idEscola}/${idProf}`);

        if (response.result.length === 0) {
          Alert.alert('ATENÇÃO!', 'Professor a sua grade ainda não foi criada para este ano letivo.\n' +
            'Solicite a criação da mesma para o uso do aplicativo.\n' +
            '',
            [
              { text: 'OK', onPress: () => this.logout() },
            ],
            { cancelable: false },
          );
        } else {
          await this.setState({ anoLetivo: response.result[0].CSI_ANOLET });
          await setRegistroStorage('dadosanoletivo', response.result[0]);
        }
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  getDadosEscola = async () => {
    const dadosEscola = await getRegistroStorage('dadosescola');

    if (dadosEscola) {
      const { ESCOLA, CODIGO } = dadosEscola;

      await this.setState({
        escola: ESCOLA,
        codEscola: CODIGO,
      });
    }
  }

  usuarioLogado = async () => {
    if (this.state.idSegUser) {
      await this.getDadosAnoLetivo();
      return;
    } 

    const infoUsuario = await getRegistroStorage('dadosusuario');

    if (infoUsuario) {
      const { ID, NOME, ID_PROF } = infoUsuario;

      await this.setState({ idSegUser: ID });
      await this.handleUsuario(NOME);
      await this.getIdUsuario(ID_PROF);

      await this.getDadosAnoLetivo();
    }
  };


  salvarAcesso = async () => {
    try {
      var parametros = { ID_USER: this.state.idSegUser, TIPO_ACESSO: 'OUT' };

      const response = await getApi(`SalvarAcesso/${JSON.stringify(parametros)}`);

    } catch (e) {
      console.log(e);
    }
  }

  setNotificacoes = (value) => {
    this.setState({ notificacoes: value, quantidadeNotificacoes: value.length });

    if (value.length > 0) {
      this.exibirMensagem(`Atenção, Existem (${value.length}) notificações não lidas!`, 'success');
    }
  }

  getNotificacoes = async () => {
    try {
      var parametros = { todas: false, usuario: this.state.idUsuario };

      const response = await getApi(`Notificacoes/${JSON.stringify(parametros)}`);

      this.setNotificacoes(response.result);

    } catch (error) {
      // console.log(error);
    }
  }

  deletarFiltros = async () => {
    const retorno = await removeItemValue('dadosFiltro');
  }

  visualizarNotificacoes = () => {
    const { navigate } = this.props.navigation;
    navigate('Notificacao', { notificacoes: this.state.notificacoes, idUsuario: this.state.idUsuario });
  }

  logout = async () => {
    await this.deletarFiltros();
    await this.salvarAcesso();

    const { navigate } = this.props.navigation;
    navigate('Main');
  }

  trocarEscola = async () => {
    await this.deletarFiltros();
    const { navigate } = this.props.navigation;
    navigate('Escola');
  }

  registroConteudo = () => {
    const { navigate } = this.props.navigation;
    navigate('RegistroConteudo');
  }

  formaAvaliacao = () => {
    const { navigate } = this.props.navigation;
    navigate('FormaAvaliacao');
  }

  notas = () => {
    const { navigate } = this.props.navigation;
    navigate('Notas');
  }

  frequencias = () => {
    const { navigate } = this.props.navigation;
    navigate('Frequencias');
  }

  showMenuAndroid(i) {
    // 0 = Alterar senha, 1 = Sair
    if (i === 0) {
      this.trocarEscola();
    } else if (i === 1) {
      this.logout();
    }
  }

  render() {
    return (
      <StyleProvider style={getTheme(material)}>
        <Container style={{ backgroundColor: '#DCDCDC' }}>
          <NavigationEvents onWillFocus={() => {
            this.logando();
          }} />
          <Header>

            <Left>
              <Button transparent onPress={() => { this.props.navigation.dispatch(DrawerActions.openDrawer()); }} >
                <Icon name='menu' />
              </Button>
            </Left>

            <Body>
              <Title>Menu</Title>
            </Body>

            <Right>

              <Button small transparent onPress={() => this.visualizarNotificacoes()}>
                {
                  this.state.notificacoes.length !== 0 &&
                  <Badge warning>
                    <Text>{this.state.quantidadeNotificacoes}</Text>
                  </Badge>
                }
                <Icon name='notifications' />
              </Button>

              <PopupMenu
                actions={['Alterar Escola', 'Sair']}
                onPress={(e, i) => this.showMenuAndroid(i)}
              />

            </Right>


          </Header>

          <View style={{ flex: 1 }}>
            <View style={styles.containerProfessor}>
              <Text style={styles.textoUsuario}>Olá, professor(a)</Text>
              <Text note style={styles.textoUsuario}>{this.state.usuario}</Text>
            </View>

            <View style={styles.containerEscola}>

              <Animated.View
                style={{
                  flex: 1, width: 120, height: 90,
                  borderRadius: 4, borderWidth: 0.5, borderColor: '#123751',
                  marginLeft: 5, marginRight: 5, marginBottom: 5,
                  transform: [
                    {
                      translateX: this.SlideInLeft.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-600, 0]
                      })
                    }
                  ]
                }}>
                <Card transparent>
                  <CardItem>
                    <Left>
                      <Thumbnail square source={IconeEscola} />
                      <Body>
                        <Text>Escola</Text>
                        <Text note style={styles.textoStyle}>{this.state.escola}</Text>
                        <Text note style={styles.textoStyle}>Ano Letivo: {this.state.anoLetivo}</Text>
                      </Body>
                    </Left>
                  </CardItem>
                </Card>
              </Animated.View>

            </View>

          </View>

          <Content padder>

            <View style={styles.containerBotoes}>

              <View style={styles.buttonstyle}>
                <TouchableOpacity style={styles.containerBotao} onPress={() => this.registroConteudo()}>
                  <Thumbnail square source={IconeConteudo} style={styles.imageStyle} />
                  <Text style={styles.textoStyle}>Registro Conteúdo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonstyle}>
                <TouchableOpacity style={styles.containerBotao} onPress={() => this.frequencias()}>
                  <Thumbnail square source={IconeFrequencias} style={styles.imageStyle} />
                  <Text style={styles.textoStyle}>Registro de Frequência</Text>
                </TouchableOpacity>
              </View>

            </View>

            <View style={styles.containerBotoes}>

              <View style={styles.buttonstyle}>
                <TouchableOpacity style={styles.containerBotao} onPress={() => this.formaAvaliacao()}>
                  <Thumbnail square source={IconeAvaliacao} style={styles.imageStyle} />
                  <Text style={styles.textoStyle}>Forma de Avaliação</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonstyle}>
                <TouchableOpacity style={styles.containerBotao} onPress={() => this.notas()}>
                  <Thumbnail square source={IconeNotas} style={styles.imageStyle} />
                  <Text style={styles.textoStyle}>Registro de Notas</Text>
                </TouchableOpacity>
              </View>

            </View>

          </Content>

          <Footer style={{ alignItems: 'center' }}>

            <Text style={{ fontSize: 10, color: 'white' }}>Siscol Mobile - Desenvolvido por RG System </Text>

          </Footer>

        </Container>
      </StyleProvider>
    );
  }
}

// Style da pagina
const styles = StyleSheet.create({
  containerBotoes: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', height: 90, marginBottom: 10 },
  buttonstyle: {
    flex: 1, width: 40, height: 90, borderRadius: 4, borderWidth: 0.5, backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: '#E0FFFF', marginLeft: 10, marginRight: 5, marginBottom: 10, marginTop: 15
  },
  containerBotao: { alignItems: 'center', borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.35)', height: 90 },
  imageStyle: { width: 62, height: 62, marginTop: 5, marginBottom: 5 },
  textoStyle: { fontSize: 10, fontWeight: '500' },

  containerProfessor: {
    backgroundColor: '#123751', height: 90, justifyContent: 'center', alignItems: 'center'
  },
  containerEscola: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', position: 'relative', top: -15, height: 90
  },
  containerItemEscola: {
    flex: 1, width: 120, height: 100,
    borderRadius: 4, borderWidth: 0.5, borderColor: '#123751',
    marginLeft: 5, marginRight: 5, marginBottom: 5
  },
  textoUsuario: {
    color: "#fff",
    fontSize: 12,
    fontWeight: '500'
  }
});
//Fim do style da pagina

