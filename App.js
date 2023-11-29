import React, { useState, useEffect } from 'react';
import {
  VirtualizedList,
  TouchableOpacity,
  Button,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';
import DialogInput from 'react-native-dialog-input';
import Geocoder from 'react-native-geocoding';
import * as Location from 'expo-location';

// create a style sheet for handling visual appearances, spacing, widths, and colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 50,
  },

  bcontainer: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 50,
    width: '100%'
  },

  list: {
    flex: 20,
    paddingTop: 2,
    alignItems: 'center'
  },
  
  rowblock: {
    flex: 0,
    height: 80,
    width: '100%',
    padding: 5,
    borderWidth: 5,
  },

  buttonContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 5,
    padding: 0,
    paddingTop: 0,
  },
   
  item: {
    padding: 0,
    fontSize: 12,
    height: 44,
  },

  title: {
    fontSize: 22,
  },
});

const Item = ({ item, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
    <Text style={[styles.title, textColor]}>{item.key}</Text>
  </TouchableOpacity>
);

//adds items from a json file to alist given: 
  //aurl (the url of the json file to load from)
  //alist (the list to add to)
  //asetlist (the setter function for alist)
  //asetmarkers (the setter function for the markers list [not given])
async function loadList(aurl,alist,asetlist,asetmarkers) {
  const response = await fetch(aurl);  // read the remote data file via fetch 'await' blocks
  const items = await response.json(); // parse the returned json object
  
  // add the returned list to the existing list
  items.forEach((item) => {
     alist.push(item);
  })
  
  // creates of copy of the modified alist for asetlist
  const newList = alist.map((item) => {return item});
  
  // creates a list of markers from alist
  const newMarkerList = alist.map((item) => {
    var newMarker =  <Marker
      coordinate={{latitude: item.latitude, longitude: item.longitude}}
      title={item.key}
      description={"Place"}
      onPress={(event) => {
      const markerId = event.nativeEvent.id;
      console.log('Another marker clicked', markerId)
    }}
    />;

    return newMarker;
  });

  //sets the newList and newMarkerList
  asetlist(newList);
  asetmarkers(newMarkerList);
}

//saves alist as a json at aurl given:
  //aurl (the url for the json to be saved to)
  //alist (the list to be saved)
async function saveList(aurl, alist) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alist)
    };

    await fetch(aurl, requestOptions);
}

//adds the user's current location to the list and marker list given:
  //asetlist (setter for the list [not given])
  //asetmarkers (setter for the markers list [not given])
async function addMyLocation(alist, amarkerlist, asetlist, asetmarkers) {
  let {status}  = await Location.requestForegroundPermissionsAsync();
   
  if (status !== 'granted') {
    asetlist( 'Permission to access location was denied');
  }

  let location = await Location.getCurrentPositionAsync({});

  var newList = [{
    key: "My Position", 
    selected: false, 
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  }];

  var newMarkerList = [<Marker
    coordinate={{latitude: location.coords.latitude,
    longitude: location.coords.longitude}}
    title={"My Position"}
    description={"Place"}
  />];
  
  newList = newList.concat(alist);
  newMarkerList = newMarkerList.concat(amarkerlist);

  asetlist(newList);
  asetmarkers(newMarkerList);
}

//data to populate the map before adding geocoder
//const someList = [{key: "boise", selected: false, latitude: 43.618881, longitude: -116.215019}];
//const someMarker = [<Marker coordinate={{latitude: 43.618881,longitude: -116.215019}} title={"boise"} description={"city"} />];

Geocoder.init("AIzaSyDqW8jK0xxnIRKTKXACxIK-q3UerQTiCsA");

