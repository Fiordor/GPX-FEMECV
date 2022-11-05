import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from './components/IconButton';
import Toolbar from './components/Toolbar';

const DownloadList = ({ hide = false, array, openItem }) => {

  const getHeight = () => {
    //50 toolbar, 60 header, 16 margin, 16 bottom bar, 8 marginbttom
    return Dimensions.get('window').height - 50 - 60 - 16 - 16 - 8;
  }

  const renderItem = ({ item }) => {
    let disabled = item.disabled;
    return (
      <TouchableOpacity
        style={styles.item}
        disabled={disabled}
        onPress={() => { if(!disabled) { console.log('a'); disabled = true}; openItem(item.key); }}>
        <Text>{item.key}</Text>
        <Text>{item.size}</Text>
      </TouchableOpacity>
    );
  }

  
  useEffect(() => {
    console.log(array.length)
  }, [array]);
  

  if (hide || array == undefined) return null;

  return (
    <View style={[styles.list, { height: getHeight() }]}>
      <FlashList
        data={array}
        renderItem={renderItem}
        estimatedItemSize={80} />
    </View>
  );
}

const PageManager = ({ route, navigation }) => {

  const [params, setParams] = useState({ trails: [], filter: null, view: 'map' });
  const [downloadTrails, setDownloadTrails] = useState(new Map());
  const [updateTrails, setUpdateTrails] = useState(new Map());
  const [queueTrails, setQueueTrails] = useState([]);
  const [progress, setProgress] = useState(0);

  const mapToArray = (map) => {
    let array = Array.from(map.keys());
    for (let i = 0; i < array.length; i++) {
      array[i] = { key: array[i], size: map.get(array[i]).length, disabled: false };
    }
    return array
  }

  const addToQueue = (town) => {
    console.log(town)
  }

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

    setDownloadTrails(new Map([...downloadTrails].sort()));
    setUpdateTrails(new Map([...updateTrails].sort()));

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
      <DownloadList
        array={mapToArray(downloadTrails)}
        openItem={addToQueue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
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
  list: {
    width: 'auto',
    height: 10,
    margin: 8
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 4,
    marginTop: 4,
    backgroundColor: '#e3e3e3'
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