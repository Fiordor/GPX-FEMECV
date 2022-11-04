
import DomParser from 'react-native-html-parser';

const DOMAIN = 'https://senders.femecv.com/';
const RESET = 'https://senders.femecv.com/es/senderos/reset';
const INDEX_LIST = 'https://senders.femecv.com/es/senderos/indexListado/';

const isNodeEmpty = (node) => {
  return node.toString().replaceAll(/\s/g, '') == 0;
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

const readTrailInfo = (node) => {

  let info = {
    photo: '',
    link: '',
    name: '',
    entity: '',
    condition: '',
    town: '',
    distance: '',
    time: '',
    ascent: '',
    descent: ''
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

  info.entity = getChild2Node(denominacionSendero, 5, 0).substring(19);
  info.condition = getChild2Node(denominacionSendero, 7, 0).substring(27);

  let datosSendero = infoResumen.childNodes.item(3);

  info.town = getChild2Node(datosSendero, 1, 1);
  info.distance = getChild2Node(datosSendero, 3, 2);
  info.time = getChild2Node(datosSendero, 5, 2);
  info.ascent = getChild2Node(datosSendero, 7, 2);
  info.descent = getChild2Node(datosSendero, 9, 2);

  info.name = specialChars(info.name);
  info.entity = specialChars(info.entity);
  info.condition = specialChars(info.condition);
  info.town = specialChars(info.town);

  return info;
}

const specialChars = (str) => {
  let result = str.replaceAll(`"`, '');
  return result.replaceAll(`'`, '');
}


const cleanCache = async () => {

  return new Promise(async (resolve, reject) => {

    let response = await fetch(RESET);
    let code = parseInt(await response.status);
    if (code == 200) {
      resolve();
    } else {
      reject('Error ' + code);
    }
  });
}

const readTrails = async (setInfo = null) => {

  return new Promise(async (resolve, reject) => {

    let index = 1, code = 200, cont = 0;
    let mapTrail = new Map();

    const done = () => {
      if (code != 200 && cont == index - 1) {
        mapTrail = Array.from(mapTrail.values());
        resolve(mapTrail);
      }
    }

    while (code == 200) {

      response = await fetch(INDEX_LIST + index);
      code = parseInt(await response.status);

      if (code != 200) { done(); }
      else {
        index++;

        //reading page by page
        if (setInfo != null )setInfo('Reading page...' + index);
        response.text().then((text) => {
          let parser = new DomParser.DOMParser();
          let html = parser.parseFromString(text, 'text/html');
          let row = html.getElementByClassName('row');

          //extract json for each row
          for (let i = 0; i < row.childNodes.length; i++) {
            let node = row.childNodes.item(i);
            if (!isNodeEmpty(node)) {
              let n = readTrailInfo(node);
              if (!mapTrail.has(n.link)) { mapTrail.set(n.link, n);
              }
            }
          }

          cont++;
          done();
        });
      }
    }
  });

}


class Web {

  static cleanCache = cleanCache;

  static getTrails = readTrails;
}

export default Web;