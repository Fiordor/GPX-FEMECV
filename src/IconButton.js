
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

const IconButton = ({children, onPress, title=null, icon=null, style}) => {

  return (
    <TouchableOpacity
      onPress={onPress}
      style={style}>
      {icon != null && <FontAwesomeIcon icon={['fas', icon]} />}
      {title != null && <Text>{title}</Text>}
    </TouchableOpacity>
  );
}

export default IconButton;