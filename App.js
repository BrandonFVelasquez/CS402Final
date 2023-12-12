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
    paddingTop: 30,
  },
  list: {
    flex: 20,
    paddingTop: 2,
    alignItems: 'center'
  },
  counter: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    borderWidth: 2.5,
    alignItems: 'center',
    alignContent: 'center',
    paddingLeft: 20,
    paddingRight: 20
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
    borderWidth: 0,
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

//vars for Points Multiplier Upgrade
var pointsMultiplierUpgradeLevel = 0;
var multiplier = 1;
var pointsMultiplierUpgradeCost = "100 points";

// Power-up vars
var autoRemoveMarkersUpgradeLevel = 0;
var autoRemoveMarkersInterval = 30000000; // Initial interval is 30 seconds
var autoRemoveMarkersUpgradeCost = "500 points";

const VirtualList = () => {
  const [list, setlist] = useState([]);
  const [markers, setmarkers] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [levelPos, setLevelPos] = useState({latitude: 43.6150186, longitude: -116.2023137});
  const [mapIsReady, setMapIsReady] = useState(false);
  const timeoutRef = useRef(null);

  //Points Multiplier Upgrade
  function pointsMultiplierUpgrade(pointsAmt){
    switch(pointsMultiplierUpgradeLevel){
      case 0:
        if(pointsAmt >= 100){
          multiplier = 2;
          pointsMultiplierUpgradeCost = "250 points";
          pointsMultiplierUpgradeLevel = pointsMultiplierUpgradeLevel + 1;
          setClickCount(clickCount - 100);
          break;
        }
        break;
      case 1:
        if(pointsAmt >= 250){
          multiplier = 3;
          pointsMultiplierUpgradeCost = "500 points";
          pointsMultiplierUpgradeLevel = pointsMultiplierUpgradeLevel + 1;
          setClickCount(clickCount - 250);
          break;
        }
        break;
      case 2:
        if(pointsAmt >= 500){
          multiplier = 4;
          pointsMultiplierUpgradeCost = "750 points";
          pointsMultiplierUpgradeLevel = pointsMultiplierUpgradeLevel + 1;
          setClickCount(clickCount - 500);
          break;
        }
        break;
      case 3:
        if(pointsAmt >= 750){
          multiplier = 5;
          pointsMultiplierUpgradeCost = "1000 points";
          pointsMultiplierUpgradeLevel = pointsMultiplierUpgradeLevel + 1;
          setClickCount(clickCount - 750);
          break;
        }
        break;
      case 4:
        if(pointsAmt >= 1000){
          multiplier = 6;
          pointsMultiplierUpgradeCost = "1500 points";
          pointsMultiplierUpgradeLevel = pointsMultiplierUpgradeLevel + 1;
          setClickCount(clickCount - 1000);
          break;
        }
        break;
      default:
        if(pointsMultiplierUpgradeLevel < 6 && pointsAmt >= 1500){
          multiplier = 7;
          pointsMultiplierUpgradeCost = "Fully Upgraded";
          pointsMultiplierUpgradeLevel = pointsMultiplierUpgradeLevel + 1;
          setClickCount(clickCount - 1500);
          break;
        }
        break;
    }
  }

  //Spawn Speed Upgrade
  function spawnSpeedUpgrade(pointsAmt){
    switch(spawnSpeedUpgradeLevel) {
      case 0:
        if(pointsAmt >= 100){
          markSpawnSpeed = 1750;
          spawnSpeedUpgradeCost = "250 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          setClickCount(clickCount - 100);
          return 2000;
        }
        else{
          return;
        }
      case 1:
        if(pointsAmt >= 250){
          markSpawnSpeed = 1500;
          spawnSpeedUpgradeCost = "500 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          setClickCount(clickCount - 250);
          return 1500;
        }
        else{
          return;
        }
      case 2:
        if(pointsAmt >= 500){
          markSpawnSpeed = 1000;
          spawnSpeedUpgradeCost = "750 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          setClickCount(clickCount - 500);
          return 1000;
        }
        else{
          return;
        }
      case 3:
        if(pointsAmt >= 750){
          markSpawnSpeed = 750;
          spawnSpeedUpgradeCost = "1000 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          setClickCount(clickCount - 750);
          return 750;
        }
        else{
          return;
        }
      case 4:
        if(pointsAmt >= 1000){
          markSpawnSpeed = 300;
          spawnSpeedUpgradeCost = "1500 points";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          setClickCount(clickCount - 1000);
          return 300;
        }
        else{
          return;
        }
      default:
        if(spawnSpeedUpgradeLevel < 6 && pointsAmt >= 1500){
          markSpawnSpeed = 50;
          spawnSpeedUpgradeCost = "Fully Upgraded";
          spawnSpeedUpgradeLevel = spawnSpeedUpgradeLevel + 1;
          setClickCount(clickCount - 1500);
          return 50;
        }
        else{
          return;
        }
    }
  }

// Auto Remove Markers Upgrade
function autoRemoveMarkersUpgrade(pointsAmt) {
  switch (autoRemoveMarkersUpgradeLevel) {
    case 0:
      if (pointsAmt >= 500) {
        autoRemoveMarkersInterval = 20000; // Reduce interval to 20 seconds
        autoRemoveMarkersUpgradeCost = "1000 points";
        autoRemoveMarkersUpgradeLevel += 1;
        setClickCount((prev) => prev - 500);
        startAutoRemoveMarkers();
        break;
      }
      break;
    case 1:
      if (pointsAmt >= 1000) {
        autoRemoveMarkersInterval = 10000; // Reduce interval to 10 seconds
        autoRemoveMarkersUpgradeCost = "5000 points";
        autoRemoveMarkersUpgradeLevel += 1;
        setClickCount((prev) => prev - 1000);
        startAutoRemoveMarkers();
        break;
      }
      break; 
    case 2:
      if (pointsAmt >= 5000) {
        autoRemoveMarkersInterval = 5000; // Reduce interval to 5 seconds
        autoRemoveMarkersUpgradeCost = "20000 points";
        autoRemoveMarkersUpgradeLevel += 1;
        setClickCount((prev) => prev - 5000);
        startAutoRemoveMarkers();
        break;
      }
      break;
    case 3:
      if (pointsAmt >= 20000) {
        autoRemoveMarkersInterval = 2500; // Reduce interval to 2.5 seconds
        autoRemoveMarkersUpgradeCost = "Max";
        autoRemoveMarkersUpgradeLevel += 1;
        setClickCount((prev) => prev - 20000);
        startAutoRemoveMarkers();
        break;
      }
      break;
    default:  
        break;
  }
}

// Function to start auto-remove markers based on the specified interval
function startAutoRemoveMarkers() {
  setInterval(() => {
    // Code to automatically remove markers
    setmarkers((prevMarkers) => {
removeMarker();
      const updatedMarkers = prevMarkers.slice(1);
      return updatedMarkers;
    });
  }, autoRemoveMarkersInterval);
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
    setClickCount((previous) => (previous + (1 * multiplier)));
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

      const getPointsNeededToUnlock = (levelName) => {
      switch (levelName) {
        case 'Boise':
          return 0;
        case 'Berlin':
          return 1000;
        case 'Paris':
          return 10000;
        case 'Tokyo':
          return 100000;
        case 'Istanbul':
          return 1000000;
        case 'NYC':
          return 1000000000;
        default:
          return 0;
      }
    };

     // Start auto-remove markers if the auto-remove markers upgrade is active
  if (autoRemoveMarkersUpgradeLevel > 0) {
    startAutoRemoveMarkers();
  }


  const navigateToLocation = async (location, levelName) => {
    try {
      const pointsNeeded = getPointsNeededToUnlock(levelName);

      // Check if the user has enough points to unlock the level
      if (clickCount >= pointsNeeded) {
        mapref.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
        setLevelPos({ latitude: location.latitude, longitude: location.longitude });
        // Deduct points for unlocking the level
        setClickCount((prevClickCount) => prevClickCount - pointsNeeded);
      } else {
        // Display a message or take appropriate action when the user doesn't have enough points
        console.log(`You need ${pointsNeeded} points to unlock ${levelName}.`);
      }
    } catch (error) {
      console.warn('Error navigating to location:', error);
    }
  };

  const levels = [
  { name: 'Boise', location: {latitude: 43.6150186, longitude: -116.2023137} }, // Boise
  { name: 'Berlin', location: {latitude: 52.5200, longitude: 13.4050} }, // Germany
  { name: 'Paris', location: {latitude: 48.8566, longitude: 2.3522} }, // France
  { name: 'Tokyo', location: {latitude: 35.6764, longitude: 139.6500} }, // Tokyo
  { name: 'Istanbul', location: {latitude: 41.0082, longitude: 28.9784} }, // Turkey
  { name: 'NYC', location: {latitude: 40.7128, longitude: 74.0060} }, // New York City
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
              onPress={() => navigateToLocation(level.location, level.name)}
              disabled={clickCount < getPointsNeededToUnlock(level.name)}
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
      <View style={styles.rowblock}>
      <Text style={{fontWeight: 'bold'}}>POINTS MULTIPLIER UPGRADE</Text>
      <View style={styles.upgradeContainer}>
        <Text> Level: {pointsMultiplierUpgradeLevel}</Text>
        <Text> Upgrade for: {pointsMultiplierUpgradeCost}</Text>
        <Button
          title="UPGRADE"
          onPress={() => pointsMultiplierUpgrade(clickCount)}
        />
      </View>
    </View>
  <View style={styles.rowblock}>
    <Text style={{ fontWeight: 'bold' }}>AUTO REMOVE MARKERS UPGRADE</Text>
    <View style={styles.upgradeContainer}>
      <Text> Level: {autoRemoveMarkersUpgradeLevel}</Text>
      <Text> Upgrade for: {autoRemoveMarkersUpgradeCost}</Text>
      <Button
        title="UPGRADE"
        onPress={() => autoRemoveMarkersUpgrade(clickCount)}
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
