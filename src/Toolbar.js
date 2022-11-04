
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import IconButton from './components/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

const Toolbar = ({ styleAbsolute = false, left = null, leftIcon = null, right = null, rightIcon = null, title = null }) => {

  return (
    <View style={styleAbsolute ? styles.toolbarAbs : styles.toolbar} >
      { left != null && <IconButton onPress={left} icon={leftIcon} />}
      { title != null && <Text>{title}</Text>}
      { right != null && <IconButton onPress={right} icon={rightIcon} /> }
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    height: 50,
    backgroundColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    zIndex: 1
  },
  toolbarAbs: {
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%'
  }
});

export default Toolbar;