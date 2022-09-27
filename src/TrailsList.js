
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  if (trails.length) {
    return (
      <FlashList
        data={trails}
        renderItem={renderItem}
        estimatedItemSize={120}
      />
    );
  } else {
    return (
      <View style={styles.fullcontainer}>
        <Text>Trails: {trailsLength}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullcontainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16
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
  },
  itemDetails: {
    fontSize: 14
  }
});

export default TrailsList;