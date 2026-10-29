import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";

const NavigationScreen = ({ route, navigation }) => {
  const { routeCoordinates, source, destination, polylineColor } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const locationWatcher = useRef(null);

  useEffect(() => {
    const startLiveTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required for live tracking.");
        return;
      }

      locationWatcher.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      );
    };

    startLiveTracking();

    return () => {
      if (locationWatcher.current) {
        locationWatcher.current.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
        <View style={styles.routeInfoBox}>
            <Text style={styles.routeInfoText}>📍 From: {source}</Text>
            <Text style={styles.routeInfoText}>🎯 To: {destination}</Text>
        </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...routeCoordinates[0],
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        followsUserLocation={false}
      >
        {/* Use the passed polyline color */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={polylineColor || "blue"}  
          strokeWidth={4}
        />
        <Marker coordinate={routeCoordinates[0]} title="Source" />
        <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]} title="Destination" />
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You"
            pinColor="green"
            description="Your current position"
          />
        )}
      </MapView>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
    routeInfoBox: {
  position: "absolute",
  top: 30,
  left: 15,
  right: 15,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  padding: 5,
  borderRadius: 5,
  elevation: 5, 
  shadowColor: "#000", 
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  zIndex: 10,
},
routeInfoText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
  margin:5
},
  container: { flex: 1 },
  map: { flex: 1 },
  backButton: {
    position: "absolute",
    bottom: 30,
    left: 15,
    backgroundColor: "#CC0623",
    paddingVertical: 12,
    borderRadius: 7,
    width: 80,
  },
  backButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});

export default NavigationScreen;
