import { StyleSheet, Text, View } from "react-native";
import IconButton from "./IconButton";

const ToolbarItem = ({ icon = null, text = null, button = null }) => {

  if (icon == null && text == null) {
    return null;
  } else if (icon == null && button == null) {
    return <Text>{text}</Text>
  } else {
    return <IconButton onPress={button} icon={icon} text={text} />;
  }
}

const Toolbar = ({
  leftIcon = null, leftText = null, leftButton = null,
  rightIcon = null, rightText = null, rightButton = null }) => {

  

  return (
    <View style={styles.toolbar} >
      <ToolbarItem icon={leftIcon} text={leftText} button={leftButton} />
      <ToolbarItem icon={rightIcon} text={rightText} button={rightButton} />
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
  }
});

export default Toolbar;