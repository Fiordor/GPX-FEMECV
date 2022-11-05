# GPX-FEMECV
React Native project. Use local storage with SQLite, Leaflet as map library, render more than 600 items and read and parse html info. Read every hiking trails page in HTML from hiking club. Read every page format HTML and parse the usefull information to JSON. Also for each hiking trail get GPX file and parse to JSON too. Finally you can view the information in list or map format.

## Develop
1. Connect smartphone to PC
2. Active USB debuggin
3. Active data transfer
4. Run project ```npx react-native start```
5. Run project on android ```npx react-native run-android```

## Software

### Screens and navigation
<img src="./doc_img/screens_navigation.png" height="250" alt="screens_navigation">

1. To initialize the app, first load every trail and formated to array that app will work properly. If not exists the trails, must download from the website.

2. Home page contains a list of trails where you can click and open or a map with each trail where you can click either. Also has two functions, navigate to open the filters and pick quickly or navigate to download or update the trails of each town.
    + Manager page has two list, one with trails to download and one with trils already download but update.
    + Filter page has a picker with the alphabet which filter a list of towns.

### Load page
When run the app, first, if not exists create the database. Then try to get data from DB, if is empty start to download every trails information. After that, get data from DB and format into array object to work with. As the id number is asigned sequentially we can use the array as map data, where the key is the id -1 trail. If the trail has points, use the weak type and asign the array points in points attribute of trail object. When the process finish, pass the trails to Home page.

The request is page by page, and each page has several trails. Is made page by page beacuse do not know which is the limit, but can be interesting test which is better: one by one, or multiple request.

When we have to request all trails from the website, they can have duplicate trails. To resolve that, in first time I think that there are three ways:
+ use an array and test before every insertion if exists the trail.
+ use an array with string index (an object) as a map.
+ use the Map object from js.
Remember that the result must be an array and we can use the link attribute has id. How the insertion is to fast to take the time, I take the total of insertions.

Array
```js
let arrayTrail = [], arrayTime = 0;
while () {
    let start = new Date().getTime(), finish = 0;
    if (arrayTrail.find(t => t.link == trail.link) == undefined) {
        arrayTrail.push(trail);
    }
    finish = new Date().getTime();
    arrayTime += finish - start;
}

//console.log(arrayTime) => 148
```

Object
```js
let objectTrail = {}, objectTime = 0;
while () {
    let start = new Date().getTime(), finish = 0;
    if (objetTrail[trail.link] == undefined) {
        objetTrail[trail.link] = trail;
    }
    finish = new Date().getTime();
    objectTime += finish - start;
}

let start = new Date().getTime();
objetTrail = Object.values(objetTrail);
let finish = new Date().getTime();
objectTime += finish - start;

//console.log(objectTime) => 14
```

Map
```js
let mapTrail = new Map(), mapTime = 0;
while () {
    let start = new Date().getTime(), finish = 0;
    if (!mapTrail.has(trail.link)) {
        mapTrail.set(trail.link, trail);
    }
    finish = new Date().getTime();
    mapTime += finish - start;
}

let start = new Date().getTime();
mapTrail = Array.from(mapTrail.values());
let finish = new Date().getTime();
mapTime += finish - start;

//console.log(mapTime) => 7
```

The object methods is close to map, in fact, there are times that can be faster than map, but the most of the cases, map is better.


### Home page
If there is no data, show a warning, else show the map as default. The home page can show the trails in a map or list. In the toolbar can open the manager page. Also has two buttons, one to search which indicates the town about looking for and open the filter page, the other change the display between map and list.

<img src="./doc_img/page_home.png" height="250" alt="page_home">

The Home page allways must recive the follow json as params:
```
{
    trails: Array,
    filter: trail.town | undefined,
    view: 'map' | 'list'
}
```

### Manager page
Download or update data. Like this is a small project, I do not contemplate the trails info will be update, just its points. The page has an indicator of queue length and three buttons to change view.
+ Download: list the trails whose points attribute is null, this means that we have not downloaded before the points.
+ Update: list the trails whose points attribute is false or an array, this means that the trail has or not points.
+ Queue: list of trails to process.

<img src="./doc_img/page_manager.png" height="250" alt="page_manager">

The Manager page allways must recive the follow json as params:
```
{
    trails: Array
}
```

<img src="./doc_img/manager_process.png" height="250" alt="manager_process">

To process the trails use the next steps:

With the main trails array, loop all the array and split the data into two types: downloadTrails, the trails whose points attribute is null and we do not know if has data or updateTrails, the trails whose points attribute has information. The data structure is Map (we studied before that object with string index is less efficient than Map object). The key is the town, the value to group every trails, and the value is an array of trails with the same town.

When press download or update item, it pass into queueTrails. One by one, delete if has data on DB and request its points. Then save it and update the item. Also must update the main trails array. Finally add the item to updateTrails if not exists and delete from downloadTrails if exists.

### Filter page

### Trail page