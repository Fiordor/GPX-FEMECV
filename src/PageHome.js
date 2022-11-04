import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from './components/IconButton';
import Toolbar from './components/Toolbar';

const PageHome = ({ route, navigation }) => {

  const [trails, setTrails] = useState([]);
  const [show, setShow] = useState('map');

  const openPage = (page) => {

  }

  useEffect(() => {

    setTrails(route.params.trails);
    setShow(route.params.show);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('back');
      return true;
    });

    return () => backHandler.remove();
  }, [route.params]);

  return (
    <SafeAreaView>
      <Toolbar
        leftText={'GPX'}
        rightIcon={'rotate'}
        rightButton={() => {}}
        />
      <View style={styles.header}>
        <IconButton
          style={styles.btFilter}
          onPress={() => { openPage('filter') }}
          icon={'magnifying-glass'}
          title={'search'}/>
        <IconButton
          style={styles.btShow}
          onPress={() => { openPage('filter') }}
          icon={show} />
      </View>
      <Text>{'hola\ngola'}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    height: 50,
    backgroundColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    zIndex: 1
  },
  header: {
    backgroundColor: 'blue',
    flexDirection: 'row',
    padding: 9
  },
  btFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'green'
  },
  btShow: {
    marginLeft: 8,
    backgroundColor: 'white',
    height: 50,
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default PageHome;