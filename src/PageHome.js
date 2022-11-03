import React, { useEffect, useState } from 'react';
import { BackHandler, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PageHome = ({ route, navigation }) => {

  useEffect(() => {

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('back');
      return true;
    });

    return () => backHandler.remove();
  }, [route.params]);

  return (
    <SafeAreaView>
      <Text>Page Home</Text>
    </SafeAreaView>
  );
}

export default PageHome;