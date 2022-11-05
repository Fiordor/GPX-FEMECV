import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from './components/IconButton';
import Toolbar from './components/Toolbar';

const TrailsList = ({ hide = false, trails, trailsLength, openItem }) => {

  if (hide) return null;

  const renderItem = ({ item }) => {

    return (
      <TouchableOpacity
        style={item.coordenadas == 0 ? styles.itemDisabled : styles.item}
        disabled={item.coordenadas == 0}
        onPress={() => { openItem(item); }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text>{item.estado}</Text>
        <Text>{item.municipio}</Text>
        <Text style={styles.itemDetails}>
          <FontAwesomeIcon icon={['fas', 'stopwatch']} size={12} />&nbsp;
          {item.tiempo.length ? item.tiempo : '--:--:--'}&nbsp;
          <FontAwesomeIcon icon={['fas', 'arrow-trend-up']} size={12} />&nbsp;
          {item.subida.length ? item.subida : '-- m'}&nbsp;
          <FontAwesomeIcon icon={['fas', 'arrow-trend-down']} size={12} />&nbsp;
          {item.bajada.length ? item.bajada : '-- m'}
        </Text>
      </TouchableOpacity>
    );
  }

  <FlashList
    data={trails}
    renderItem={renderItem}
    estimatedItemSize={120} />
}

const PageManager = ({ route, navigation }) => {

  const [params, setParams] = useState({ trails: [], filter: null, view: 'map' });
  const [downloadTrails, setDownloadTrails] = useState(new Map());
  const [updateTrails, setUpdateTrails] = useState(new Map());
  const [queueTrails, setQueueTrails] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {

    setParams(route.params);

    route.params.trails.forEach(trail => {
      if (trail.points == null) {

        if (downloadTrails.has(trail.town)) {
          downloadTrails.get(trail.town).push(trail);
        } else {
          downloadTrails.set(trail.town, [trail]);
        }

      } else {

        if (updateTrails.has(trail.town)) {
          updateTrails.get(trail.town).push(trail);
        } else {
          updateTrails.set(trail.town, [trail]);
        }

      }
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('PageHome', params);
      return true;
    });

    return () => backHandler.remove();
  }, [route.params]);

  return (
    <SafeAreaView>
      <Toolbar
        leftIcon={'arrow-left'}
        leftText={'Manager'}
        leftButton={() => { navigation.navigate('PageHome', params); }}
        rightText={progress}
      />
      <View style={styles.header}>
        <IconButton style={styles.btHeader} title='Download' />
        <IconButton style={styles.btHeader} title='Update' />
        <IconButton style={styles.btHeader} title='Queue' />
      </View>
      <Text>{'hola\ngola'}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'blue',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 4,
    paddingRight: 4
  },
  btHeader: {
    backgroundColor: 'green',
    marginLeft: 4,
    marginRight: 4,
    flex: 1
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

export default PageManager;