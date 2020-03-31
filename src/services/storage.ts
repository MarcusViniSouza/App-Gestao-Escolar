import AsyncStorage from '@react-native-community/async-storage';


//Funções Genericas
export async function setRegistroStorage(chave: string, valor: any) : Promise<boolean> {
    try {
      await AsyncStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (e) {
        return false;
    }
}

export async function getRegistroStorage(chave: string) : Promise<any> {
    try {
        const valor = await AsyncStorage.getItem(chave);
        return JSON.parse(valor);
    } catch (e) {
        return false;
    }
}
//Fim Funções Genericas

export async function salvarStorage(chave: 'dadosFiltro', valor: any): Promise<boolean> {
    try {
        await AsyncStorage.setItem(chave, JSON.stringify(valor));
        return true;
    } catch (e) {
        return false;
    }
}

export async function buscarStorage(chave: 'dadosFiltro'): Promise<any> {
    try {
        const valor = await AsyncStorage.getItem(chave);
        return JSON.parse(valor);
    } catch (e) {
        return false;
    }
}

export async function removeItemValue(chave: 'dadosFiltro') {
    try {
        await AsyncStorage.removeItem(chave);
        return true;
    }
    catch (e) {
        return false;
    }
}

export async function listaChavesStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('chaves armazenadas', keys);
      return keys;

    } catch(e) {
      return false;
    }
}