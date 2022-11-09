
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LeafletView } from 'react-native-leaflet-view';
import IconButton from './IconButton';

const HomeMap = ({ hide = false, mapMarkers = [], mapCenterPosition = null, openItem = null }) => {

  const [id, setId] = useState(0);
  const [title, setTitle] = useState('Pick a trail');

  const dim = (Dimensions.get('window').width / 2) - (200 / 2);

  if (hide) return null;


  const onMessageReceived = (msg) => {

    if (msg.event == 'onMapMarkerClicked') {
      let mapMarkerID = msg.payload.mapMarkerID;
      let index = mapMarkerID.indexOf('-');
      let id = parseInt(mapMarkerID.substring(0, index));
      let title = mapMarkerID.substring(index + 1);
      setId(id);
      setTitle(title);
    }
  }

  const open = () => {
    if(id > 0 && openItem != null) {
      openItem(id);
    }
  }

  if (mapMarkers.length == 0) {

    return (
      <View style={styles.fullscreen}>
        <Text>Without points</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.fullscreen}>
        <LeafletView
          onMessageReceived={onMessageReceived}
          mapMarkers={mapMarkers}
          mapCenterPosition={mapCenterPosition}
          zoom={6}
          doDebug={false}
        />
        <IconButton
          style={[styles.floatButton, {left: dim}]}
          disabled={id == 0}
          onPress={open}
          title={title}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#BBBBBB',
  },
  floatButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    position: 'absolute',
    padding: 8,
    bottom: 16,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 200
  }
});

export default HomeMap;