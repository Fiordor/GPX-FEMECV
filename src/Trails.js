
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import DomParser from 'react-native-html-parser';
import { LeafletView, MapShapeType } from 'react-native-leaflet-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from './components/IconButton';
import Load from './Load';
import Toolbar from './Toolbar';
import TrailsList from './TrailsList';
import TrailsMap from './TrailsMap';

const TrailFilter = ({ navigation }) => {

  const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '?'];

  const municipioPicker = (filterBy) => {

    let trails = global.trails;
    let out = [];
    for (let i = 0; i < trails.length; i++) {
      const element = trails[i];

      if (element.municipio.length > 0) {
        let firstChar = element.municipio.charAt(0);
        firstChar = firstChar.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        firstChar = firstChar.toUpperCase();

        if (firstChar == filterBy) {

          let exists = out.find((e) => { return e == element.municipio });
          if (exists == undefined) { out.push(element.municipio); }

        }
      }
    }
    out = out.sort();

    navigation.navigate('PickerZona', { pickerID: 'picker', screen: 'Trails', array: out });
  }

  let alphabetList = ALPHABET.map((a) => {
    return (
      <TouchableOpacity
        style={styles.alphabetItem}
        key={a}
        onPress={() => { municipioPicker(a) }}>
        <Text style={{ textAlign: 'center' }} >{a}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.alphabetRow}>
      {alphabetList}
    </View>
  );
}

const Trails = ({ route, navigation }) => {

  const [list, setList] = useState(true);
  const [map, setMap] = useState({ mapCenterPosition: null, mapMarkers: [], mapShapes: [], });
  const [trails, setTrails] = useState([]);
  const [trailsLength, setTrailsLength] = useState('cargando...');

  const filter = (selection) => {
    setTrails([]);
    let filterTrails = global.trails.filter((t) => {
      return selection == t.municipio;
    });
    setTrails(filterTrails);
  }

  const openItem = (trail) => {
    navigation.navigate('HikingTrail', { trail: trail });
  }

  const updateTrails = () => {
    navigation.navigate('Load', { loadID: 'id', screen: 'Trails', load: 'update-trails' });
  }

  const afterLoad = (t) => {
    if (t.length) {

      const random = () => { return Math.floor(Math.random() * 255); }

      global.trails = t;
      setTrails(t);

      let cont = 0;
      t.forEach(trail => {
        if (trail.tiempo == '' && trail.subida == '' && trail.bajada == '') cont++;
      });
      setTrailsLength(cont);

      let markers = [], shapes = [], center = null;
      let centerPoints = { hmax: null, hmin: null, wmax: null, wmin: null }
      t.forEach(trail => {
        if (trail.coordenadas != null && trail.coordenadas != 0 && trail.coordenadas.length > 0) {
          let points = [];
          trail.coordenadas.forEach(c => { points.push({ lat: c.lat, lng: c.lon }); });
          let color = `rgb(${random()}, ${0}, ${random()})`;
          let shape = { color: color, positions: points, shapeType: MapShapeType.POLYLINE, center: points[0] };
          let mark = { id: trail.id, position: points[0], icon: '*', title: trail.name, size: [32, 32] };

          if (centerPoints.hmax == null) {
            centerPoints.hmax = points[0].lat;
            centerPoints.hmin = points[0].lat;
            centerPoints.wmax = points[0].lng;
            centerPoints.wmin = points[0].lng;
          }

          if (points[0].lat > centerPoints.hmax) { centerPoints.hmax = points[0].lat; }
          else if (points[0].lat < centerPoints.hmin) { centerPoints.hmin = points[0].lat; }

          if (points[0].lng > centerPoints.wmax) { centerPoints.wmax = points[0].lng; }
          else if (points[0].lng < centerPoints.wmin) { centerPoints.wmin = points[0].lng; }

          markers.push(mark);
          shapes.push(shape);
        }
      });

      if (centerPoints != null) {
        center = {
          lat: ( (centerPoints.hmax + centerPoints.hmin) / 2 ),
          lng: ( (centerPoints.wmax + centerPoints.wmin) / 2 )
        }
      }

      setMap({ mapCenterPosition: center, mapMarkers: markers, mapShapes: shapes });

    } else {
      updateTrails();
    }
  }

  useEffect(() => {

    let params = route.params;

    if (params != undefined) {

      if (params.load != undefined) { afterLoad(params.load.data); }
      if (params.picker != undefined) { filter(params.picker.selection); }

    } else {
      navigation.navigate('Load', { loadID: 'id', screen: 'Trails', load: 'load-trails' });
    }

  }, [route.params]);

  return (
    <SafeAreaView style={styles.fullscreen}>
      <Toolbar
        title='GPX'
        right={updateTrails}
        rightIcon='rotate' />
      <TrailFilter
        navigation={navigation}
        filter={filter} />
      <Button
        onPress={() => { setList(!list) }}
        title='Cambiar'
      />
      <TrailsMap
        hide={list}
        map={map}
        openItem={openItem}
      />
      <TrailsList
        hide={!list}
        trails={trails}
        trailsLength={trailsLength}
        openItem={openItem}
      />
      <Text>{trailsLength}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  fullscreenCenter: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullcontainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16
  },
  alphabetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    margin: 2
  },
  alphabetItem: {
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    margin: 2,
    width: 20
  },
  item: {
    margin: 4,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 4
  },
  itemDisabled: {
    margin: 4,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    opacity: 0.5
  },
  itemName: {
    fontWeight: 'bold'
  }
});

export default Trails;