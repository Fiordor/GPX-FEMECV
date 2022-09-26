
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Picker = ({ route, navigation }) => {

  const [array, setArray] = useState([]);
  const parent = route.params.screen;
  const id = route.params.pickerID;

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => { afterChoose(item); }}>
        <Text style={styles.itemName}>{item}</Text>
      </TouchableOpacity>
    );
  }

  const afterChoose = (item) => {
    let picker = {
      id: id,
      selection: item
    }
    navigation.navigate(parent, { picker: picker });
  }

  useEffect(() => {
    let array = route.params.array;
    setArray(array);
  }, []);

  return (
    <View style={styles.fullscreen}>
      <FlashList style={styles.container}
        data={array}
        renderItem={renderItem}
        estimatedItemSize={80} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingLeft: 32,
    paddingRight: 32
  },
  item: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 4
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 24
  }
});

export default Picker;