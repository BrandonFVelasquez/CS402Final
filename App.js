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
  counter: {
    fontSize: '25px',
    fontWeight: 'bold',
    color: 'black',
    borderWidth: 2.5,
    alignItems: 'center',
    alignContent: 'center',
    padding: 20
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
  upgradeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

// vars for Spawn Speed Upgrade
var spawnSpeedUpgradeLevel = 0;
var markSpawnSpeed = 2000;
var spawnSpeedUpgradeCost = "100 points";

const VirtualList = () => {
  const [list, setlist] = useState([]);
  const [markers, setmarkers] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [levelPos, setLevelPos] = useState({latitude: 43.6150186, longitude: -116.2023137});
  const [mapIsReady, setMapIsReady] = useState(false);
  const timeoutRef = useRef(null);

  //Spawn Speed Upgrade
  function spawnSpeedUpgrade(pointsAmt){
    switch(spawnSpeedUpgradeLevel) {
      case 0:
        if(spawnSpeedUpgradeLevel < 5 && pointsAmt >= 100){
          markSpawnSpeed = 2000;
          spawnSpeedUpgradeCost = "250 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          console.log("markSpawnSpeed: ", markSpawnSpeed);
          setClickCount(clickCount - 100);
          return 2000;
        }
        else{
          return;
        }
      case 1:
        if(spawnSpeedUpgradeLevel < 5 && pointsAmt >= 250){
          markSpawnSpeed = 1500;
          spawnSpeedUpgradeCost = "500 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          console.log("markSpawnSpeed: ", markSpawnSpeed);
          setClickCount(clickCount - 250);
          return 1500;
        }
        else{
          return;
        }
      case 2:
        if(spawnSpeedUpgradeLevel < 5 && pointsAmt >= 500){
          markSpawnSpeed = 1000;
          spawnSpeedUpgradeCost = "750 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          console.log("markSpawnSpeed: ", markSpawnSpeed);
          setClickCount(clickCount - 500);
          return 1000;
        }
        else{
          return;
        }
      case 3:
        if(spawnSpeedUpgradeLevel < 5 && pointsAmt >= 750){
          markSpawnSpeed = 750;
          spawnSpeedUpgradeCost = "1000 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          console.log("markSpawnSpeed: ", markSpawnSpeed);
          setClickCount(clickCount - 750);
          return 750;
        }
        else{
          return;
        }
      case 4:
        if(spawnSpeedUpgradeLevel < 5 && pointsAmt >= 1000){
          markSpawnSpeed = 300;
          spawnSpeedUpgradeCost = "1500 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          console.log("markSpawnSpeed: ", markSpawnSpeed);
          setClickCount(clickCount - 1000);
          return 300;
        }
        else{
          return;
        }
      default:
        if(spawnSpeedUpgradeLevel < 5 && pointsAmt >= 1500){
          markSpawnSpeed = 50;
          spawnSpeedUpgradeCost = "Fully Upgraded";
          console.log("markSpawnSpeed(fully): ", markSpawnSpeed);
          setClickCount(clickCount - 1500);
          return 50;
        }
        else{
          return;
        }
    }
  }

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

//the content to be displayed on the screen
var alist = (
  
 <View style={styles.container}>
      {mymap}
      <Text style={styles.counter}>Points: {clickCount}</Text>
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
        <View style={styles.rowblock}>
        <Text style={{fontWeight: 'bold'}}>SPAWN SPEED UPGRADE</Text>
        <View style={styles.upgradeContainer}>
           <Text> Level: {spawnSpeedUpgradeLevel}</Text>
           <Text> Upgrade for: {spawnSpeedUpgradeCost}</Text>
           <Button
              title="UPGRADE"
              onPress={() => spawnSpeedUpgrade(clickCount)}
            />
      </View>
    </View>
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