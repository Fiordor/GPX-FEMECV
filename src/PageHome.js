import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeList from './components/HomeList';
import HomeMap from './components/HomeMap';
import IconButton from './components/IconButton';
import Load from './components/Load';
import Toolbar from './components/Toolbar';

const PageHome = ({ route, navigation }) => {

  const [params, setParams] = useState({ filter: null, view: 'map' });
  const [load, setLoad] = useState('getTrails');

  const [trails, setTrails] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapCenterPosition, setMapCenterPosition] = useState(null);

  const openPageManager = () => {
    navigation.navigate('PageManager', params);
  }

  const loadDone = (t) => {
    setTrails(t);

    let marks = [];
    let center = { latMax: null, latMin: null, lngMax: null, lngMin: null };

    for (let i = 0; i < t.length; i++) {
      const trail = t[i];
      if (trail.points == 1) {
        marks.push({
          position: { lat: trail.pointLat, lng: trail.pointLng },
          icon: '*',
          title: trail.name,
          id: trail.id + '-' + trail.name,
          size: [32, 32]
        });

        if (center.latMax == null) {
          center = {
            latMax: trail.pointLat,
            latMin: trail.pointLat,
            lngMax: trail.pointLng,
            lngMin: trail.pointLng
          };
        }

        if (trail.pointLat > center.latMax) { center.latMax = trail.pointLat; }
        else if (trail.pointLat < center.latMin) { center.latMin = trail.pointLat; }

        if (trail.pointLng > center.lngMax) { center.lngMax = trail.pointLng; }
        else if (trail.pointLng < center.lngMin) { center.lngMin = trail.pointLng; }

      }
    }

    if (center.latMax != null) {
      setMapCenterPosition({
        lat: ( (center.latMax + center.latMin) / 2 ),
        lng: ( (center.lngMax + center.lngMin) / 2 )
      });
    }

    setMapMarkers(marks);
    setLoad('done');
  }

  const changeView = () => {
    setParams({ filter: params.filter, view: params.view == 'map' ? 'list' : 'map' });
  }

  const open = (id) => {
    console.log(id);
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
          title={'search'} />
        <IconButton
          style={styles.btView}
          onPress={() => { changeView(); }}
          icon={params.view} />
      </View>
      <View style={styles.maxDim}>
        <Load
          load={load}
          resolve={loadDone} />
        <HomeMap
          hide={params.view != 'map' || load != 'done'}
          mapMarkers={mapMarkers}
          mapCenterPosition={mapCenterPosition}
          openItem={open} />
        <HomeList
          hide={params.view != 'list' || load != 'done'}
          trails={trails}
          openItem={open} />
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
  btView: {
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