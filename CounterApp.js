import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  Pressable,
  FlatList,
  Platform,
  NativeModules,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeEventEmitter,
  PermissionsAndroid,
} from 'react-native';
import Background from './src/components/Background';
import BleManager from 'react-native-ble-manager';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default function CounterApp() {
  const [state, setState] = useState(0);
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [errorObj, setErrorObj] = useState({});

  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState([]);
  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };

  const handleDisconnectedPeripheral = data => {
    console.log('handleDisconnectedPeripheral ', data);
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setBluetoothDevices(Array.from(peripherals.values()));
    }
    console.log('Disconnected from ' + data.peripheral);
  };

  const handleUpdateValueForCharacteristic = data => {
    console.log(
      'Received data from ' +
        data.peripheral +
        ' characteristic ' +
        data.characteristic,
      data.value,
    );
  };

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length == 0) {
        console.log('No connected peripherals');
      }
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setBluetoothDevices(Array.from(peripherals.values()));
      }
    });
  };

  const handleDiscoverPeripheral = peripheral => {
    console.log('handleDiscoverPeripheral ', peripheral);
    peripheral.name =
      peripheral.advertising.localName || peripheral.name || 'NO NAME';

    peripherals.set(peripheral.id, peripheral); // ERROR: peripheral.id is undefined
    setBluetoothDevices(Array.from(peripherals.values()));
  };
  useEffect(() => {
    BleManager.start({showAlert: true}).then(() => {
      // Success code
      console.log('Moduleinitialized!@@#!@#@#!@#');
    });

    // BleManager.start({showAlert: false});

    // BleManagerEmitter.addListener(
    //   'BleManagerDiscoverPeripheral',
    //   handleDiscoverPeripheral,
    // );
    // BleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    // BleManagerEmitter.addListener(
    //   'BleManagerDisconnectPeripheral',
    //   handleDisconnectedPeripheral,
    // );
    // BleManagerEmitter.addListener(
    //   'BleManagerDidUpdateValueForCharacteristic',
    //   handleUpdateValueForCharacteristic,
    // );

    // fetchItem();
    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth is enabled');
      })
      .catch(error => {
        console.log('Error enabling Bluetooth:', error);
      });

    // // start bluetooth manager
    // BleManager.start({showAlert: false}).then(() => {
    //   console.log('BLE Manager initialized');
    // });

    // let stopListener = BleManagerEmitter.addListener(
    //   'BleManagerStopScan',
    //   () => {
    //     setIsScanning(false);
    //     console.log('Scan is stopped');
    //     handleGetConnectedDevices();
    //   },
    // );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(result => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(result => {
            if (result) {
              console.log('User accept');
            } else {
              console.log('User refuse');
            }
          });
        }
      });
    }

    // return () => {
    //   stopListener.remove();
    // };
  }, []);

  const startScan = () => {
    // if (!isScanning) {
    //   BleManager.scan([], 5, true)
    //     .then(results => {
    //       console.log('startScan#!!@', results);
    //       setIsScanning(true);
    //     })
    //     .catch(error => {
    //       console.log('startScan error#!!@', error);
    //       console.error(error);
    //     });
    // }
    if (!isScanning) {
      BleManager.scan([], 3, true)
        .then(results => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

  const handleGetConnectedDevices = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      console.log('results#!!@', results);
      if (results.length == 0) {
        console.log('No connected bluetooth devices');
      } else {
        for (let i = 0; i < results.length; i++) {
          let peripheral = results[i];
          peripheral.connected = true;
          peripherals.set(peripheral.id, peripheral);
          setConnected(true);
          setBluetoothDevices(Array.from(peripherals.values()));
        }
      }
    });
  };

  const connectToPeripheral = peripheral => {
    console.log('peripheral!@!', peripheral);
    if (peripheral.connected) {
      BleManager.disconnect(peripheral.id).then(() => {
        peripheral.connected = false;
        setConnected(false);
        alert(`Disconnected from ${peripheral.name}`);
      });
    } else {
      BleManager.connect(peripheral.id)
        .then(() => {
          let peripheralResponse = peripherals.get(peripheral.id);
          if (peripheralResponse) {
            peripheralResponse.connected = true;
            peripherals.set(peripheral.id, peripheralResponse);
            setConnected(true);
            setBluetoothDevices(Array.from(peripherals.values()));
          }

          BleManager.createBond(peripheral.id)
            .then(() => {
              console.log('Bluetooth device paired successfully!');
              alert('Connected to ' + peripheral.name);
            })
            .catch(() => {
              console.log('failed to pair');
            });
        })
        .catch(error => console.log(error));

      /* Read current RSSI value */
      setTimeout(() => {
        BleManager.retrieveServices(peripheral.id).then(peripheralData => {
          console.log('Peripheral services:', peripheralData);
        });
      }, 900);
    }
  };
  // render list of bluetooth devices
  const RenderItem = ({peripheral}) => {
    console.log('RenderItem', peripheral);
    const color = peripheral.connected ? 'green' : '#fff';

    return (
      <>
        <Text
          style={{
            fontSize: 20,
            marginLeft: 10,
            marginBottom: 5,
            color: Colors.white,
          }}>
          Nearby Devices:
        </Text>

        <TouchableOpacity onPress={() => connectToPeripheral(peripheral)}>
          <View
            style={{
              backgroundColor: color,
              borderRadius: 5,
              paddingVertical: 5,
              marginHorizontal: 10,
              paddingHorizontal: 10,
            }}>
            <Text
              style={{
                fontSize: 18,
                textTransform: 'capitalize',
                color: connected ? Colors.white : Colors.black,
              }}>
              {peripheral.name}
            </Text>

            <View
              style={{
                backgroundColor: color,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: connected ? Colors.white : Colors.black,
                }}>
                RSSI: {peripheral.rssi}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: connected ? Colors.white : Colors.black,
                }}>
                ID: {peripheral.id}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const counterAdd = () => {
    setState(prevState => prevState + 1);
  };

  const counterRemove = () => {
    setState(prevState => prevState - 1);
  };

  if (state < 0) {
    // throw new Error('Value should be Postitive');
  }
  renderCats = ({item}) => (
    <View style={{marginTop: 0}}>
      <Text>{item.breed}</Text>
    </View>
  );
  const fetchItem = () => {
    // throw new Error('fwegtr');

    fetch(`https://catfact.ninja/breeds`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log('responseJson@@', responseJson);
        if (responseJson.data) {
          console.log('responseJson@@', 'yeesss');
          setData(responseJson.data);
          setIsError(false);
        } else {
          console.log('responseJson@@', 'NOO', responseJson.message);
          // setTimeout(() => {
          setErrorObj(responseJson);
          setIsError(true);
          // }, 1000);
        }
      })
      .catch(error => {
        setIsError(true);
        setErrorObj(responseJson);
        console.log('error', error);
      });
  };
  return (
    <Background isError={isError} errorObj={errorObj}>
      <View
        style={{
          justifyContent: 'center',
          marginVertical: 20,
          alignItems: 'center',

          flexDirection: 'row',
        }}>
        <Pressable
          onPress={() => {
            counterAdd();
          }}
          android_ripple={{color: 'silver'}}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 6,
            backgroundColor: 'silver',
          }}>
          <Text> + </Text>
        </Pressable>

        <Text style={{paddingHorizontal: 6}}> {state} </Text>

        <Pressable
          onPress={() => {
            counterRemove();
          }}
          android_ripple={{color: 'silver'}}
          style={{
            paddingHorizontal: 20,

            paddingVertical: 6,

            backgroundColor: 'silver',
          }}>
          <Text> - </Text>
        </Pressable>
      </View>

      {/* <FlatList
        removeClippedSubviews={true}
        data={data}
        renderItem={item => this.renderCats(item)}
      /> */}

      <ScrollView
        style={{backgroundColor: Colors.darker}}
        contentContainerStyle={styles.mainBody}
        contentInsetAdjustmentBehavior="automatic">
        <View
          style={{
            backgroundColor: Colors.darker,
            marginBottom: 40,
          }}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.buttonStyle}
            onPress={startScan}>
            <Text style={styles.buttonTextStyle}>
              {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* list of scanned bluetooth devices */}
        {bluetoothDevices.map(device => (
          <View key={device.id}>
            <RenderItem peripheral={device} />
          </View>
        ))}
      </ScrollView>
    </Background>
  );
}

const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    justifyContent: 'center',
    height: windowHeight,
  },
  buttonStyle: {
    backgroundColor: '#307ecc',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#307ecc',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 15,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
});
