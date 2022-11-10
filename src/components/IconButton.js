
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

const IconButton = ({hide=false, disabled = false, onPress, color='#000', title=null, icon=null, style = null, size=14}) => {

  if (hide) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={ disabled ? [style, {opacity: 0.5}] : style}>
      { icon != null &&
        <FontAwesomeIcon
          icon={['fas', icon]}
          size={size}
          color={color} />
      }
      { title != null &&
        <Text
          style={ title != null && icon != null
            ? [styles.margin, {color: color}, {fontSize: size}]
            : [{color: color}, {fontSize: size}]
          } >
            {title}
        </Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  margin: {
    marginLeft: 8
  }
});

export default IconButton;