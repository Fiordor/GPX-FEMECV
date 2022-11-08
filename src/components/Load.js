import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import DB from "../utilities/Database";

const Load = ({ hide = false, resolve = null }) => {

  const getTrails = async () => {

    let trails = [];

    await DB.open();
    let sql = 'SELECT id, name, condition, town, distance, time, ascent, descent, pointLan, pointLng, points FROM trails';
    trails = await DB.exec(sql);

    if (resolve != null) resolve(trails);
  }

  const getPointsByTrailId = async (id) => {
    let points = await DB.exec('SELECT id, lat, lng FROM points WHERE trail = ? ORDER BY id', [id]);
    if (resolve != null) resolve(points);
  }


  useEffect(() => {
    getTrails();
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