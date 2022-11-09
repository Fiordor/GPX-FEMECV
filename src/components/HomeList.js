import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HomeList = ({ hide = false, trails = [], openItem = null }) => {

  if (hide) return null;

  const renderItem = ({ item }) => {

    return (
      <TouchableOpacity
        style={item.points == 0 ? styles.itemDisabled : styles.item}
        disabled={item.poins == 0}
        onPress={() => { if (openItem != null) openItem(item.id); }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text>{item.condition}</Text>
        <Text>{item.town}</Text>
        <View style={styles.rowDetails}>
          <Text style={styles.itemDetails}>
            <FontAwesomeIcon icon={['fas', 'stopwatch']} size={12} />
          </Text>
          <Text style={styles.itemDetails}>
            {item.time.length ? item.time : '--:--:--'}
          </Text>
          <Text style={styles.itemDetails}>
            <FontAwesomeIcon icon={['fas', 'arrow-trend-up']} size={12} />
          </Text>
          <Text style={styles.itemDetails}>
            {item.ascent.length ? item.ascent : '-- m'}
          </Text>
          <Text style={styles.itemDetails}>
            <FontAwesomeIcon icon={['fas', 'arrow-trend-down']} size={12} />
          </Text>
          <Text style={styles.itemDetails}>
            {item.descent.length ? item.descent : '-- m'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (trails.length) {
    return (
      <View style={styles.fullscreen}>
        <View style={styles.fullscreenAbs}>
          <FlashList
            data={trails}
            renderItem={renderItem}
            estimatedItemSize={120}
          />
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.fullscreen}>
        <Text>Trails: {trails.length}</Text>
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
    backgroundColor: 'yellow',
    position: 'relative'
  },
  fullscreenAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  item: {
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 8,
    marginRight: 8,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 4
  },
  itemDisabled: {
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 8,
    marginRight: 8,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    opacity: 0.5
  },
  itemName: {
    fontWeight: 'bold'
  },
  rowDetails: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemDetails: {
    fontSize: 14,
    marginRight: 8
  }
});

export default HomeList;