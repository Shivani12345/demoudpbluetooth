import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, Button, TextInput, StyleSheet, Image} from 'react-native';
import UdpSocket from 'react-native-udp';
import {NetworkInfo} from 'react-native-network-info';
import DocumentPicker, {types} from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
export default function App() {
  const [isServer, setIsServer] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [socket, setSocket] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ipServer, setIpServer] = React.useState('IP Server');

  const [fileResponse, setFileResponse] = useState([]);
  const [fileBase, setFileBase] = useState('');

  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await NetworkInfo.getIPV4Address();
      console.log('fetchIpAddress', ip);
      setIpAddress(ip);
    };

    fetchIpAddress();

    if (isServer) {
      // Configura la aplicación como servidor
      const server = UdpSocket.createSocket({type: 'udp4', debug: true});

      server.on('message', (data, rinfo) => {
        setMensaje(data.toString());
        server.send(
          fileBase, //
          undefined,
          undefined,
          // rinfo?.port,
          12312,
          rinfo?.address,
          error => {
            if (error) {
              console.log('Error sending message:', error);
            } else {
              console.log('Message sent successfully');
            }
          },
        );
        console.log('Message received:', data.toString());
      });

      server.on('listening', () => {
        console.log('Server listening on port:', server.address().port);
        setConnectionStatus(
          `Server listening on port: ${server.address().port}`,
        );
      });

      server.bind(12312);

      setSocket(server);
    } else {
      setConnectionStatus(`server disconnected`);
      // Configura la aplicación como cliente
      const client = UdpSocket.createSocket('udp4');
      client.bind(12341);
      setSocket(client);
    }

    return () => {
      socket && socket.close();
    };
  }, [isServer]);

  const fileToBase64 = async (uri: string) => {
    try {
      console.log(fileResponse[0]);
      let filePath = '';
      // const content = await FileSystem.readAsStringAsync(uri);
      // console.log('fileToBase64', content);
      // return base64.fromByteArray(stringToUint8Array(content));
      if (Platform.OS === 'ios') {
        // let arr = uri.split('/');
        filePath = uri.replace('file://', '');
        // const dirs = RNFetchBlob.fs.dirs;
        // filePath = `${dirs.DocumentDir}/${arr[arr.length - 1]}`;
      } else {
        filePath = uri;
      }
      console.log('uriuriuri', filePath);

      // RNFetchBlob.fs
      //   .readFile(filePath)
      //   .then(data => {
      //     console.log('readFile-----', data);
      //     setFileBase(data);
      //   })
      //   .catch(err => {
      //     console.log('errrr', err);
      //   });

      RNFS.readFile(filePath).then(res => {
        console.log('readFile-----', res);
        setFileBase('data:image/image/png;base64,' + res);
      });
    } catch (e) {
      console.warn('fileToBase64()ERRR', e);
      return '';
    }
  };
  const sendMessage = () => {
    if (isServer) return;
    console.log('sendMessage---', socket);

    console.log('mensaje---', fileBase);
    const client = socket;

    client.send(
      fileBase,
      undefined,
      undefined,
      12312,
      '192.168.0.150',
      error => {
        if (error) {
          console.log('Error sending the message:', error);
        } else {
          console.log('Message sent successfully');
        }
      },
    );
    client.on('message', async (message, remoteInfo) => {
      console.log('clientttt', message, remoteInfo);
      setMensaje(message.toString());
    });
  };

  const handleDocumentSelection = useCallback(async () => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.allFiles],
        allowMultiSelection: true,
      });
      console.log('response@@', response);
      setFileResponse(response);
      fileToBase64(response[0].uri);
    } catch (err) {
      console.warn(err);
    }
  }, []);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>{connectionStatus}</Text>
      <Button
        title={isServer ? 'stop server' : 'Start Server'}
        onPress={() => setIsServer(!isServer)}
      />
      <Button title="Send Message" onPress={sendMessage} disabled={isServer} />
      <TextInput onChangeText={setIpServer} value={ipServer} />

      {/* <TextInput
        onChangeText={txt => setMensaje(isServer ? '' : txt)}
        value={mensaje}
      /> */}
      <Text>IP adress: {ipAddress}</Text>
      {/* <Text>Message received: {mensaje}</Text> */}

      {fileResponse.map((file, index) => (
        <Text
          key={index.toString()}
          style={styles.uri}
          numberOfLines={1}
          ellipsizeMode={'middle'}>
          {file?.uri}
        </Text>
      ))}
      <Button title="Select 📑" onPress={handleDocumentSelection} />

      {isServer ? (
        <Image
          style={{
            width: 100,
            height: 50,
            resizeMode: 'contain',
            borderWidth: 1,
            borderColor: 'red',
          }}
          source={{uri: mensaje}}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  uri: {
    paddingBottom: 8,
    paddingHorizontal: 18,
  },
});
// import React, {Component} from 'react';
// import {View, Button} from 'react-native';

