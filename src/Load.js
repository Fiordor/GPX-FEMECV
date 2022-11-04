
import { useNetInfo } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import DomParser from 'react-native-html-parser';
import { deleteCoordinates, deleteRutas, initDatabase, insertCoordinate, insertRuta, insertRutas, selectDatabase, sqlStatement } from './utilities/database1';

const DOMAIN = 'https://senders.femecv.com/';
const RESET = 'https://senders.femecv.com/es/senderos/reset';
const INDEX_LIST = 'https://senders.femecv.com/es/senderos/indexListado/';

const extractTrails = async (setInfo) => {

  return new Promise(async (resolve, reject) => {

    let index = 1, code = 200, rutas = [], cont = 0;

    const done = () => { if (code != 200 && cont == index - 1) { resolve(rutas); } }

    while (code == 200) {

      response = await fetch(INDEX_LIST + index);
      code = parseInt(await response.status);

      if (code == 200) {

        index++;

        //reading page by page
        setInfo('Reading page...' + index);
        response.text().then((text) => {
          let parser = new DomParser.DOMParser();
          let html = parser.parseFromString(text, 'text/html');
          let row = html.getElementByClassName('row');

          //extract json for each row
          for (let i = 0; i < row.childNodes.length; i++) {
            let node = row.childNodes.item(i);
            if (!isNodeEmpty(node)) {
              let n = extractTrailInfo(node);
              //############################
              //CAMBIAR EL BUSCAR DUPLICADOS
              //############################
              if (rutas.find(r => r.link == n.link) == undefined) {
                rutas.push(n);
              }
            }
          }

          cont++;
          done();
        });
      } else {
        done();
      }
    }
  });
}

const extractTrailInfo = (node) => {

  let info = {
    photo: '',
    link: '',
    name: '',
    entidad: '',
    estado: '',
    municipio: '',
    distancia: '',
    tiempo: '',
    subida: '',
    bajada: ''
  }

  let parser = new DomParser.DOMParser();

  let listingBox = node.childNodes.item(1);
  listingBox = parser.parseFromString(listingBox.toString(), 'text/html');

  let img = listingBox.documentElement.querySelect('img')[0];
  img = img.getAttribute('src');
  info.photo = img.startsWith('https') ? img : DOMAIN + img;

  listingBox = listingBox.childNodes.item(0);

  let infoResumen = listingBox.childNodes.item(3)

  let denominacionSendero = infoResumen.childNodes.item(1);

  let link = parser.parseFromString(denominacionSendero.toString(), 'text/html');
  link = link.documentElement.querySelect('a')[0];
  info.link = DOMAIN.substring(0, DOMAIN.length - 1) + link.getAttribute('href');

  info.name = getChild2Node(link, 1, 0);

  info.entidad = getChild2Node(denominacionSendero, 5, 0).substring(19);
  info.estado = getChild2Node(denominacionSendero, 7, 0).substring(27);

  let datosSendero = infoResumen.childNodes.item(3);

  info.municipio = getChild2Node(datosSendero, 1, 1);
  info.distancia = getChild2Node(datosSendero, 3, 2);
  info.tiempo = getChild2Node(datosSendero, 5, 2);
  info.subida = getChild2Node(datosSendero, 7, 2);
  info.bajada = getChild2Node(datosSendero, 9, 2);

  return info;
}

const extractCoordinates = async (trails, setInfo) => {

  let coordinates = [], response = 0;

  const extract = async (trail, done) => {
    try {
      //donwload html page
      let link = await extractLinkGPX(trail.link);
      if (link == null) {
        await sqlStatement('UPDATE rutas SET coordenadas = 0 WHERE id = ?', [trail.id]);
      } else {
        await sqlStatement('UPDATE rutas SET coordenadas = 1 WHERE id = ?', [trail.id]);
        //download .gpx
        let xml = await requestGPX(link);
        let cs = extractCoordinatesGPX(xml);
        cs.forEach((c, i) => {
          let c1 = { id: i + 1, ruta: trail.id, ele: c.ele, lat: c.lat, lon: c.lon };
          coordinates.push(c1);
        });
      }

    } catch (error) {
      await sqlStatement('UPDATE rutas SET coordenadas = 0 WHERE id = ?', [trail.id]);
    } finally {
      done();
    }
  }

  return new Promise(async (resolve, reject) => {

    const done = () => {
      response++;
      setInfo('Descargando información de la ruta...' + response);
      if (response == trails.length) { resolve(coordinates); }
    }

    for (let i = 0; i < trails.length; i++) {
      const trail = trails[i];
      extract(trail, done);
    }
  });
}

