import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DB from './utilities/Database';
import Web from './utilities/Web';

const PageLoad = ({ route, navigation }) => {

  const [msgProcess, setMsgProcess] = useState('');

  const loadTrails = async () => {

    let trails = [];

    try {
      await DB.open();
      trails = await DB.exec('SELECT * FROM trails ORDER BY name');
    } catch (e) {
      console.error(e);
      return;
    }

    if (!trails.length) {

      await Web.cleanCache();
      await DB.exec('DELETE FROM trails');
      await DB.exec('DELETE FROM points');
      trails = await Web.getTrails(setMsgProcess);

      setMsgProcess('Save trails...')

      let sql = 'INSERT INTO trails (id, name, link, photo, entity, condition, ';
      sql +=  'town, distance, time, ascent, descent, points) VALUES';
      trails.forEach((t, i) => {
        let values = '';
        values += ` (${i + 1}, "${t.name}", "${t.link}", "${t.photo}", "${t.entity}",`;
        values += ` "${t.condition}", "${t.town}", "${t.distance}", "${t.time}",`;
        values += ` "${t.ascent}", "${t.descent}", NULL),`;
        sql += values;
      });
      sql = sql.substring(0, sql.length - 1) + ';';
      await DB.exec(sql);
    }

    setMsgProcess('Load trails...')
    trails = await DB.exec('SELECT * FROM trails ORDER BY name');

    for (let i = 0; i < trails.length; i++) {
      trails[i]['visible'] = true;
    }

    navigation.navigate('PageHome', { trails: trails, view: 'map' });
  }

  useEffect(() => {

    loadTrails();
  }, []);

  return (
    <SafeAreaView style={styles.fullscreen}>
      <ActivityIndicator size={64} />
      <Text>{msgProcess}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  fullscreen: {
    height: '100%',
    width: '100%',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default PageLoad;