// import dgram from 'react-native-udp';

// function toByteArray(obj) {
//   var uint = new Uint8Array(obj.length);
//   for (var i = 0, l = obj.length; i < l; i++) {
//     uint[i] = obj.charCodeAt(i);
//   }

//   return new Uint8Array(uint);
// }

// class App extends Component {
//   constructor(props) {
//     super(props);

//     this.turnOnLamp = this.turnOnLamp.bind(this);
//     this.turnOffLamp = this.turnOffLamp.bind(this);
//     this.state = {socket: null};
//   }

//   componentDidMount() {
//     let self = this;
//     let socket = dgram.createSocket({
//       type: 'udp4',
//       debug: true,
//     });
//     socket.bind(12345);
//     socket.once('listening', function () {
//       socket.send(
//         'Hello World!',
//         undefined,
//         undefined,
//         11213,
//         '0.0.0.0',
//         function (err) {
//           if (err) throw err;

//           console.log('Message sent!');
//         },
//       );
//     });

//     socket.on('message', function (msg, rinfo) {
//       console.log('Message received', msg);
//     });

//     // socket.on('message', (data, rinfo) => {
//     //   setMensaje(data.toString());
//     //   socket.send(
//     //     '¡Hola desde el servidor!',
//     //     undefined,
//     //     undefined,
//     //     rinfo?.port,
//     //     rinfo?.address,
//     //     error => {
//     //       if (error) {
//     //         console.log('Error al enviar el mensaje:', error);
//     //       } else {
//     //         console.log('Mensaje enviado correctamente');
//     //       }
//     //     },
//     //   );
//     //   console.log('Mensaje recibido:', data.toString());
//     // });

//     // socket.on('listening', () => {
//     //   console.log('Server listening on port:', socket.address().port);
//     // });

//     // let aPort = 8888;
//     // socket.bind('0.0.0.0', function (err) {
//     //   if (err) throw err;
//     // });

//     // // console.log('socketsocketsocket@@', socket);

//     // this.setState({
//     //   socket,
//     // });

//     // // socket.on('message', function (msg, rinfo) {
//     // //   console.log('Message received', msg, rinfo);
//     // // });

//   }
//   turnOnLamp() {
//     // let data = toByteArray('INFO?');
//     // console.log('turnOnLamp@@', data);
//     // this.state.socket.send(
//     //   data,
//     //   0,
//     //   data.length,
//     //   2390,
//     //   '0.0.0.0',
//     //   function (err) {
//     //     if (err) throw err;
//     //   },
//     // );
//     // this.state.socket.on('message', function (msg, rinfo) {
//     //   console.log('Message received', msg);
//     // });
//     this.state.socket.send(
//       '¡Hello from the client!',
//       undefined,
//       undefined,
//       11213,
//       '0.0.0.0',
//       error => {
//         if (error) {
//           console.log('Error sending the message:', error);
//         } else {
//           console.log('Message sent successfully');
//         }
//       },
//     );
//     this.state.socket.on('message', async (message, remoteInfo) => {
//       console.log('clientttt', message, remoteInfo);
//       //setMensaje(message.toString());
//     });
//   }

//   turnOffLamp() {
//     let data = toByteArray('SET: 000000000');
//     this.state.socket.send(
//       data,
//       0,
//       data.length,
//       8888,
//       '69.69.69.255',
//       function (err) {
//         if (err) {
//           console.log('error:' + err);
//           throw err;
//         }
//       },
//     );
//   }

//   render() {
//     return (
//       <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//         <Button title="turn on" onPress={this.turnOnLamp} />
//         <Button title="turn off" onPress={this.turnOffLamp} />
//       </View>
//     );
//   }
// }

// export default App;
