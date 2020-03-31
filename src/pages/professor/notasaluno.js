import  React, { Component } from 'react';

import { DrawerActions } from 'react-navigation';

import { Container, 
        Header, Left, Body, 
        StyleProvider , Button, 
        Icon, Input, Item, Title, Text, Badge,
        Content, List, ListItem, 
        Right, Separator, SwipeRow,
        Thumbnail, Toast  } from 'native-base';

import { Modal, TouchableHighlight, View, Alert, 
         StyleSheet, FlatList, TextInput, ScrollView } from 'react-native';

import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';
import platform from '../../../native-base-theme/variables/platform';

import Aluno from './img/boy.png';
import Prova from './img/prova.png';
import { getApi, postApi }  from '../../services/api';
import Load from '../../componentes/load';
import { stylesPadrao } from '../../style/style';

export default class NotasAluno extends Component {
      static navigationOptions = {
        title: 'Notas por Aluno',
        headerStyle: {backgroundColor: "#007AFF"},
        headerTintColor: "#FFF",
        header: null,
      }

      constructor(props){
        super(props);

        this.state = {
          id: this.props.navigation.getParam('id'),  
          nome : this.props.navigation.getParam('nome'),
          serie: this.props.navigation.getParam('serie'),
          escola: this.props.navigation.getParam('escola'),
          ano: this.props.navigation.getParam('ano'),
          professor: this.props.navigation.getParam('professor'),
          etapa: this.props.navigation.getParam('etapa'),
          imagem: this.props.navigation.getParam('icone'),
          turma: this.props.navigation.getParam('turma'),
          usuario: this.props.navigation.getParam('usuario'),
          etapaEncerrada: false,
          disciplinas: [],
          avaliacoes: [],
          carregando: false,
          grade: '',
          modalVisible: false 
        }

        this.getDisciplinas();
      }

      salvarNotas = async () =>{
        let registros = [];
        let erro = false;
        for (var i = 0, l = this.state.avaliacoes.length; i < l; i++) {
          const arrayAvaliacoes = {
           id_user: this.state.usuario,
           id_nota: this.state.avaliacoes[i].ID_NOTA,
           matricula: this.state.id,
           nota: this.state.avaliacoes[i].NOTA,
           id : this.state.avaliacoes[i].CODNOTA
          }

          const response = await getApi(`SalvarNotas/${JSON.stringify(arrayAvaliacoes)}`);

          if (response <= 0) {
             erro = true;
          }
        }

        if (erro === false){
          this.setModalVisible(!this.state.modalVisible,false,0);
        } else if (erro === true) {
          Toast.show({
                    text: "erro ao salvar notas!",
                    buttonText: "Ok",
                    type: "danger"
                  });
        }
      }

      editarNota = (text,item) => {
         let idx = this.state.avaliacoes.indexOf(item);

         if (parseFloat(text) > parseFloat(this.state.avaliacoes[idx].VALOR)){
           Alert.alert('Atenção!','Valor Informada não pode ser maior que a nota total da avaliação!');
         } else {
          this.state.avaliacoes[idx].NOTA = text;
         }

      }

      setEtapaEncerrada = (value) => {
        this.setState({ etapaEncerrada : value });
      }
    
      getEtapaEncerrada = async (grade) => {
        try {
          const response = await getApi(`EtapaEncerrada/${this.state.ano}/${grade}/${this.state.turma}/${this.state.etapa}`);
    
          this.setEtapaEncerrada(response.result);
        } catch (error) {
    
        }
      }

      setModalVisible(visible,cancelar,idGrade) {

          if (visible === false && cancelar === false){
            Toast.show({
              text: "Registros Salvo com Sucesso!",
              buttonText: "Ok",
              type: "success"
            });
  
            this.getDisciplinas();
          }
          
          if (visible === true && idGrade > 0){
             this.getAvaliacoes(idGrade);
          }
  
          this.setState({modalVisible: visible});
      }  

      setAvaliacoes = (value) =>{
        this.setState({ avaliacoes: value });
      }
      
      getAvaliacoes = async (idGrade) => {
          try{
            var parametros = { turma: this.state.turma,
                               grade: idGrade,
                               matricula: this.state.id,
                               etapa: this.state.etapa,
                               avaliacao: '0'
                              };

             if (parametros !== null){
                    
                const response = await getApi(`ListAvaliacoesAluno/${JSON.stringify(parametros)}`);
                    
                await this.setAvaliacoes(response.result);

                await this.getEtapaEncerrada(idGrade);

                if (this.state.avaliacoes.length <= 0){
                  Alert.alert('Atenção!','Nenhum avaliação cadastrada para esta discíplina!');
                  this.setModalVisible(!this.state.modalVisible,true,0);
                }
            }
          }
          catch(e){
            console.log(e);
          }
      }

      setDisciplinas = (value) =>{
        this.setState({ disciplinas: value });
      }

