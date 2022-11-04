
import { openDatabase } from 'react-native-sqlite-storage';

const createTables = async (db) => {
  
  return new Promise((resolve, reject) => {

    if (db == null) { reject('No database value') }
    let t1 = false, t2 = false;
    const done = () => { if (t1 && t2) { resolve(); } }

    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS trails (
            id INTEGER PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            link VARCHAR(255) NOT NULL,
            photo VARCHAR(255) NOT NULL,
            entity VARCHAR(255) NOT NULL,
            condition VARCHAR(255) NOT NULL,
            town VARCHAR(255) NOT NULL,
            distance VARCHAR(10) NOT NULL,
            time VARCHAR(8) NOT NULL,
            ascent VARCHAR(10) NOT NULL,
            descent VARCHAR(10) NOT NULL,
            points INTEGER(1)
          )`, [],
        (sqlTxn, res) => { t1 = true; done(); },
        (error) => { reject(error.message); }
      );

      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS points (
            id INTEGER NOT NULL,
            trail INTEGER NOT NULL,
            ele DECIMAL(4,15) NOT NULL,
            lat DECIMAL(3,15) NOT NULL,
            lng DECIMAL(3,15) NOT NULL,
            PRIMARY KEY(id, trail)
          )`, [],
        (sqlTxn, res) => { t2 = true; done();},
        (error) => { reject(error.message); }
      );
    });
  });
}

const getDatabase = async () => {
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

const parseSQLResult = (rows) => {
  let array = [];
  for(let i = 0; i < rows.length; i++) {
    let item = rows.item(i);
    array.push(item);
  }
  return array;
}

class Database {

  static db = null;

  static open = async () => {

    let result = {};
    try {
  
      if (this.db == null) { this.db = await getDatabase(); }
      await createTables(this.db);
      result = { ok: true, message: this.db};
  
    } catch (e) {
      result =  { ok: false, message: e };
    }
  
    return new Promise((resolve, reject) => {
      if (result.ok) { resolve(result.message) }
      else { reject(result.message) }
    });
  };

  static exec = async (sql, args = []) => {

    if (this.db == null) {
      try { await this.open(); } catch (e) { }
    }

    return new Promise((resolve, reject) => {

      if (this.db == null) { reject('Database connection null'); }
  
      this.db.executeSql( sql, args,
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
  };
}

export default Database;