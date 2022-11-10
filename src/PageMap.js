
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { LeafletView, MapShapeType } from 'react-native-leaflet-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Load from './components/Load';
import Toolbar from './components/Toolbar';
import DB from './utilities/Database';
import Web from './utilities/Web';

const Map = ({ hide = false, mapShapes = [], mapMarkers = [], mapCenterPosition = {} }) => {

  useEffect(() => {
    
  }, [hide, mapShapes, mapMarkers, mapCenterPosition]);

  if (hide) {
    return null;
  } else if (mapShapes.length == 0) {
    return (
      <View style={styles.mapFullscreen}>
        <Text>Without points</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.mapFullscreen}>
        <LeafletView
          mapMarkers={mapMarkers}
          mapShapes={mapShapes}
          mapCenterPosition={mapCenterPosition}
          doDebug={false}
        />
      </View>
    );
  }
}

const PageMap = ({ route, navigation }) => {

  const [params, setParams] = useState({ filter: null, view: 'map' });
  const [id, setId] = useState(0);
  const [load, setLoad] = useState('');

  const [mapShapes, setMapShapes] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapCenterPosition, setMapCenterPosition] = useState(null);

  const loadDone = async (p) => {

    let points = [];
    p.forEach(point => {
      let position = { lat: point.lat, lng: point.lng };
      points.push(position);
    });

    let shape = {
      color: '#ff3333',
      positions: points,
      shapeType: MapShapeType.POLYLINE,
      center: points[0]
    }

    let mark = {
      position: points[0],
      icon: 'START',
      size: [16, 16]
    }

    setMapShapes([shape]);
    setMapMarkers([mark]);
    setMapCenterPosition(points[0]);

    setLoad('done');
  }

  const hasPoints = async (id) => {

    let points = await DB.exec('SELECT points FROM trails WHERE id = ?', [id])

    if (points[0].points == null) {
      getPoints(id);
    } else {
      if (points[0].points) {
        setLoad('getPointsByTrailId');
      } else {
        setLoad('done');
      }
    }
  }

  const getPoints = async (id) => {

    if (id == 0) return;

    await DB.exec('DELETE FROM points WHERE trail = ?', [id]);
    await DB.exec('UPDATE trails SET pointLat = NULL, pointLng = NULL, points = NULL WHERE id = ?', [id]);
    await Web.cleanCache();

    let link = await DB.exec('SELECT link FROM trails WHERE id = ?', [id]);
    let points = await Web.getPoints(link[0].link);
    if (points == null) {

      await DB.exec('UPDATE trails SET pointLat = NULL, pointLng = NULL, points = 0 WHERE id = ?', [id]);
      setLoad('done');

    } else {

      for (let i = 0; i < points.length; i++) {
        points[i] = {
          id: i + 1,
          trail: id,
          ele: points[i].ele,
          lat: points[i].lat,
          lng: points[i].lon
        };
      }
      let sql = 'INSERT INTO points (id, trail, ele, lat, lng) VALUES';
      points.forEach((p) => {
        let values = ` (${p.id}, ${p.trail}, ${p.ele}, ${p.lat}, ${p.lng}),`;
        sql += values;
      });
      sql = sql.substring(0, sql.length - 1) + ';';
      await DB.exec(sql);
      await DB.exec(
        'UPDATE trails SET pointLat = ?, pointLng = ?, points = 1 WHERE id = ?',
        [points[0].lat, points[0].lng, id]);

      setLoad('getPointsByTrailId');
    }
  }

  useEffect(() => {

    if (route.params != undefined) {
      setParams({ filter: route.params.filter, view: route.params.view });
      setId(route.params.id);
      hasPoints(route.params.id);
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
        leftText={'Map'}
        leftButton={() => { navigation.navigate('PageHome', params); }} />
      <View style={styles.fullscreen}>
        <Load
          load={load}
          input={id}
          resolve={loadDone} />
        <Map
          hide={load != 'done'}
          mapCenterPosition={mapCenterPosition}
          mapMarkers={mapMarkers}
          mapShapes={mapShapes} />
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
  mapFullscreen: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow',
    position: 'relative'
  },
  listFullscreenAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
});

export default PageMap;