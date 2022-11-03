import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import web from './utilities/web';

const PageLoad = ({ route, navigation }) => {

  const loadTrails = async () => {

    

  }

  useEffect(() => {

    loadTrails();

    navigation.navigate('PageHome');
  }, []);

  return (
    <SafeAreaView>
      <Text>PageLoad</Text>
    </SafeAreaView>
  )
}

export default PageLoad;