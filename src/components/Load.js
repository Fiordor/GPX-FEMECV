import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import DB from "../utilities/Database";

const Load = ({ load, resolve }) => {

  const getTrails = async () => {

    await DB.open();
    let sql = 'SELECT id, name, condition, town, distance, time, ascent, descent, pointLat, pointLng, points FROM trails ORDER BY name';
    let trails = await DB.exec(sql);
    if (resolve != null) resolve(trails);
  }

  const getTrailsMin = async () => {

    await DB.open();
    let sql = 'SELECT id, link, town, points FROM trails';
    trails = await DB.exec(sql);

    if (resolve != null) resolve(trails);
  }

  const getPointsByTrailId = async (id) => {

    await DB.open();
    let points = await DB.exec('SELECT id, lat, lng FROM points WHERE trail = ? ORDER BY id', [id]);
    if (resolve != null) resolve(points);
  }

  const getTowns = async () => {

    await DB.open();
    let sql = 'SELECT DISCTINC(town) AS town FROM trails';
    trails = await DB.exec(sql);
    if (resolve != null) resolve(trails);
  }


  useEffect(() => {

    switch (load) {
      case 'getTrails' : getTrails(); break;
      case 'getTrailsMin' : getTrailsMin(); break;
      case 'getPointsByTrailId' : getPointsByTrailId(); break;
      case 'getTowns' : getTowns(); break;
    }

  }, []);

  if (load == 'done') {
    return null;
  } else {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size={64} />
      </View>
    );
  }
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