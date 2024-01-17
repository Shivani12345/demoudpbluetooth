import React from 'react';
import {View} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
// import ClientScreen from './src/screens/ClientScreen';
// import ServerScreen from './src/screens/ServerScreen';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      device: undefined,
      bluetoothEnabled: true,
    };
  }
  componentDidMount() {
    WifiManager.getCurrentWifiSSID().then(
      ssid => {
        console.log('Your current connected wifi SSID is ' + ssid);
      },
      () => {
        console.log('Cannot get current SSID!');
      },
    );
  }
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'pink'}}></View>
      // <NativeBaseProvider>
      //   {!this.state.device ? <ServerScreen /> : <ClientScreen />}
      // </NativeBaseProvider>
    );
  }
}
