
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { LeafletView, MapShapeType, OWN_POSTION_MARKER_ID } from 'react-native-leaflet-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from './Toolbar';

const DEFAULT_COORDINATE = {
  lat: 37.78825,
  lng: -122.4324,
};

const Map = ({ onError = undefined, mapLayers = undefined, mapMarkers = undefined,
  mapShapes = undefined, mapCenterPosition = undefined, zoom = undefined,
  ownPositionMarker = undefined, doDebug = false }) => {

  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    setRefresh(!refresh);
  }, [mapCenterPosition]);

  if (refresh) {
    return (
      <LeafletView
        onError={onError}
        mapMarkers={mapMarkers}
        mapShapes={mapShapes}
        mapCenterPosition={mapCenterPosition}
        zoom={zoom}
        doDebug={doDebug}
      />
    );
  } else {
    return (
      <LeafletView
        onError={onError}
        mapMarkers={mapMarkers}
        mapShapes={mapShapes}
        mapCenterPosition={mapCenterPosition}
        zoom={zoom}
        doDebug={doDebug}
      />
    );
  }
}

const HikingTrail = ({ route, navigation }) => {

  const [trail, setTrail] = useState({ name: '' });
  const [coordinates, setCoordinates] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapShapes, setMapShapes] = useState([]);
  const [mapCenterPosition, setMapCenterPosition] = useState(null);

  const loadTrail = (trail) => {
    let params = {
      loadID: 'id',
      screen: 'HikingTrail',
      load: 'load-trail',
      input: trail
    };

    navigation.navigate('Load', params);
  }

  const updateTrail = (params) => {

    setTrail(params.trail);

    if (params.error != undefined) {
      Alert.alert('Error', params.error);
      navigation.navigate('Trails');
      return;
    }

    let cs = params.coordinates;
    setCoordinates(cs);

    let points = [];
    cs.forEach(c => {
      let position = { lat: c.lat, lng: c.lon };
      points.push(position);
    });

    let shape = {
      color: '#ff3333',
      positions: points,
      shapeType: MapShapeType.POLYLINE,
      center: points[0]
    }
    setMapShapes([shape]);

    let mark = {
      position: points[0],
      icon: '!',
      size: [32, 32]
    }
    setMapMarkers([mark]);
    setMapCenterPosition(points[0]);
  }

  useEffect(() => {

    let params = route.params;

    if (params != undefined) {

      if (params.trail != undefined) { loadTrail(route.params.trail); }
      if (params.load != undefined) { updateTrail(params.load.data); }

    } else {
      navigation.goBack();
    }

  }, [route.params]);

  return (
    <SafeAreaView style={styles.fullscreen}>
      <Toolbar
        left={() => { navigation.goBack() }}
        leftIcon='home'
        styleAbsolute={true}
        />
      <Map
        onError={(error) => { console.error(error) }}
        mapMarkers={mapMarkers}
        mapShapes={mapShapes}
        mapCenterPosition={mapCenterPosition}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  toolbar: {
    position: 'absolute',
    top: 0,
    left: 0
  }
});

export default HikingTrail;