const extractCoordinatesGPX = (xml) => {

  let parser = new DomParser.DOMParser();
  let grossXML = parser.parseFromString(xml, 'text/html');
  let rows = grossXML.getElementsByTagName('trkpt');

  let coordinates = [];

  for (let index = 0; index < rows.length; index++) {
    const element = rows[index];
    let lat = parseFloat(element.getAttribute('lat'));
    let lon = parseFloat(element.getAttribute('lon'));

    let ele = element.getElementsByTagName('ele')[0];
    ele = parseFloat(ele.childNodes[0].data);
    let time = element.getElementsByTagName('time')[0];
    time = time != undefined ? time.childNodes[0].data : '0';

    let c = { lat: lat, lon: lon, ele: ele, time: time };
    coordinates.push(c);
  }

  return coordinates;
}

const extractLinkGPX = async (link) => {

  //request page
  let response = await fetch(link);
  let code = parseInt(await response.status);

  if (code != 200) { return null; }

  let text = await response.text();
  //console.log('antes de quitar espacios', text.length);
  text = text.trim().split(/[\s,\t,\n]+/).join(' ');
  //console.log('despues de quitar espacios', text.length);

  let fin = text.indexOf('Track', text.indexOf('.gpx'));
  if (fin == -1) { return null; }
  //console.log('extraer href fin', fin);

  text = text.substring(0, fin);
  let ini = text.lastIndexOf('<a');
  //console.log('extraer href ini', ini)

  text = text.substring(ini, text.length);

  text = text.split(' ');
  text = text.find((str) => str.startsWith('href'));

  let gpxlink = text.substring(6, text.length - 1);

  return gpxlink;
}

const getChild2Node = (node, i, j) => {

  let node1 = node.childNodes.item(i);
  if (node1 != null) {
    let node2 = node1.childNodes.item(j)
    if (node2 != null) {
      return node2.toString().trim();
    }
  }
  return '';
}

const isNodeEmpty = (node) => {
  return node.toString().replaceAll(/\s/g, '') == 0;
}

const requestGPX = async (link) => {

  let response = await fetch(link);
  let code = parseInt(await response.status);

  if (code != 200) { return null; }

  let text = await response.text();
  return text;
}

const specialChars = (str) => {

  let result = str.replaceAll(`"`, '');
  return result.replaceAll(`'`, '');
}


