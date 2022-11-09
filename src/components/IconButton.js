
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

const IconButton = ({hide=false, disabled = false, onPress, title=null, icon=null, style = null, size=14}) => {

  if (hide) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={style}>
      {icon != null && <FontAwesomeIcon icon={['fas', icon]} size={size}/>}
      {title != null && <Text style={ title != null && icon != null ? styles.margin : null } >{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  margin: {
    marginLeft: 8
  }
});

export default IconButton;