import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import DB from "../utilities/Database";

const Load = ({ load, input = null, resolve }) => {

  const getTrails = async () => {

    await DB.open();

    let args = [];
    let sql = 'SELECT id, name, condition, town, distance, time, ascent, descent, ';
    sql += 'pointLat, pointLng, points FROM trails';
    if (input != null) {
      sql += ' WHERE town = ?';
      args = [input];
    }
    sql += ' ORDER BY name';
    
    let trails = await DB.exec(sql, args);
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
    let sql = 'SELECT DISTINCT (town) AS town FROM trails ORDER BY town';
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

  }, [load, input]);

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