const Load = ({ route, navigation }) => {

  const [info, setInfo] = useState('');
  const parent = route.params.screen;
  const id = route.params.loadID;

  const afterLoad = (data) => {
    let result = {
      id: id,
      data: data
    }
    navigation.navigate(parent, { load: result });
  }

  const beforeLoad = async (params) => {

    try {
      setInfo('Open data...');
      await initDatabase();
    } catch (error) {
      Alert.alert('Error', error.toString());
      return;
    }

    switch (params.load) {
      case 'load-trail': loadTrail(params.input); break;
      case 'load-trails': loadTrails(); break;
      case 'update-trails': updateTrails(); break;
      case 'update-coordinates': updateCoordinates(); break;
    }
  }

  const loadTrail = async (trail) => {

    try {

      //there is connection
      //if (netinfo.isConnected != true) { Alert.alert('Error', 'Sin conexión'); return; }

      //test if exists coordinates
      setInfo('Buscando ruta...');
      let coordinates = await selectDatabase(`
        SELECT id, lat, lon
        FROM coordenadas
        WHERE ruta = ?
        ORDER BY id`, [trail.id]);
      if (coordinates.length > 0) { afterLoad({ trail: trail, coordinates: coordinates }); return; }

      //clear cache
      setInfo('Preparando descarga...');
      let response = await fetch(RESET);
      let code = parseInt(await response.status);
      if (code != 200) { throw new Error(code + ' No se pudo limpiar la caché'); }

      //donwload html page
      setInfo('Descargando información de la ruta...');
      let link = await extractLinkGPX(trail.link);
      if (link == null) {
        await sqlStatement('UPDATE rutas SET coordenadas = 0 WHERE id = ?', [trail.id]);
        throw new Error('No existe el archivo GPX');
      }

      //download .gpx
      setInfo('Descargando ruta...');
      let xml = await requestGPX(link);
      coordinates = extractCoordinatesGPX(xml);

      //insert coordenades
      let insertSQL = 'INSERT INTO coordenadas (id, ruta, ele, lat, lon) VALUES';
      coordinates.forEach((c, i) => {
        let sql = '';
        sql += ` (${i + 1}, ${trail.id}, ${c.ele}, ${c.lat}, ${c.lon}),`;
        insertSQL += sql;
      });
      insertSQL = insertSQL.substring(0, insertSQL.length - 1) + ';';
      await sqlStatement(insertSQL);
      await sqlStatement('UPDATE rutas SET coordenadas = 1 WHERE id = ?', [trail.id]);

      setInfo('Cargando ruta...');
      coordinates = await sqlStatement(`
        SELECT id, lat, lon
        FROM coordenadas
        WHERE ruta = ?
        ORDER BY id`, [trail.id]);

      afterLoad({ trail: trail, coordinates: coordinates });

    } catch (error) {
      //console.error(error);
      //Alert.alert('Error', error.toString());
      afterLoad({
        trail: trail,
        coordinates: [],
        error: error.toString()
      });
    }
  };

  const loadTrails = async () => {

    try {

      setInfo('Loading trails...');
      let trails = await sqlStatement('SELECT * FROM rutas ORDER BY name');
      for (let i = 0; i < trails.length; i++) {
        if (trails[i].coordenadas == 1) {
          let coordenadas = await sqlStatement(`SELECT id, lat, lon FROM coordenadas WHERE ruta = ? ORDER BY id`, [trails[i].id]);
          trails[i].coordenadas = coordenadas;
        }
      }
      afterLoad(trails);

    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  }

  const updateCoordinates = async () => {

    try {
      //clear cache
      setInfo('Preparando descarga...');
      let response = await fetch(RESET);
      let code = parseInt(await response.status);
      if (code != 200) {
        Alert.alert('Error ' + code);
        afterLoad(null);
        return;
      }

      let trails = await sqlStatement('SELECT * FROM rutas ORDER BY name');
      let coordinates = await extractCoordinates(trails, setInfo);

      console.log('coordineates', coordinates);
      afterLoad(trails);

    } catch (error) {
      console.error(error.toString());
      Alert.alert('Load error', error.toString());
    }

  }

  const updateTrails = async () => {

    try {

      //there is connection
      //if (netinfo.isConnected != true) { Alert.alert('Error', 'Sin conexión'); return; }

      //clear cache
      setInfo('Preparando descarga...');
      let response = await fetch(RESET);
      let code = parseInt(await response.status);
      if (code != 200) {
        Alert.alert('Error ' + code);
        afterLoad(null);
        return;
      }

      //clear database
      setInfo('Limpiando datos...');
      await deleteRutas();

      //ask for each page
      let rutas = await extractTrails(setInfo);
      console.log('rutas', rutas.length);

      //insert all rutas
      let insertSQL = 'INSERT INTO rutas (id, name, link, photo, entidad, estado, municipio, distancia, tiempo, subida, bajada, coordenadas) VALUES';
      rutas.forEach((r, i) => {
        let sql = '';
        sql += ` (${i + 1}, "${specialChars(r.name)}", "${r.link}", "${r.photo}", "${specialChars(r.entidad)}",`;
        sql += ` "${specialChars(r.estado)}", "${specialChars(r.municipio)}", "${r.distancia}", "${r.tiempo}",`;
        sql += ` "${r.subida}", "${r.bajada}", NULL),`;
        insertSQL += sql;
      });
      insertSQL = insertSQL.substring(0, insertSQL.length - 1) + ';';
      await sqlStatement(insertSQL);

      //let coordinates = await extractCoordinates(rutas, setInfo);
      //console.log('coordinates', coordinates.length);

      //read from database
      setInfo('Cargando rutas...');
      let trails = await sqlStatement('SELECT * FROM rutas ORDER BY name');
      for (let i = 0; i < trails.length; i++) {
        if (trails[i].coordenadas == 1) {
          let coordenadas = await sqlStatement(`SELECT id, lat, lon FROM coordenadas WHERE ruta = ? ORDER BY id`, [trail[i].id]);
          trails[i].coordenadas = coordenadas;
        }
      }
      afterLoad(trails);

    } catch (error) {
      console.error(error.toString());
      Alert.alert('Error', error.toString());
    }
  };

  useEffect(() => {

    beforeLoad(route.params);
  }, []);

  return (
    <View style={styles.fullscreen}>
      <Text>{info}</Text>
    </View>
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

export default Load;