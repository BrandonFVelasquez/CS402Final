import React, { useState, useEffect, useRef} from 'react';
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

async function lockOrientation() {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

var markSpawnSpeed = 2000;

const VirtualList = () => {
  const [list, setlist] = useState([]);
  const [markers, setmarkers] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [levelPos, setLevelPos] = useState({latitude: 43.6150186, longitude: -116.2023137});
  const [mapIsReady, setMapIsReady] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {

    if(mapIsReady) {
      setMapIsReady(false);
      lockOrientation();
      navigateToLocation(levelPos);
    }
    else {
      timeoutRef.current = setTimeout(gmark, markSpawnSpeed);
      return () => {
        clearTimeout(timeoutRef.current);
      }; 
    }

  }, [levelPos, markers, mapIsReady, navigateToLocation]);

  const removeMarker = (markerKey) => {
    setmarkers((prevMarkers) => {
      const updatedMarkers = prevMarkers.filter((marker) => marker.key != markerKey);

        // Increment the click counter after removing the marker
        incrementClickCounter();
      
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
    generateMarker(levelPos.latitude, levelPos.longitude);
    timeoutRef.current = setTimeout(gmark, markSpawnSpeed);
  }
  
  const incrementClickCounter = () => {
    setClickCount((previous) => (previous + 1));
    //We may need to add more logic for the clicker
  };

  //used by the virtual list to render the list items
  const renderItem = ({ item, index }) => {
    const backgroundColor = item.selected ? 'black' : 'white';
    const color = item.selected ? 'white' : 'black';
    
    return (
      <Item
        item={item}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

    const navigateToLocation = async (location) => {
    try {
      mapref.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
      setLevelPos({latitude: location.latitude, longitude: location.longitude});   
    } catch (error) {
      console.warn('Error navigating to location:', error);
    }
  };

  const levels = [
  { name: 'Boise', location: {latitude: 43.6150186, longitude: -116.2023137} }, // Boise
  { name: 'Berlin', location: {latitude: 52.5200, longitude: 13.4050} }, // Germany
  { name: 'Paris', location: {latitude: 48.8566, longitude: 2.3522} }, // France
  { name: 'Tokyo', location: {latitude: 35.6764, longitude: 139.6500} }, // Tokyo
];

const mapref = React.createRef();
const SCREEN_WIDTH = useWindowDimensions().width;
const SCREEN_HEIGHT = useWindowDimensions().height;
var smaps = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT / 2 };

var mymap = (
  <MapView
    ref={mapref}
    onMapReady={() => setMapIsReady(true)}
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
