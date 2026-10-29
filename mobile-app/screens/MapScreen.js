import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Animated, TouchableWithoutFeedback, PanResponder } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import customIcon from '../assets/mapmarker.png';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native';

export default function MapScreen() {
  const [location, setLocation] = useState(null); // For storing user location
  const [pinnedLocation, setPinnedLocation] = useState(null); // For storing the pinned location
  const [loading, setLoading] = useState(false); // For loading state
  const [addressData, setAddressData] = useState(null); // For storing fetched address data
  const [popupVisible, setPopupVisible] = useState(false); // To control popup visibility
  const translateY = useState(new Animated.Value(300))[0]; // To control the popup's vertical position
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords); // Set user location
    })();
  }, []);

  const fetchAddress = async () => {
    const coords = pinnedLocation || location; // Use pinned location if available, else use current location

    if (!coords) {
      Alert.alert('Error', 'No location available');
      return;
    }

    setLoading(true); 
    setPopupVisible(true);
    animatePopupIn();

    try {
      const response = await axios.get(`${API_BASE_URL}/api/getcurrentpolicestation`, {
        params: {
          latitude: coords.longitude,
          longitude: coords.latitude,
        },
      });
      if (response.data.message === "No police station found for the given coordinates.") {
        setAddressData({ message: response.data.message });
      } else {
        setAddressData(response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setAddressData({ message: "No Police Station found for the given coordinates." });
      } else {
        setAddressData({ message: 'An error occurred. Please try again later.' });
      }
    }
    setLoading(false);
  };

  const animatePopupIn = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closePopup = () => {
    Animated.spring(translateY, {
      toValue: 300,
      useNativeDriver: true,
    }).start(() => {
      setPopupVisible(false);
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => true,
    onMoveShouldSetPanResponder: (e, gestureState) => gestureState.dy !== 0,
    onPanResponderMove: (e, gestureState) => {
      translateY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dy > 100) {
        closePopup();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return ( 
    <View style={styles.container}>

      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPinnedLocation({ latitude, longitude }); // Save the pinned location
          }}
        >
          {/* User's current location */}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            icon={customIcon}
          />
          {/* Pinned location marker */}
          {pinnedLocation && (
            <Marker
              coordinate={pinnedLocation}
              pinColor="#002855" // Color for pinned marker
            />
          )}
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}

      <TouchableWithoutFeedback onPress={fetchAddress}>
        <View style={styles.buttonContainer}>
          <Text style={styles.findButtonText}>Find Police Station</Text>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback  onPress={() => navigation.navigate('RouteScreen')} >
        <View style={styles.buttonContainer2}>
          <Text style={styles.findButtonText2}>Safest Route</Text>
        </View>
      </TouchableWithoutFeedback> 

            {popupVisible && (   
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.popupContainer, { transform: [{ translateY }] }]}
          >
            <View style={styles.popupContent}>


{loading ? (
  <View style={styles.centeredContainer}>
  <ActivityIndicator size="large" color="#CC0623" />
</View>


) : (
  addressData ? (
    addressData.message ? (
     
      <View style={styles.nostationfound}>
      <Text style={styles.upperline}></Text>
      <Text style={styles.nostationfoundtext}>{addressData.message}</Text></View> // Show message if no data is found
    ) : (
      <>
        <Text style={styles.upperline}></Text>
        <Text style={styles.headerText}>{addressData.policeStationName}</Text>
        <View style={styles.row}>
          <Text style={styles.icon}>📞</Text>
          <Text style={styles.text}>{addressData.contactNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.text}>{addressData.address}</Text>
        </View>
      </>
    )
  ) : null
)}


            </View>
          </Animated.View>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    marginTop: 0,  // Ensure no space at the top
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: '10%',
    right: '46%',
    backgroundColor: '#002855',
    paddingVertical: 18,
    borderRadius: 7,
    alignItems: 'center',
  },
  findButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 400,
  },
  buttonContainer2: {
    position: 'absolute',
    bottom: 30,
    left: '56%',
    right: '10%',
    backgroundColor: '#002855',
    paddingVertical: 18,
    borderRadius: 7,
    alignItems: 'center',
  },
  findButtonText2: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 400,
  },  
  popupContainer: {
    position: 'absolute',
    bottom: 0, // Position above the button, starts at the very bottom
    left: 0, // Cover full width of the screen
    right: 0, // Cover full width of the screen
    height: 200, // Adjusted height for the new design
    backgroundColor: 'white',
    padding: 20,
    paddingTop:0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 5, // Shadow effect
    zIndex: 1000, // Ensures the popup is above other UI elements
  },
  popupContent: {
    alignItems: 'flex-start',  
    height: '100%', // Ensure content fits within the height
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
    paddingRight:1
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop:32,
    color: '#000',
    textAlign: 'center',
    width:'100%',
    paddingBottom:8,
    borderBottomWidth:1,
    borderColor:'#EFEFF4'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  
  },
  icon: {
    fontSize: 16,
    marginRight: 5,
    color: '#e63946', // Red color for the icons
  },
  upperline: {
borderWidth:1,
    height:3,
    width: 45,
    margin:'auto',
    position: 'absolute',
    top: 8, // Adjust this value if necessary
    left: '50%',
    marginLeft: -22.5,
    borderColor: '#8A8A8F',
    opacity: 0.6,
    borderRadius:100,
    backgroundColor: '#8A8A8F'
  },
  centeredContainer: {
    position: 'absolute', // Ensures it overlays other content if needed
    left: 0,
    right: 0,
    height:'100%',
    justifyContent: 'center', // Centers vertically
    alignItems: 'center', // Centers horizontally
  },
  nostationfound: {
    height:'100%',
    justifyContent: 'center', // Centers vertically
    alignItems: 'center',
    textAlign: 'center',
    width:'100%'
  },
  nostationfoundtext: {
    textAlign:'center'
  },
  routeButton: {
    position: 'absolute', // Keep it absolute so it's placed above everything
    top: 50, // Adjust the distance from the top
    left: '10%',
    right: '10%',
    backgroundColor: '#002855',
    paddingVertical: 18,
    borderRadius: 7,
    alignItems: 'center',
    zIndex: 2000, // Ensure it's on top of everything
    height: 50, // Explicit height for the button
    justifyContent: 'center', // Center text inside the button
  },
  routeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
   
});
