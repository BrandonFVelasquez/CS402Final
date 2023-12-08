import React, { useState, useEffect, useRef, useCallback} from 'react';
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
import Geocoder from 'react-native-geocoding';
import * as ScreenOrientation from 'expo-screen-orientation';
// create a style sheet for handling visual appearances, spacing, widths, and colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 50,
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



//data to populate the map before adding geocoder
//const someList = [{key: "boise", selected: false, latitude: 43.618881, longitude: -116.215019}];
//const someMarker = [<Marker coordinate={{latitude: 43.618881,longitude: -116.215019}} title={"boise"} description={"city"} />];
Geocoder.init("AIzaSyDqW8jK0xxnIRKTKXACxIK-q3UerQTiCsA");
//the guts - has all the buttons and displays the list as a virtualized list
//and functionality for each of the buttons and list
async function lockOrientation() {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

var markSpawnSpeed = 2000;

const VirtualList = () => {
  const [list, setlist] = useState([]);
  const [markers, setmarkers] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [levelPos, setLevelPos] = useState({lat: 0.0, long: 0.0});
  const timeoutRef = useRef(null);

  useEffect(() => {
    lockOrientation();
    timeoutRef.current = setTimeout(gmark, markSpawnSpeed);
    return () => {
      clearTimeout(timeoutRef.current);
    }; 
  }, [levelPos, markers]);

  const removeMarker = (markerKey) => {
    setmarkers((prevMarkers) => {
      const updatedMarkers = prevMarkers.filter((marker) => marker.key != markerKey);
      return updatedMarkers;
    });
  };

  const createMarker = (lat, long) => {
    const newMarker = {
      key: Date.now(),
      coordinate: {latitude: lat, longitude: long},
    };
    return (
      <Marker
        key={newMarker.key}
        coordinate={newMarker.coordinate}
        onPress={() => removeMarker(newMarker.key)} 
      />
    );
  };

  function generateMarker(lat, long) {
    markLat = Math.random()*0.08 + lat - 0.05;
    markLong = Math.random()*0.08 + long - 0.05;
    let mark = createMarker(markLat, markLong);
    setmarkers((prevMarkers) => [mark, ...prevMarkers]);
  }

  function gmark() {
    generateMarker(levelPos.lat, levelPos.long);
    timeoutRef.current = setTimeout(gmark, markSpawnSpeed);
  }
  
  const incrementClickCounter = () => {
    setClickCount((previous) => (previous + 1));
    //We may need to add more logic for the clicker
  };
  
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

    const navigateToLocation = async (locationName) => {
    try {
      const response = await Geocoder.from(locationName);
      const { lat, lng } = response.results[0].geometry.location;
      mapref.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
      setLevelPos({lat: lat, long: lng});
    } catch (error) {
      console.warn('Error navigating to location:', error);
    }
  };

  const levels = [
  { name: 'Level 1', location: 'Boise' },
  { name: 'Level 2', location: 'Germany' },
  { name: 'Level 3', location: 'France' },
];

const mapref = React.createRef();
const SCREEN_WIDTH = useWindowDimensions().width;
const SCREEN_HEIGHT = useWindowDimensions().height;
var smaps = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT / 2 };
// if (SCREEN_WIDTH > SCREEN_HEIGHT) {
//   smaps = { width: SCREEN_WIDTH / 2, height: SCREEN_HEIGHT };
// }

var mymap = (
  <MapView
    ref={mapref}
    style={smaps}
    provider="google"
    zoomEnabled={false}
    rotateEnabled={false}
    scrollEnabled={false}
    moveOnMarkerPress={false}
    zoomTapEnabled={false}
    zoomControlEnabled={false}
    scrollDuringRotateOrZoomEnabled={false}
    pitchEnabled={false}
    toolbarEnabled={false}
  >
    {markers}
  </MapView>
);

//the content to be displayed on the screen when the screen is in portrait mode
var alist = (
 <View style={styles.container}>
      {mymap}
      <View style={styles.rowblock}>
        <View style={styles.buttonContainer}>
          {levels.map((level, index) => (
            <Button
              key={index}
              title={level.name}
              onPress={() => navigateToLocation(level.location)}
            />
          ))}
      </View>
    </View>
    <Text>Click Counter: {clickCount}</Text>            
    <VirtualizedList
      style={styles.list}
      data={[]}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      getItemCount={(data) => list.length}
      getItem={(data, index) => list[index]}
    />
  </View>
);

  return alist;
};
export default VirtualList;