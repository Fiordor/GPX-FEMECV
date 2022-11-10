import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Load from './components/Load';
import Toolbar from './components/Toolbar';

const FilterAlphabet = ({ pick = null }) => {

  const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '#'];

  let alphabetList = ALPHABET.map((a) => {
    return (
      <TouchableOpacity
        style={styles.btHeader}
        key={a}
        onPress={() => { if (pick != null) pick(a); }}>
        <Text style={{ textAlign: 'center', color: '#FEFEFE' }} >{a}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.header}>
      {alphabetList}
    </View>
  );

}

const FilterList = ({ hide = false, array, openItem = null }) => {

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => { if (openItem != null) openItem(item); }}>
        <Text style={{color: '#333333'}}>{item}</Text>
      </TouchableOpacity>
    );
  }

  if (hide) {
    return null;
  } else {
    return (
      <View style={styles.listFullscreen}>
        <View style={styles.listFullscreenAbs}>
          <FlashList
            data={array}
            renderItem={renderItem}
            estimatedItemSize={50} />
        </View>
      </View>
    );
  }
}

const PageFilter = ({ route, navigation }) => {

  const [params, setParams] = useState({ filter: null, view: 'map' });
  const [load, setLoad] = useState('getTowns');

  const [towns, setTowns] = useState([]);
  const [filterTowns, setFiltesTowns] = useState([]);

  const loadDone = (t) => {

    for (let i = 0; i < t.length; i++) { t[i] = t[i].town; }

    setTowns(t);
    setFiltesTowns(t);
    setLoad('done');
  }

  const filter = (f) => {

    if (f == '#') {
      setFiltesTowns(towns);
    } else {
      let newTowns = [];
      for (let i = 0; i < towns.length; i++) {
        const element = towns[i];

        if (element.length > 0) {
          let firstChar = element.charAt(0);
          firstChar = firstChar.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          firstChar = firstChar.toUpperCase();

          if (firstChar == f) { newTowns.push(element); }
        }
      }

      setFiltesTowns(newTowns);
    }
  }

  const open = (t) => {
    navigation.navigate('PageHome', { filter: t, view: params.view });
  }

  useEffect(() => {

    if (route.params != undefined) {
      setParams(route.params);
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('PageHome', params);
      return true;
    });

    return () => backHandler.remove();
  }, [route.params]);

  return (
    <SafeAreaView style={styles.fullscreen}>
      <Toolbar
        leftIcon={'arrow-left'}
        leftText={'Filter'}
        leftButton={() => { navigation.navigate('PageHome', params); }} />
      <FilterAlphabet
        pick={filter}
      />
      <View style={styles.fullscreen}>
        <Load
          load={load}
          resolve={loadDone} />
        <FilterList
          hide={load != 'done'}
          array={filterTowns}
          openItem={open}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FEFEFE'
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
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    paddingRight: 6
  },
  btHeader: {
    backgroundColor: '#50723c',
    margin: 2,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8
  },
  listFullscreen: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  listFullscreenAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  item: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 8,
    marginRight: 8,
    backgroundColor: '#EFEFEF'
  },
});

export default PageFilter;