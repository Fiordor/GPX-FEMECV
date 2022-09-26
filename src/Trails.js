
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import DomParser from 'react-native-html-parser';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from './IconButton';
import Load from './Load';
import Toolbar from './Toolbar';

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

    navigation.navigate('Picker', { pickerID: 'picker', screen: 'Trails', array: out });
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

const TrailList = ({ trails, trailsLength, openItem }) => {

  const renderItem = ({ item }) => {

    return (
      <TouchableOpacity
        style={item.coordenadas == 0 ? styles.itemDisabled : styles.item}
        disabled={item.coordenadas == 0}
        onPress={() => { openItem(item); }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text>{item.estado}</Text>
        <Text>{item.municipio} / {item.entidad}</Text>
        <Text>{item.tiempo} {item.subida} {item.bajada}</Text>
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

const TrailMap = ({ updateCoordinates }) => {

  if (global.trails.some(t => { return t.coordenadas == null })) {
    return (
      <View style={styles.fullscreenCenter}>
        <Button
          onPress={() => { updateCoordinates(); }}
          title='Cargar mapa'
        />
      </View>
    );
  } else {
    return (
      <View style={styles.fullscreen}>
        <Text>Están todos cargados</Text>
      </View>
    );
  }

}

const Trails = ({ route, navigation }) => {

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

  const updateCoordinates = () => {
    navigation.navigate('Load', { loadID: 'id', screen: 'Trails', load: 'update-coordinates' });
  }

  const updateTrails = () => {
    navigation.navigate('Load', { loadID: 'id', screen: 'Trails', load: 'update-trails' });
  }

  const afterLoad = (t) => {
    if (t.length) {
      global.trails = t;
      setTrails(t);
      setTrailsLength(t.length);
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
      <TrailMap
        updateCoordinates={updateCoordinates}
        />
      {/*
      <TrailList
        trails={trails}
        trailsLength={trailsLength}
        openItem={openItem}
      />
      */}
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