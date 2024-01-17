// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import React from 'react';
// import ErrorBoundary from 'react-native-error-boundary';
// import {Button} from 'react-native-paper';
// import {SafeAreaView, View} from 'react-native';
// import CounterApp from './CounterApp';
// // import DrawerComponent from './src/components/Drawer/Drawer';
// function App(): JSX.Element {
//   return (
//     <SafeAreaView style={{flex: 1}}>
//       <CounterApp />
//       {/* <DrawerComponent></DrawerComponent> */}
//     </SafeAreaView>
//     // <ErrorBoundary>
//     //   <CounterApp />
//     // </ErrorBoundary>
//   );
// }

// export default App;

import React, {useState, useEffect} from 'react';
import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import { v4 as uuidv4 } from 'uuid';
import BleManager, {ConnectionPriority} from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  useEffect(() => {
    uuidv4();
    const subscription = BluetoothSerial.addListener('bluetoothEnabled', () => {
      setIsEnabled(true);
    });

    const subscription2 = BluetoothSerial.addListener(
      'bluetoothDisabled',
      () => {
        setIsEnabled(false);
      },
    );

    BluetoothSerial.isEnabled().then(enabled => {
      ConnectionCheck(enabled);
    });

    return () => {
      subscription.remove();
      subscription2.remove();
    };
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]).then(result => {
        if (result) {
          console.log('User accept');
          ConnectionCheck();
        } else {
          console.log('User refuse');
        }
      });
    }
  }, []);
  const ConnectionCheck = async isEnabled => {
    // const isEnabled = await BluetoothSerial.isEnabled();
    console.log('isEnabled', isEnabled);
    if (isEnabled) {
      // const devices = await BluetoothSerial.list();
      // console.log('devices', devices);
      // const devicesUnpaired = await BluetoothSerial.listUnpaired();
      // console.log('devicesUnpaired', devicesUnpaired);
      const devicesDiscover = await BluetoothSerial.discoverUnpairedDevices();
      console.log('devicesDiscover', devicesDiscover);

      const notnulldevices = devicesDiscover.filter(item => Boolean(item.name));
      console.log('notnulldevices', notnulldevices);
      setList(notnulldevices);
    } else {
      BluetoothSerial.requestEnable()
        .then(enabled => {
          if (enabled) {
            console.log('Bluetooth is enabled');
          } else {
            console.log('Bluetooth is not enabled');
          }
        })
        .catch(error => {
          console.error(error);
        });
    } //BluetoothSerial.requestEnable();
  };
  const testPeripheral = async (item: any) => {
    const device = await BluetoothSerial.pairDevice(item.id);
    console.log('testPeripheral', device);
  };
  const renderItem = (item: any) => {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => testPeripheral(item)}>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: '#333333',
              padding: 10,
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 10,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
            }}>
            RSSI: {item.rssi}
          </Text>
          <Text
            style={{
              fontSize: 8,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
              paddingBottom: 20,
            }}>
            ID: {item.id}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <Text style={{textAlign: 'center'}}>
              {deviceName}
              {isEnabled ? 'Bluetooth is enabled' : 'Bluetooth is disabled'}
            </Text>

            {list.length == 0 && (
              <View style={{flex: 1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>No peripherals</Text>
              </View>
            )}
          </View>
        </ScrollView>
        <FlatList
          data={list}
          renderItem={({item}) => renderItem(item)}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;

// import BluetoothSerial from 'react-native-bluetooth-serial-next';
// import RNFS from 'react-native-fs';

// const filePath = '/path/to/file.txt';
// const deviceAddress = 'AA:BB:CC:DD:EE:FF'; // address of the target device

// BluetoothSerial.connect(deviceAddress)
//   .then(() => {
//     console.log('Connected to device');
//     return RNFS.readFile(filePath, 'base64');
//   })
//   .then((fileData) => {
//     console.log(`File loaded (${fileData.length} bytes), sending...`);
//     return BluetoothSerial.writeToDevice(fileData);
//   })
//   .then(() => {
//     console.log('File sent successfully');
//   })
//   .catch((error) => {
//     console.error('Error while sending file', error);
//   });
