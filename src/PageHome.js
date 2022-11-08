import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from './components/IconButton';
import Load from './components/Load';
import Toolbar from './components/Toolbar';

const PageHome = ({ route, navigation }) => {

  const [params, setParams] = useState({ filter: null, view: 'map' });
  const [trails, setTrails] = useState([]);

  const openPageManager = () => {
    navigation.navigate('PageManager', params);
  }

  const loadDone = (t) => {
    setTrails(t);
    console.log('done')
  }

  useEffect(() => {

    if (route.params != undefined) {
      setParams(route.params);
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('back');
      return true;
    });

    return () => backHandler.remove();
  }, [route.params]);

  return (
    <SafeAreaView style={styles.fullscreen}>
      <Toolbar
        leftText={'GPX'}
        rightIcon={'rotate'}
        rightButton={() => { openPageManager(); }}
        />
      <View style={styles.header}>
        <IconButton
          style={styles.btFilter}
          onPress={() => { }}
          icon={'magnifying-glass'}
          title={'search'}/>
        <IconButton
          style={styles.btShow}
          onPress={() => { }}
          icon={params.view} />
      </View>
      <View style={styles.maxDim}>
        <Load
          resolve={loadDone}
          />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    flexDirection: 'column'
  },
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
    padding: 8
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
  },
  maxDim: {
    backgroundColor: '#f7d3d3',
    flex: 1
  }
});

export default PageHome;