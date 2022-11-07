import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from './components/IconButton';
import Toolbar from './components/Toolbar';

import DB from './utilities/Database';
import Web from './utilities/Web';

const DownloadList = ({ hide = false, array, openItem = null, disabledItem = false }) => {

  const getHeight = () => {
    //50 toolbar, 60 header, 16 margin, 16 bottom bar, 8 marginbttom
    return Dimensions.get('window').height - 50 - 60 - 16 - 16 - 8;
  }

  const points = (trails) => {
    let str = '';
    trails.forEach(t => {
      str += ' ' + (t.points != null && t.points != false ? t.points.length : t.points);
    });
    return str;
  }

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        disabled={disabledItem}
        onPress={() => { if (openItem != null) openItem(index, item); }}>
        <Text>{item.key}</Text>
        <Text>{item.value.length}</Text>
        <Text>{points(item.value)}</Text>
      </TouchableOpacity>
    );
  }

  if (hide) {
    return null;
  } else if (array == undefined || array.length == 0) {
    return (
      <View style={[styles.listEmpty, { height: getHeight() }]}>
        <Text>Without trails</Text>
      </View>
    );
  } else {
    return (
      <View style={[styles.list, { height: getHeight() }]}>
        <FlashList
          data={array}
          renderItem={renderItem}
          estimatedItemSize={50} />
      </View>
    );
  }
}

const PageManager = ({ route, navigation }) => {

  const [params, setParams] = useState({ trails: [], filter: null, view: 'map' });
  const [mapDownloadTrails, setMapDownloadTrails] = useState(new Map());
  const [mapUpdateTrails, setMapUpdateTrails] = useState(new Map());
  const [downloadTrails, setDownloadTrails] = useState([]);
  const [updateTrails, setUpdateTrails] = useState([]);
  const [queueTrails, setQueueTrails] = useState([]);

  const [view, setView] = useState('download');
  const [isUpdating, setIsUpdating] = useState(false);

  const addToQueue = (index, item) => {

    downloadTrails.splice(index, 1)
    setDownloadTrails([...downloadTrails]);

    queueTrails.push({ key: item.key, value: item.value });
    mapDownloadTrails.delete(item.key);

    if (!isUpdating && queueTrails.length) {
      setIsUpdating(true);
      getPoints();
    }
  }

  const chageView = (v) => { setView(v); }

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
    while(queueTrails.length) {
      let item = queueTrails[0];

      for (let i = 0; i < item.value.length; i++) {
        let trail = item.value[i];

        await DB.exec('DELETE FROM points WHERE trail = ?', [trail.id]);
        await Web.cleanCache();
        
        let points = await Web.getPoints(trail);
        if (points == null) {

          await DB.exec('UPDATE trails SET points = 0 WHERE id = ?', [trail.id]);
          points = 0;

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
          await DB.exec('UPDATE trails SET points = 1 WHERE id = ?', [trail.id]);

        }

        item.value[i].points = points;
        params.trails[trail.id - 1].points = points;
      }

      queueTrails.shift();
      setQueueTrails([...queueTrails]);

      updateTrails.push(item);
      setUpdateTrails([...updateTrails]);
    }
    setIsUpdating(false);
  }

  useEffect(() => {

    setParams(route.params);

    route.params.trails.forEach(trail => {
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
    setUpdateTrails(mapToArray(updateTrails));

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
      />
      <View style={styles.header}>
        <IconButton
          style={styles.btHeader}
          onPress={() => { chageView('download') }}
          title={`Download (${downloadTrails.length})`} />
        <IconButton
          style={styles.btHeader}
          onPress={() => { chageView('update') }}
          title={`Update (${updateTrails.length})`} />
        <IconButton
          style={styles.btHeader}
          onPress={() => { chageView('queue') }}
          title={`Queue (${queueTrails.length})`} />
      </View>
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
  listEmpty: {
    width: 'auto',
    height: 10,
    margin: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  item: {
    height: 50,
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