import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from './components/IconButton';
import Load from './components/Load';
import Toolbar from './components/Toolbar';

import DB from './utilities/Database';
import Web from './utilities/Web';

const DownloadList = ({ hide = false, array, openItem = null, disabledItem = false }) => {

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        disabled={disabledItem}
        onPress={() => { if (openItem != null) openItem(index, item); }}>
        <Text style={{color: '#333333'}}>{item.key}</Text>
        <Text style={{color: '#333333'}}>{item.value.length}</Text>
      </TouchableOpacity>
    );
  }

  if (hide) {
    return null;
  } else if (array == undefined || array.length == 0) {
    return (
      <View style={styles.fullscreenCenter}>
        <Text>Without trails</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.fullscreen}>
        <View style={styles.fullscreenAbs}>
          <FlashList
            data={array}
            renderItem={renderItem}
            estimatedItemSize={50} />
        </View>
      </View>
    );
  }
}

const PageManager = ({ route, navigation }) => {

  const [params, setParams] = useState({ filter: null, view: 'map' });
  const [load, setLoad] = useState('getTrailsMin')

  const [downloadTrails, setDownloadTrails] = useState([]);
  const [updateTrails, setUpdateTrails] = useState([]);
  const [queueTrails, setQueueTrails] = useState([]);

  const [view, setView] = useState('download');
  const [isUpdating, setIsUpdating] = useState(false);

  const addToQueue = (index, item) => {

    downloadTrails.splice(index, 1)
    setDownloadTrails([...downloadTrails]);

    queueTrails.push({ key: item.key, value: item.value });

    if (!isUpdating && queueTrails.length) {
      setIsUpdating(true);
      getPoints();
    }
  }

  const chageView = (v) => {
    setView(v);
  }

  const loadDone = (t) => {

    setLoad('done');

    let mapDownloadTrails = new Map();
    let mapUpdateTrails = new Map();

    t.forEach(trail => {
      if (trail.points == null) {

        if (mapDownloadTrails.has(trail.town)) {
          mapDownloadTrails.get(trail.town).push(trail);
        } else {
          mapDownloadTrails.set(trail.town, [trail]);
        }

      } else {

        if (mapUpdateTrails.has(trail.town)) {
          mapUpdateTrails.get(trail.town).push(trail);
        } else {
          mapUpdateTrails.set(trail.town, [trail]);
        }
      }
    });

    setDownloadTrails(mapToArray(mapDownloadTrails));
    setUpdateTrails(mapToArray(mapUpdateTrails));
  }

  const mapToArray = (map) => {
    let array = Array.from(map.keys());
    array.sort();
    for (let i = 0; i < array.length; i++) {
      array[i] = {
        key: array[i],
        value: map.get(array[i])
      };
    }
    return array;
  }

  const getPoints = async () => {
    while (queueTrails.length) {
      let item = queueTrails[0];

      for (let i = 0; i < item.value.length; i++) {
        let trail = item.value[i];

        await DB.exec('DELETE FROM points WHERE trail = ?', [trail.id]);
        await DB.exec('UPDATE trails SET pointLat = NULL, pointLng = NULL, points = NULL WHERE id = ?', [trail.id]);
        await Web.cleanCache();

        let points = await Web.getPoints(trail.link);
        if (points == null) {

          await DB.exec('UPDATE trails SET pointLat = NULL, pointLng = NULL, points = 0 WHERE id = ?', [trail.id]);
          item.value[i].points = 0;

        } else {

          for (let i = 0; i < points.length; i++) {
            points[i] = {
              id: i + 1,
              trail: trail.id,
              ele: points[i].ele,
              lat: points[i].lat,
              lng: points[i].lon
            };
          }
          let sql = 'INSERT INTO points (id, trail, ele, lat, lng) VALUES';
          points.forEach((p, i) => {
            let values = ` (${i + 1}, ${trail.id}, ${p.ele}, ${p.lat}, ${p.lng}),`;
            sql += values;
          });
          sql = sql.substring(0, sql.length - 1) + ';';
          await DB.exec(sql);

          points = await DB.exec('SELECT id, lat, lng FROM points WHERE trail = ? ORDER BY id', [trail.id]);
          await DB.exec(
            'UPDATE trails SET pointLat = ?, pointLng = ?, points = 1 WHERE id = ?',
            [ points[0].lat, points[0].lng, trail.id]);

        }

        item.value[i].points = points;
      }

      queueTrails.shift();
      setQueueTrails([...queueTrails]);

      let index = sortedIndex(updateTrails, item);
      let update = updateTrails;
      let start = update.slice(0, index);
      let end = update.slice(index);
      update = (start.concat([item])).concat(end);

      setUpdateTrails([...update]);
    }
    setIsUpdating(false);
  }

  const sortedIndex = (array, value) => {
    let low = 0, high = array.length;

    while (low < high) {
      let mid = low + high >>> 1;
      if (array[mid].key < value.key) low = mid + 1;
      else high = mid;
    }
    return low;
  }

  useEffect(() => {

    setParams(route.params);

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
        leftText={'Manager'}
        leftButton={() => { navigation.navigate('PageHome', params); }}
      />
      <View style={styles.header}>
        <IconButton
          style={styles.btHeader}
          color={'#FEFEFE'}
          disabled={view == 'download'}
          onPress={() => { chageView('download') }}
          title={`Download (${downloadTrails.length})`} />
        <IconButton
          style={styles.btHeader}
          color={'#FEFEFE'}
          disabled={view == 'update'}
          onPress={() => { chageView('update') }}
          title={`Update (${updateTrails.length})`} />
        <IconButton
          style={styles.btHeader}
          color={'#FEFEFE'}
          disabled={view == 'queue'}
          onPress={() => { chageView('queue') }}
          title={`Queue (${queueTrails.length})`} />
      </View>
      <Load
        load={load}
        resolve={loadDone} />
      <DownloadList
        hide={view != 'download'}
        array={downloadTrails}
        openItem={addToQueue}
      />
      <DownloadList
        hide={view != 'update'}
        array={updateTrails}
        openItem={addToQueue}
      />
      <DownloadList
        hide={view != 'queue'}
        array={queueTrails}
        disabledItem={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#FEFEFE'
  },
  fullscreenAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  fullscreenCenter: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 4,
    paddingRight: 4
  },
  btHeader: {
    backgroundColor: '#50723c',
    marginLeft: 4,
    marginRight: 4,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
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
  }
});

export default PageManager;