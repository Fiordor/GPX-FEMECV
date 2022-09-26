
import { openDatabase } from 'react-native-sqlite-storage';

var db = null;

const open = async () => {
  return new Promise((resolve, reject) => {

    let localdb = openDatabase({ name: 'database.db' },
      () => {
        resolve(localdb);
      }, (e) => {
        reject(`Error de acceso a la base de datos ${e.code} ${e.message}`);
      }
    );
  });
}

const createTables = async () => {

  return new Promise((resolve, reject) => {

    if (db == null) { reject('No database value') }
    let t1 = false, t2 = false;
    const done = () => { if (t1 && t2) { resolve(); } }

    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS rutas (
            id INTEGER PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            link VARCHAR(255) NOT NULL,
            photo VARCHAR(255) NOT NULL,
            entidad VARCHAR(255) NOT NULL,
            estado VARCHAR(255) NOT NULL,
            municipio VARCHAR(255) NOT NULL,
            distancia VARCHAR(10) NOT NULL,
            tiempo VARCHAR(8) NOT NULL,
            subida VARCHAR(10) NOT NULL,
            bajada VARCHAR(10) NOT NULL,
            coordenadas INTEGER(1)
          )`, [],
        (sqlTxn, res) => { t1 = true; done(); },
        (error) => { reject(error.message); }
      );

      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS coordenadas (
            id INTEGER NOT NULL,
            ruta INTEGER NOT NULL,
            ele DECIMAL(4,15) NOT NULL,
            lat DECIMAL(3,15) NOT NULL,
            lon DECIMAL(3,15) NOT NULL,
            PRIMARY KEY(id, ruta)
          )`, [],
        (sqlTxn, res) => { t2 = true; done();},
        (error) => { reject(error.message); }
      );
    });
  });
}

const parseSQLResult = (rows) => {
  let array = [];
  for(let i = 0; i < rows.length; i++) {
    let item = rows.item(i);
    array.push(item);
  }
  return array;
}

export const deleteCoordinates = async (ruta) => {

  return new Promise((resolve, reject) => {

    if (db == null) { reject('Database connection null'); }

    db.executeSql( 'DELETE FROM coordenadas WHERE ruta = ?', [ruta],
      (result) => { resolve(); },
      (error) => { reject(error.message); }
    );
  });
}

export const deleteRutas = async () => {

  return new Promise((resolve, reject) => {

    if (db == null) { reject('Database connection null'); }
    let t1 = false, t2 = false;
    const done = () => { if (t1 && t2) { resolve(); } }

    db.executeSql( 'DELETE FROM coordenadas', [],
      (result) => { t1 = true; done(); },
      (error) => { reject(error.message); }
    );

    db.executeSql( 'DELETE FROM rutas', [],
      (result) => { t2 = true; done(); },
      (error) => { reject(error.toString()); }
    );
  });
}

export const selectDatabase = async (sql, args = []) => {

  return new Promise((resolve, reject) => {

    if (db == null) { reject('Database connection null'); }
    db.executeSql( sql, args,
      (result) => {
        resolve(parseSQLResult(result.rows));
      }, (error) => {
        reject(error.toString());
      }
    );
  });
}

export const sqlStatement = async (sql, args = []) => {
  return new Promise((resolve, reject) => {

    if (db == null) { reject('Database connection null'); }

    db.executeSql( sql, args,
      (result) => {
        if (sql.trim().startsWith('SELECT')) {
          resolve(parseSQLResult(result.rows));
        } else {
          resolve(true);
        }
      }, (error) => {
        reject(error.message);
      }
    );
  });
}



export const initDatabase = async () => {

  let result = {};
  try {

    if (db == null) { db = await open(); }
    await createTables(db);
    result = { ok: true, message: db};

  } catch (e) {
    result =  { ok: false, message: e };
  }

  return new Promise((resolve, reject) => {
    if (result.ok) { resolve(result.message) }
    else { reject(result.message) }
  });
}