//the guts - has all the buttons and displays the list as a virtualized list
//and functionality for each of the buttons and list
const VirtualList = () => {
  const [list, setlist] = useState([]);
  const [showAddMenu,setAddMenu] = useState(false);
  const [markers, setmarkers] = useState([]);
  

  //loads the list from a json url at start up
  useEffect(() => {
    var urladdress = "https://cs.boisestate.edu/~scutchin/cs402/codesnips/loadjson.php?user=tannerco";
    loadList(urladdress, list, setlist, setmarkers);
  }, []);

  //taggles the clicked item's 'selected' attribute
  function toggleList(aindex) {
    const newList = list.map((item, index) => {
      if (index == aindex) {
        if (item.selected) {
          item.selected = false;
        } else {
          mapref.current.animateToRegion({latitude: item.latitude, longitude: item.longitude, latitudeDelta: 0.1, longitudeDelta: 0.1});
          item.selected = true;
        }
      }
      else {
        item.selected = false;
      }

      return item;
    });

    setlist(newList);
  }

  //displays the add location DialogInput box when the '+' button is pressed
  function plusButton() {
    setAddMenu(true);
  }

  function plusMyLocationButton() {
    addMyLocation(list, markers, setlist, setmarkers);
  }

  //adds a location to the list based on the first result returned by Geocoder given alocation
  function addLocation(alocation) {  
    var location = {};
    
    Geocoder.from(alocation)
    .then(json => {
      location = json.results[0].geometry.location;
      
      var newList = [{key: alocation, selected: false, longitude: location.lng, latitude: location.lat }]
      var amark = <Marker
        coordinate={{latitude: location.lat, longitude: location.lng}}
        title={alocation}
        description={"Place"}
      />

      newList = newList.concat(list);
      var marklist = markers.concat(amark);

      setlist(newList);
      setmarkers(marklist);
    })
    .catch(error => console.warn(error));
  }

  //removes all selected items from the list when the '-' button is pressed
  function minusButton() {
    const newList = list.filter((item) => item.selected == false);
    const newMarkerList = newList.map((item) => {
      var newMarker =  <Marker
        coordinate={{latitude: item.latitude, longitude: item.longitude}}
        title={item.key}
        description={"Place"}
      />;

      return newMarker;
    });

    setlist(newList);
    setmarkers(newMarkerList);
  }

  //adds the items from the json ruturned by the php url to the list when the 'load' button is pressed
  function loadButton() {
      var urladdress = "https://cs.boisestate.edu/~scutchin/cs402/codesnips/loadjson.php?user=tannerco"
      loadList(urladdress, list, setlist, setmarkers);
  }

  //saves the items from the list as a json file using the php url when the 'save' button is pressed
  function saveButton() {
      var urladdress = "https://cs.boisestate.edu/~scutchin/cs402/codesnips/savejson.php?user=tannerco"
      saveList(urladdress,list)

  }

  //used by the virtual list to render the list items
  const renderItem = ({ item, index }) => {
    const backgroundColor = item.selected ? 'black' : 'white';
    const color = item.selected ? 'white' : 'black';
    
    return (
      <Item
        item={item}
        onPress={() => {
          toggleList(index);
        }}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };
  
  const mapref = React.createRef();
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
  var smaps = {width: SCREEN_WIDTH, height: SCREEN_HEIGHT/2}
  if (SCREEN_WIDTH > SCREEN_HEIGHT)
  {
    smaps = {width: SCREEN_WIDTH/2, height: SCREEN_HEIGHT}

  }
  var mymap=<MapView ref={mapref} style={smaps} provider="google" zoomEnabled={false} rotateEnabled={false} scrollEnabled={false} moveOnMarkerPress={false} zoomTapEnabled={false} zoomControlEnabled={false} scrollDuringRotateOrZoomEnabled={false} pitchEnabled={false} toolbarEnabled={false} >
              {markers} 
            </MapView >

  //the content to be displayed on the screen when the screen is in portrait mode
  var alist = (
    <View style={styles.container}>
    {mymap}
      <View style={styles.rowblock}>
        <View style={styles.buttonContainer}>
          <Button title="+" onPress={() => plusButton()} />
          <Button title="-" onPress={() => minusButton()} />
          <Button title="Load" onPress={() => loadButton()} />
          <Button title="Save" onPress={() => saveButton()} />
          <Button title="+ My Location" onPress={() => plusMyLocationButton()} />
        </View>
      </View>
        <VirtualizedList 
          style={styles.list}
          data={[]} 
          renderItem={renderItem}
          keyExtractor={(item,index) => index} 
          getItemCount={(data) => list.length} 
          getItem={(data, index) => {return list[index]}} 
        />
        <DialogInput isDialogVisible={showAddMenu} 
            title="Enter Address"
            message="Enter The Address To Add"
            submitInput={ (inputText) => {setAddMenu(false); addLocation(inputText)}}
            closeDialog={() => {setAddMenu(false)}}
          >
          <Text>Something</Text>
        </DialogInput>
    </View>
  );

  //the content to be displayed on the screen when the screen is in landscape mode
  var blist = (
    <View style={styles.bcontainer}>
      <View>
        <View style={styles.rowblock}>
          <View style={styles.buttonContainer}>
            <Button title="+" onPress={() => plusButton()} />
            <Button title="-" onPress={() => minusButton()} />
            <Button title="Load" onPress={() => loadButton()} />
            <Button title="Save" onPress={() => saveButton()} />
            <Button title="+ My Location" onPress={() => plusMyLocationButton()} />
          </View>
        </View>
          <VirtualizedList 
            style={styles.list}
            data={[]} 
            renderItem={renderItem}
            keyExtractor={(item,index) => index} 
            getItemCount={(data) => list.length} 
            getItem={(data, index) => {return list[index]}} 
          />
          <DialogInput isDialogVisible={showAddMenu} 
            title="Enter Address"
            message="Enter The Address To Add"
            submitInput={ (inputText) => {setAddMenu(false); addLocation(inputText)}}
            closeDialog={() => {setAddMenu(false)}}
          >
          <Text>Something</Text>
          </DialogInput>
        </View>
      {mymap}
    </View>
  );

  //determines the layout base on if the screen is in landscape or portrait mode
  return SCREEN_WIDTH > SCREEN_HEIGHT ? blist : alist;
};

export default VirtualList;