      getDisciplinas = async () => {
        try {
          var parametros = { serie: this.state.serie, 
                             escola: this.state.escola, 
                             ano: this.state.ano,
                             professor: this.state.professor,
                             turma: this.state.turma,
                             etapa: this.state.etapa,
                             matricula: this.state.id };

          if (parametros !== null){

            this.setState({ carregando: true });

            const response = await getApi(`ListaDisciplinasAluno/${JSON.stringify(parametros)}`);

            await this.setDisciplinas(response.result);

            this.setState({ carregando: false });
          }
        } 
        catch (e){
          console.log(e);
        }
      }
    render(){
        return (
          <StyleProvider style={getTheme(material)}>  
            <Container>
              <View >
                <Modal
                  animationType="slide"
                  transparent={false}
                  visible={this.state.modalVisible}
                  onRequestClose={() => {
                    Alert.alert('Para fechar clique em Cancelar.');
                  }}>
                  <View style={{marginTop: 22}}>
                    <View>

                    <ScrollView>
                    { 
                      this.state.carregando &&
                      <Load texto={'Aguarde Carregando os registros..'} />
                    } 
                    {
                      !this.state.carregando &&  
                          <List>
                            <FlatList
                              data={this.state.avaliacoes}
                              keyExtractor={(item, index) => item.ID}
                              renderItem={( { item } ) => (
                                <ListItem avatar>
                                    <Left>
                                      <Thumbnail square source={Prova} />
                                    </Left>
                                    <Body>
                                      <Text style={{fontSize: 10}}>{item.DESCRICAO}</Text>
                                      <Text note style={{fontSize: 9}}>Valor: {item.VALOR}</Text>
                                      <Text note style={{fontSize: 9}}>Tipo: {item.TIPO_NOTA}</Text>


                                      <Text note>Informe abaixo a nota:</Text>
                                      <TextInput
                                        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                                        editable={!this.state.etapaEncerrada}
                                        placeholder="Nova nota"
                                        keyboardType={'number-pad'}
                                        maxLength={20}
                                        onChangeText={(text) => this.editarNota(text,item)}
                                      />
                                    </Body>

                                    <Right>
                                      { item.NOTA < 6 &&
                                        <Badge danger>
                                          <Text>Nota: {item.NOTA}</Text> 
                                        </Badge> }
                                      {
                                        item.NOTA >= 6 &&
                                        <Badge success>
                                          <Text>Nota: {item.NOTA}</Text>
                                        </Badge>
                                      }
                                    </Right>
                                </ListItem>
                              )}
                            />
                          </List>
                     }
                    
                    {
                      this.state.etapaEncerrada === false &&
                      <View style={styles.bottonSalvar}>
                        <Button block success 
                              style={{ marginLeft: 10, marginRight: 10, marginBottom: 20}}
                              onPress={() => this.salvarNotas()}>
                          <Text>Salvar</Text>
                        </Button> 

                        <Button block danger 
                              style={{ marginLeft: 10, marginRight: 10, marginBottom: 20}}
                              onPress={() => {this.setModalVisible(!this.state.modalVisible,true,0);}}>
                          <Text>Cancelar</Text>
                        </Button> 
                      </View>
                    }

                    </ScrollView>
                        
                    </View>

                  </View>
                </Modal>
              </View>

              <Header>
                <Left>
                  <Button transparent onPress={() => {this.props.navigation.navigate('Notas');} } >
                    <Icon name='arrow-back' />
                  </Button>
                </Left>

                <Body>
                  <Title>Notas do Aluno</Title>
                </Body>
                
              </Header>

              <Content> 
                  <List>
                    <ListItem thumbnail>

                      <Left>
                        <Thumbnail square source={this.state.imagem} />
                      </Left>

                      <Body>
                      <Text>Aluno</Text>
                        <Text style={{fontSize: 12}}>{this.state.nome}</Text>
                      </Body>
            
                    </ListItem>
                  </List>

              { 
                 this.state.carregando &&
                 <Load texto={'Aguarde Carregando os registros..'} />
                } 
                {
                 !this.state.carregando &&
                 <List>
                  <FlatList
                    data={this.state.disciplinas}
                    keyExtractor={(item, index) => item.CSI_CODGRA}
                    renderItem={( { item } ) => (
                      <ListItem icon>
                         {
                           this.state.etapaEncerrada === false &&
                          <Left>
                            <Button style={{ backgroundColor: "#007AFF" }}
                            onPress={() => {this.setModalVisible(!this.state.modalVisible,true,item.CSI_CODGRA)}} >
                              <Icon active name="create" />
                            </Button>
                          </Left>
                         }
                          <Body>
                            <Text>{item.DISCIPLINA}</Text>
                          </Body>

                          <Right>
                            <Badge info>
                              <Text>{item.NOTA}</Text>
                            </Badge>
                          </Right>
                      </ListItem>
                    )}
                  />
                </List>
               } 

         
               </Content>

            </Container>
          </StyleProvider> 
        );
    }
}

const styles = StyleSheet.create({
  bottonSalvar: {
    marginTop : 5,
    marginBottom: 2
  }
});

