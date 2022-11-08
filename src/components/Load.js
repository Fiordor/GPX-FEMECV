import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import DB from "../utilities/Database";

const Load = ({ hide = false, resolve = null }) => {

  const loadTrails = async () => {

    let trails = [];

    await DB.open();
    trails = await DB.exec('SELECT * FROM trails');

    for (let i = 0; i < trails.length; i++) {
      if (trails[i].points == 1) {
        trails[i].points = await DB.exec('SELECT id, lat, lng FROM points WHERE trail = ? ORDER BY id', [trails[i].id]);
      }
    }

    if (resolve != null) resolve(trails);
  }


  useEffect(() => {
    loadTrails();
  }, []);


  if (hide) return null;

  return (
    <View style={styles.fullscreen}>
      <ActivityIndicator size={64} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default Load;