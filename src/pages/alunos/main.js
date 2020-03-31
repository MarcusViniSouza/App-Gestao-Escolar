import  React, { Component } from 'react';

import axios from 'axios';

import {
  Animated,
  Image,
  Easing,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Alert,
  Picker,
  CheckBox
} from 'react-native';

import { Button, ActionSheet } from 'native-base';

import bgImagem from '../../imagens/Fundo.png';
import logo from '../../imagens/icon.png';
import Icon from "react-native-vector-icons/Ionicons";

import { getApi }  from '../../services/api';
import Internet from '../../componentes/internet';

import Loader from '../../componentes/loader';

import { setRegistroStorage, getRegistroStorage } from '../../services/storage';

import { Popup } from 'popup-ui';

const { width: WIDTH } = Dimensions.get('window');

export default class MainAluno extends Component {
    
    static navigationOptions = {
      title: 'Login',
      headerStyle: {backgroundColor: "#123751"},
      headerTintColor: "#FFF",
      header: null, 
    }

    constructor(props){
      super(props);
      this.slideUpValue = new Animated.Value(0);
      
      this.state = {
        loading: false,
        showPass: true,
        press: false,
        usuario: '',
        senha: '',
        chaveEscola: 0,
        nomeMunicipio: '',
        escolas:[
          { municipio: "Barra de São Francisco", ip: "177.54.97.63:217" },
          { municipio: "São Gabriel da Palha", ip: "177.70.4.134:8090" },
          { municipio: "São Mateus - Master Técnico", ip: "192.168.1.124:217" },
          { municipio: "São Mateus - Master Basico", ip: "189.113.15.234:5032" },
          { municipio: "Vila Valério", ip: "192.168.1.252:217"} 
         ] ,
        opcoesEnvioSenha : [{tipo: "Email"},{tipo: "SMS"}]
      }

      this.getUsuarioStorage();
    }

    componentDidMount () {
      this.spring();
    }

