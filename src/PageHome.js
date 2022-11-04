import React, { useEffect, useState } from 'react';
import { BackHandler, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Web from './utilities/Web';

const PageHome = ({ route, navigation }) => {

  const [trails, setTrails] = useState([]);

  useEffect(() => {

    setTrails(route.params.trails);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('back');
      return true;
    });

    return () => backHandler.remove();
  }, [route.params]);

  return (
    <SafeAreaView>
      <Text>{'hola\ngola'}</Text>
    </SafeAreaView>
  );
}

export default PageHome;