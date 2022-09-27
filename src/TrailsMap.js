
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LeafletView } from 'react-native-leaflet-view';
import IconButton from './IconButton';

const TrailsMap = ({ hide = false, map, openItem }) => {

  const [trail, setTrail] = useState(null);

  if (hide || map == null) return null;

  const onMessageReceived = (msg) => {

    console.log(msg);
    if (msg.event == 'onMapMarkerClicked') {
      let localTrail = global.trails.find((t) => { return t.id == msg.payload.mapMarkerID; });
      setTrail(localTrail);
    }
  }

  return (
    <View style={styles.fullscreen}>
      <LeafletView
        onMessageReceived={onMessageReceived}
        mapMarkers={map.mapMarkers}
        mapShapes={map.mapShapes}
        mapCenterPosition={map.mapCenterPosition}
        doDebug={false}
      />
      <IconButton
        hide={trail == null}
        style={styles.floatButton}
        title={trail != null ? trail.name : null}
        size={24}
        onPress={() => { openItem(trail); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  floatButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default TrailsMap;