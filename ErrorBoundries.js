import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
export default function ErrorBoundries({errorObj}) {
  console.log('errorObj', errorObj);
  return (
    <View
      style={{
        flex: 1,

        justifyContent: 'center',

        alignItems: 'center',
      }}>
      <Text>Oops!!! Something went wrong..</Text>

      <Text>Error: {errorObj.code.toString()}</Text>

      <Text>Error Info: {JSON.stringify(errorObj.message)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    backgroundColor: 'pink',
    width: '100%',
  },
  text: {
    fontFamily: 'Oswald-Medium',
    fontSize: 16,
    alignSelf: 'center',

    color: 'white',
  },
});

// export default class ErrorBoundries extends Component {

//     constructor(props) {

//       super(props);

//       this.state = {

//         hasError: false,

//         error: '',

//         errorInfo: '',

//       };

//     }

//     static getDerivedStateFromError(error) {

//       return {hasError: true};

//     }

//     componentDidCatch(error, errorInfo) {

//       console.log('Error: ' + error);

//       console.log('Error Info: ' + JSON.stringify(errorInfo));

//       this.setState({

//         error: error,

//         errorInfo: errorInfo,

//       });

//     }

//     render() {

//       if (this.state.hasError) {

//         return (

//           <View

//             style={{

//               flex: 1,

//               justifyContent: 'center',

//               alignItems: 'center',

//             }}>

//             <Text>Oops!!! Something went wrong..</Text>

//             <Text>Error: {this.state.error.toString()}</Text>

//             <Text>Error Info: {JSON.stringify(this.state.errorInfo)}</Text>

//           </View>

//         );

//       }

//       return this.props.children;

//     }

//    }
