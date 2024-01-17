import React, {useState, useEffect} from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import ErrorBoundries from '../../ErrorBoundries';

export default function Background({children, isError, errorObj}) {
  return (
    <View style={styles.background}>
      <SafeAreaView style={{flex: 1}}>
        {!isError ? children : <ErrorBoundries errorObj={errorObj} />}
        {/* {children} */}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
});
