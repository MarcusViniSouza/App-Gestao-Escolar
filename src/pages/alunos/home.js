import  React, { Component } from 'react';

import { DrawerActions, NavigationEvents } from 'react-navigation';

import { Body, Button, Badge, Container, 
         Content, Card, CardItem, Footer,
         FooterTab, Header, Icon, 
         Left, List, ListItem,
         Right, StyleProvider, Title, Text, Thumbnail, Toast } from 'native-base';

import { Animated,
         Easing,
         Dimensions,ProgressBarAndroid, StyleSheet, BackHandler, View, ScrollView, FlatList  } from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';

import '../../function/functions';

import { getApi }  from '../../services/api';

import AsyncStorage from '@react-native-community/async-storage';

import Load from '../../componentes/load';

import IconeEscola from './img/escola.png';
import Iconeusuario from './img/usuario.png';

export default class HomeAluno extends Component {
    static navigationOptions = {
        title: 'Menu',
        headerStyle: {backgroundColor: "#123751"},
        headerTintColor: "#FFF",
        header: null,
      }

      constructor(props){
        super(props);
        this.SlideInLeft = new Animated.Value(0);
        this.slideUpValue = new Animated.Value(0);

        this.state = {
          escola : this.props.navigation.getParam('escola'),
          codEscola : this.props.navigation.getParam('id'),
          usuario: '',
          idUsuario: '',
          idAnoLetivo: '',
          quantidadeNotificacoes: '',
          notificacoes : [],
          detalhamentoFinanceiro: []
        }
        
        this.usuarioLogado();
      }

      componentDidMount () {
        this.spring();
      }
  
