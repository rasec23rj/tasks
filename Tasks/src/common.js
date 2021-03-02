import {Alert } from 'react-native'

const server = 'http://192.168.1.107:3000'

function showError(err){
    Alert.alert('OPs! Ocorreu um Problema!', `Mensagem:  ${err}`)
}

export { server, showError }