    spring () {
      this.slideUpValue.setValue(0)
      Animated.timing(this.slideUpValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start()
    }

    handleUsuario = (usuario) => {
      this.setState({ usuario })
    }
    
    handleSenha = (value) => {
      this.setState({ senha : value })
    }
    
    getUsuarioStorage = async () =>{
      const usuario = await getRegistroStorage('dadosusuarioaluno');

      if (usuario) {
        const { ID, CSI_SENHA } = usuario;

        await this.handleUsuario(ID);
        await this.handleSenha(CSI_SENHA);
      }
    }
   setServidorPorta = async (servidor) => {
    try {
      await setRegistroStorage('enderecoServer', servidor);

    } catch (e) {
      console.error('erro ao salvar Servidor e Porta.');
    }
  }

  setDadosUsuario = async (usuario) => {
    try {
      await setRegistroStorage('dadosusuarioaluno', usuario);
    } catch (e) {
      console.error('erro ao salvar dados do usuário.'); 
    }
  }

  enviarSenha = async () => {
    try {
      if (this.state.nomeMunicipio === '') {
        this.mensagem('Warning', 'Selecione um municipio!');
      } else {
      var parametros = {user: this.state.usuario, tipo: 'A'};

      const response = await getApi(`EnviarSenha/${JSON.stringify(parametros)}`);

      const {result, msg} = response.result[0];

      this.mensagem('Warning', msg);
    }

    } catch (error) {
      this.mensagem('Danger', msg);
    }
  }

  handleChaveEscolar = (text) => {
    if (text !== ''){
      this.setState({ chaveEscola: text, nomeMunicipio: this.state.escolas[text].municipio });
  
      this.setServidorPorta(this.state.escolas[text]);
    } else {
      this.mensagem('Warning','Selecione um municipio!');
    }
   }
   

   handleSignInPress = async () => {

     var MD5 = function(d){result = M(V(Y(X(d),8*d.length)));return result.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

     if (this.state.nomeMunicipio === ''){
        this.mensagem('Warning','Selecione um municipio!');
     } else if (this.state.usuario === '' || this.state.senha === '') {
       this.mensagem('Warning','Prenche o Usuário e Senha para continuar!');
     } else {
        let user = this.state.usuario;
        let pass = this.state.senha;
        
        try {

          this.setState({loading : true}); 

          const response = await getApi(`logarAluno/${user}/${pass}`);
        
          const { ID, NOME, EMAIL, CSI_SENHA } = response.result[0];

          if (NOME !== ''){

            this.setDadosUsuario(response.result[0]);

            const { navigate } = this.props.navigation;
            navigate('EscolaAluno',{codigo: ID});

          } else {
            this.mensagem('Danger','Houve um problema com o login, verifique suas credenciais!');
          }
        } 
        catch (e){
          this.mensagem('Warning','Não foi possivel estabelecer conexão com o servidor, Verifique sua conexão com a internet!');
        }
    }

    this.setState({loading : false}); 
    
  };

  selecionarTipoUsuario = () => {
    const { navigate } = this.props.navigation;
    navigate('Usuario');
  }
  
    showPass() {
      this.state.press === false
        ? this.setState({showPass: false, press: true})
        : this.setState({showPass: true, press: false});
    }

    mensagem = (type, textBody) => {
      Popup.show({
        type: type,
        title: 'Atenção',
        button: false,
        textBody: textBody,
        buttontext: 'Ok',
        callback: () => Popup.hide()
      });
    }

    render(){
      console.disableYellowBox = true;
        return (
            <ImageBackground source={bgImagem} style={styles.backgroundContainer}>

              <Popup />
              <Internet />

              <Loader loading={this.state.loading} texto={'Aguarde'} />
              
              <View style={styles.logoContainer}>
              <Animated.Image 
                 style={{
                    width: 120,
                    height: 120,
                    transform: [
                      {
                        translateY: this.slideUpValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [600, 0]
                        })
                      }
                    ]
                  }}
                  source={logo}/>
                <Text style={styles.logoText}>Siscol Mobile</Text>
              </View>

              <View styles={styles.inputContainer}>
                <Icon name={'md-cloud-outline'} 
                      size={28} 
                      color={'rgba(255,255,255,0.7)'}
                      style={styles.inputIcon}/>

                <View style={styles.inputServidor}> 
                  <Button transparent
                          onPress={() =>
                          ActionSheet.show(
                            {
                              options: 
                              this.state.escolas.map( (item, index) =>{
                                return item.municipio
                                }),
                              title: "Municipios"
                            },
                            buttonIndex => {
                              this.handleChaveEscolar(buttonIndex)
                            }
                          )}
                        >
                          {
                            this.state.nomeMunicipio === '' &&
                            <Text style={styles.textDescricaoStyle}>
                              Selecione um Municipio
                            </Text>
                          }
                          {
                            this.state.nomeMunicipio !== '' &&
                            <Text style={styles.textDescricaoStyle}>
                              {this.state.nomeMunicipio}
                            </Text>
                          }
                        </Button>

                 </View>
              </View>

              <View styles={styles.inputContainer}>
                <Icon name={'md-person'} 
                      size={28} 
                      color={'rgba(255, 255, 255, 0.7)'}
                      style={styles.inputIcon}/>
                <TextInput 
                  style={styles.input}
                  value={this.state.usuario}
                  placeholder={'Matricula'}
                  keyboardType="numeric"
                  placeholderTextColor={'rgba(255, 255, 255, 0.7)'}
                  underlineColorAndroid='transparent'
                  autoCapitalize = "none"
                  onChangeText = {this.handleUsuario}
                  onSubmitEditing={()=>this.secondTextInput.focus()}
                  returnKeyType ={'next'}
                />
              </View>

              <View styles={styles.inputContainer}>
                <Icon name={'md-lock'} 
                      size={28} 
                      color={'rgba(255,255,255,0.7)'}

                      style={styles.inputIcon}
                />
                <TextInput 
                  style={styles.input}
                  value={this.state.senha}
                  placeholder={'Senha'}
                  secureTextEntry={this.state.showPass}
                  placeholderTextColor={'rgba(255,255,255,0.7)'}
                  underlineColorAndroid='transparent'
                  autoCapitalize = "none"
                  onChangeText = {this.handleSenha}
                  ref={(input)=>this.secondTextInput = input}
                  returnKeyType ={'go'}
                />

                <TouchableOpacity style={styles.btnEye}
                  onPress={this.showPass.bind(this)}>
                  <Icon name={this.state.press == false ? 'md-eye' : 'md-eye-off'} 
                        size={26}
                        color={'rgba(255,255,255,0.7)'}
                        />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnLogin}
                                onPress = {this.handleSignInPress}
               >
                  <Text style={styles.text}>
                    Logar
                  </Text>
             </TouchableOpacity>

             {/* <TouchableOpacity style={styles.btnVoltar}
                                onPress = {this.selecionarTipoUsuario}
               >
                  <Text style={styles.text}>
                    Voltar
                  </Text>
             </TouchableOpacity> */}

             <Button transparent
               onPress={() =>
               ActionSheet.show(
                 {
                   options: 
                   this.state.opcoesEnvioSenha.map( (item, index) =>{
                     return item.tipo
                     }),
                   title: "Enviar Senha Para"
                 },
                 buttonIndex => {
                   this.enviarSenha()
                 }
               )}
             >
               <Text style={styles.textDescricaoStyle}>
                 Solicitar Senha!
               </Text>
              
             </Button>

            </ImageBackground>   
        );
    }
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: null,
    height: null,
    justifyContent: 'center',
    alignItems: 'center',
  },
    welcome: {
      fontSize: 12,
      textAlign: 'center',
      margin: 10,
      fontFamily: 'Fira Code',
      color: '#4682B4'
    },
    logo: {
      width: 120,
      height: 120
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 30
    },
    logoText: {
      color: 'white',
      fontSize: 20,
      fontWeight: '500',
      marginTop: 10,
      opacity: 0.5
    },
    input: {
      width: WIDTH - 55,
      height: 45,
      borderRadius: 45,
      fontSize: 16,
      paddingLeft: 45,
      backgroundColor: 'rgba(0,0,0,0.35)',
      color: 'rgba(255,255,255,0.7)',
      marginHorizontal: 25,
      marginTop: 10
    },
    inputServidor: {
      width: WIDTH - 55,
      height: 45,
      borderRadius: 45,
      fontSize: 16,
      paddingLeft: 45,
      backgroundColor: 'rgba(0,0,0,0.35)',
      color: 'rgba(255,255,255,0.7)',
      marginHorizontal: 25,
      marginTop: 10
    },
    inputIcon: {
      position: 'absolute',
      top: 17,
      left: 37
    },
    inputContainer: {
      marginTop: 5,
    },
    btnEye: {
      position: 'absolute',
      top: 17,
      right: 37
    },
    btnLogin: {
      width: WIDTH - 55,
      height: 45,
      borderRadius: 45,
      backgroundColor: '#4682B4',
      justifyContent: 'center',
      marginTop: 20
    },
    btnVoltar:{
      width: WIDTH - 55,
      height: 45,
      borderRadius: 45,
      backgroundColor: '#CD5C5C',
      justifyContent: 'center',
      marginTop: 20
    },
    text: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 16,
      textAlign: 'center'
    },
    pickeStyle:{
      color: 'rgba(255,255,255,0.7)'
    }  ,
    textDescricaoStyle: {
      fontSize: 16,
      fontWeight: '500',
      color: 'rgba(255,255,255,0.7)'
     } 
  });