      spring () {
        this.SlideInLeft.setValue(0);
        Animated.timing(this.SlideInLeft, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start()
      }

      exibirMensagem = (texto, tipo, posicao) => {
        Toast.show({
          text: texto,
          buttonText: "Ok",
          position: posicao,
          type: tipo,
          duration: 9000
        });
      }    

      handleUsuario = (value) => {
        this.setState({ usuario : value});
     }

     getIdUsuario = (value) => {
       this.setState({ idUsuario: value });
     }

     setDadosAnoLetivo = async (objeto) => {
      try {
        await AsyncStorage.setItem('dadosanoletivoaluno', JSON.stringify(objeto));
      } catch (e) {
        console.error('erro ao salvar dados do ano letivo.'); 
      }
    }

     getDadosAnoLetivo = async () => {
      try {
        let idAluno = this.state.idUsuario;
        let idEscola = this.state.codEscola;

        if (idAluno !== null && idEscola !== null){

          var parametros = {matricula: idAluno, escola: idEscola};

          const response = await getApi(`anosValidoAluno/${JSON.stringify(parametros)}`);

          this.setState({ idAnoLetivo : response.result[0].ID });

          this.setDadosAnoLetivo(response.result[0]);
        }
      } 
      catch (e){
        console.log(e);
      }
     }

      usuarioLogado = async () => {

        let infoUsuario = []; 
        AsyncStorage.getItem('dadosusuarioaluno').then(async res => {
          infoUsuario = JSON.parse(res)

          if (infoUsuario.ID !== null) {
            await this.handleUsuario(infoUsuario.NOME);
            await this.getIdUsuario(infoUsuario.ID);

            await this.getDadosAnoLetivo();
            await this.getNotificacoes();
          }
        });
     };

      setNotificacoes = (value) => {
       this.setState({ notificacoes : value, quantidadeNotificacoes : value.length });

       if (value.length > 0){
        this.exibirMensagem(`Atenção, existem (${value.length}) notificações não lidas!`,'danger', 'bottom');
       }
      }

      getNotificacoes = async () => {
      try {      
          var parametros = { todas: false, usuario: this.state.idUsuario };
          
          const response = await getApi(`NotificacoesAluno/${JSON.stringify(parametros)}`);
          
           await this.setNotificacoes(response.result);

           await this.getDetalhamentoFinanceiro();
          } catch (error){
              // console.log(error);
          }
      }

      logout(){
        const { navigate } = this.props.navigation;
        navigate('MainAluno');
      }

      visualizarNotificacoes = () =>{
        const { navigate } = this.props.navigation;
        navigate('NotificacaoAluno',{ notificacoes: this.state.notificacoes, idUsuario: this.state.idUsuario });
      }

      setDetalhamentoFinanceiro = (value) => {
        this.setState({ detalhamentoFinanceiro : value });

        // if (value.quantidade_vencido !== '0'){
        //   this.exibirMensagem('Existem Parcelas Vencidas!','danger', 'bottom');
        // }
      }

      getDetalhamentoFinanceiro = async () => {
        try{
          if (this.state.idAnoLetivo === ''){
            await this.getDadosAnoLetivo();
          }
          
          var parametros = {matricula: this.state.idUsuario, ano: this.state.idAnoLetivo};
  
          const response = await getApi(`DetalhamentoParcelas/${JSON.stringify(parametros)}`);

          this.setDetalhamentoFinanceiro(response.result);
        }catch(error){

        }
      }

    render(){
        return (
          <StyleProvider style={getTheme(material)}>  
            <Container style={{ backgroundColor: '#DCDCDC' }}>
              <NavigationEvents onWillFocus={() => {
                this.getNotificacoes();
              }}/>
              <Header>

                <Left>
                  <Button transparent  onPress={() => {this.props.navigation.dispatch(DrawerActions.openDrawer());} } >
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
                      <Badge danger>
                        <Text>{this.state.quantidadeNotificacoes}</Text>
                      </Badge>
                    }
                    <Icon name='notifications' />
                  </Button>

                  <Button small transparent onPress={() => this.logout()}>
                    <Icon name='md-log-out' />
                     <Text>
                      Sair
                     </Text>
                  </Button>
                </Right>
                      
              </Header>

              <View style={{flex: 1}}>

                 <View style={styles.containerProfessor}>
                  <Text style={styles.textoUsuario}>Olá, aluno(a)</Text>
                  <Text note style={styles.textoUsuario}>{this.state.usuario}</Text> 
                 </View> 

                <View style={styles.containerEscola}>

                  <Animated.View 
                   style={{flex: 1, width: 120, height: 90,
                    borderRadius: 4, borderWidth: 0.5, borderColor: '#123751',
                    marginLeft: 5, marginRight: 5, marginBottom: 5,
                    transform: [
                      {
                        translateX: this.SlideInLeft.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-600, 0]
                        })
                      }
                    ]}}>
                    <Card transparent>
                      <CardItem>
                        <Left>
                          <Thumbnail square source={IconeEscola} />
                        <Body>
                          <Text>Escola</Text>
                          <Text note>{this.state.escola}</Text>
                        </Body>
                        </Left>
                      </CardItem>
                    </Card>
                  </Animated.View >

                </View>

              </View>

              <Content padder>
                {/* <Card transparent>
                    <CardItem>
                      <Left>
                        <Thumbnail square source={Iconeusuario} />
                        <Body>
                          <Text>Usuário Logado(a)</Text>
                          <Text note>{this.state.usuario}</Text>
                        </Body>
                      </Left>
                    </CardItem>

                    <CardItem>
                      <Left>
                        <Thumbnail square source={IconeEscola} />
                        <Body>
                          <Text>Instituição</Text>
                          <Text note>{this.state.escola}</Text>
                        </Body>
                      </Left>
                    </CardItem>
                </Card> */}

              </Content>
                 <List>
                     <View style={styles.containerTituloDetalhamentoFinanceiro}>
                        <View style={styles.containerStyloTituloDetalhamentoFinanceiro}>
                         <Text style={styles.textoTituloDetalhamentoFinanceiro}>.: Detalhamento Financeiro</Text>
                        </View>
                     </View> 

                   <ScrollView>
                    <FlatList
                      data={this.state.detalhamentoFinanceiro}
                      renderItem={( { item } ) => (

                       <View style={styles.containerDetalhamentoFinanceiro}>
    
                           <View style={styles.containerItensDetalhamentoFinanceiro}>
                            <Card transparent>
                             <CardItem style={styles.containerCard}>
                              <Left>
                               <Icon name="md-checkmark-circle-outline" size={12} />

                               <Body>
                                <Text style={styles.textoDetalhamentoFinanceiro}>Qtde. Pagas: {item.quantidade_paga}</Text>
                                <Text note style={styles.textoDetalhamentoFinanceiro}>Total Pago</Text>
                                <Text note style={styles.textoDetalhamentoFinanceiro}>{item.total_pago}</Text>
                               </Body>
                              </Left>
                             </CardItem>
                            </Card>
                           </View>

                           <View style={styles.containerItensDetalhamentoFinanceiro}>
                            <Card transparent>
                             <CardItem style={styles.containerCard}>
                              <Left>
                               <Icon name="md-time" size={12} />

                               <Body>
                                <Text style={styles.textoDetalhamentoFinanceiro}>Qtde. Em Aberto: {item.quantidade_aberto}</Text>
                                <Text style={styles.textoVencidoDetalhamentoFinanceiro}>Qtde. Em Atraso: {item.quantidade_vencido}</Text>
                                <Text note style={styles.textoDetalhamentoFinanceiro}>Total Em Aberto</Text>
                                <Text note style={styles.textoDetalhamentoFinanceiro}>{item.total_aberto}</Text>
                               </Body>
                              </Left>
                             </CardItem>
                            </Card>
                           </View>


                       </View >

                      )}
                    />
                   </ScrollView> 
                 </List>

              <Footer style={{  alignItems: 'center' }}>
   
                    <Text style={{  fontSize: 10, color: 'white' }}>
                      Siscol Mobile - Desenvolvido por RG System
                    </Text>
  
              </Footer>

            </Container>
          </StyleProvider> 
        );
    }
}

// Style da pagina
const styles = StyleSheet.create({
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
  textoUsuario : {
    color: "#fff",
    fontSize: 12,
    fontWeight: '500'
  },
  containerDetalhamentoFinanceiro : {
    flexDirection: 'row', justifyContent: 'space-between',  height: 70, marginBottom: 10
  },
  containerItensDetalhamentoFinanceiro : {
    flex: 1, width: 120, height: 70, 
    borderRadius: 4, borderWidth: 0.5, borderColor: '#123751',
    marginLeft: 5, marginRight: 5, marginBottom: 10 
  },
  containerCard: { height: 60, backgroundColor: '#FFFFFF' },
  textoDetalhamentoFinanceiro : {
    fontSize: 10, fontWeight: '500'
  },
  textoVencidoDetalhamentoFinanceiro : {
    fontSize: 10, fontWeight: '500', color: '#FF0000'
  },
  containerTituloDetalhamentoFinanceiro : {
    flex: 1, flexDirection: 'column', justifyContent: 'center',
    alignItems: 'stretch'
  },
  containerStyloTituloDetalhamentoFinanceiro : {
    height: 50, backgroundColor: '#123751',
    borderRadius: 4, borderWidth: 0.5, borderColor: '#d6d7da',
    marginLeft: 5, marginRight: 5
  },
  textoTituloDetalhamentoFinanceiro : {
    color: '#FFFFFF', marginLeft: 5
  }
});
//Fim do style da pagina
