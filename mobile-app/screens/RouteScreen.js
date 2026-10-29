import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";


const RouteScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [debouncedSource, setDebouncedSource] = useState(source);
  const [debouncedDestination, setDebouncedDestination] = useState(destination);
  const [crimeScores, setCrimeScores] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [mapClicked, setMapClicked] = useState(false); // Flag to prevent map click once source and destination are set

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Permission to access location was denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    };

    getLocation();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeInput === "source") fetchSuggestions(debouncedSource);
      if (activeInput === "destination") fetchSuggestions(debouncedDestination);
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSource, debouncedDestination]);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&viewbox=66.8252,25.0552,67.3281,24.7456&bounded=1`
      );
      const data = await response.json();
      setSuggestions(
        data.map((item) => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }))
      );
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      Alert.alert("Error", "Failed to fetch location suggestions.");
    }
  };

  const selectSuggestion = (item, isSource) => {
    if (isSource) {
      setSource(item.name);
      setSourceCoords({ latitude: item.lat, longitude: item.lon });
    } else {
      setDestination(item.name);
      setDestinationCoords({ latitude: item.lat, longitude: item.lon });
    }
    setSuggestions([]);
  };

  const fetchRoutes = async () => {
    if (!sourceCoords || !destinationCoords) {
      Alert.alert("Error", "Please select source and destination.");
      return;
    }

    setLoading(true);

    try {
      const baseUrl = `${API_BASE_URL}/api/SafestRoute`;
      const url = `${baseUrl}/paths?sourceLat=${sourceCoords.latitude}&sourceLong=${sourceCoords.longitude}&destLat=${destinationCoords.latitude}&destLong=${destinationCoords.longitude}`;
      const url2 = `${baseUrl}/paths-scores?sourceLat=${sourceCoords.latitude}&sourceLong=${sourceCoords.longitude}&destLat=${destinationCoords.latitude}&destLong=${destinationCoords.longitude}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.paths && data.paths.length > 0) {
        const allRoutes = data.paths.map((path) =>
          path.points.coordinates.map(([lon, lat]) => ({
            latitude: lat,
            longitude: lon,
          }))
        );
        setRoutes(allRoutes);


      } else {
        Alert.alert("No routes found.");
      }

      const response2 = await fetch(url2);
      const scores = await response2.json();
      setCrimeScores(scores);
    } catch (error) {
      console.error("Error fetching routes or crime scores:", error);
      Alert.alert("Error", "Something went wrong while fetching routes.");
    } finally {
      setLoading(false);
    }
  };

  const getRouteColor = (index) => {
    if (!crimeScores || crimeScores.length === 0) return "gray";

    const scored = crimeScores.map((score, i) => ({ index: i, score }));
    const sorted = scored.sort((a, b) => a.score - b.score);

    const colorMap = {};
    if (sorted.length === 1) {
      colorMap[sorted[0].index] = "blue";
    } else if (sorted.length === 2) {
      colorMap[sorted[0].index] = "blue";
      colorMap[sorted[1].index] = "red";
    } else {
      colorMap[sorted[0].index] = "blue";
      colorMap[sorted[1].index] = "green";
      colorMap[sorted[2].index] = "red";
    }

    return colorMap[index] || "gray";
  };

  useEffect(() => {
  if (crimeScores.length > 0) {
    const safestRouteIndex = getSafestRouteIndex();
    setSelectedRouteIndex(safestRouteIndex);
  }
}, [crimeScores]);

  const getSafestRouteIndex = () => {
    if (!crimeScores || crimeScores.length === 0) return -1;
    const minScore = Math.min(...crimeScores);
    return crimeScores.findIndex((score) => score === minScore);
  };

  const handleMapPress = async (event) => {
    if (sourceCoords && destinationCoords) {
      // If both source and destination are already set, do not allow map clicks to alter them
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      const address = data.display_name || "Unknown Location";

      if (!sourceCoords) {
        setSource(address);
        setSourceCoords({ latitude, longitude });
      } else if (!destinationCoords) {
        setDestination(address);
        setDestinationCoords({ latitude, longitude });
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
    }
  };

  const handleInputChange = (text, type) => {
    if (type === "source") {
      setSource(text);
      setDebouncedSource(text);
      setActiveInput("source");
    } else {
      setDestination(text);
      setDebouncedDestination(text);
      setActiveInput("destination");
    }
  };

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
          onPress={handleMapPress}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
            />
          )}

          {routes.map((route, index) => (
            <Polyline
              key={index}
              coordinates={route}
              strokeColor={selectedRouteIndex === index ? "#000000" : getRouteColor(index)}
              strokeWidth={selectedRouteIndex === index ? 5 : 3}
              tappable={true}
              onPress={() => setSelectedRouteIndex(index)}
            />
          ))}
          {sourceCoords && <Marker coordinate={sourceCoords} title="Source" pinColor="#00a150" />}
          {destinationCoords && (
            <Marker coordinate={destinationCoords} title="Destination" pinColor="#002855" />
          )}
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Source"
          value={source}
          onChangeText={(text) => handleInputChange(text, "source")}
        />
        {activeInput === "source" && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            style={styles.suggestionsList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => selectSuggestion(item, true)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Enter Destination"
          value={destination}
          onChangeText={(text) => handleInputChange(text, "destination")}
        />
        {activeInput === "destination" && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            style={styles.suggestionsList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => selectSuggestion(item, false)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          style={[styles.button, !sourceCoords || !destinationCoords ? styles.disabledButton : {}]}
          onPress={fetchRoutes}
          disabled={!sourceCoords || !destinationCoords}
        >
          <Text style={styles.buttonText}>Find Routes</Text>
        </TouchableOpacity>

        {selectedRouteIndex !== null && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#00a150" }]}
            onPress={() => {
              const polylineColor = getRouteColor(selectedRouteIndex);

              navigation.navigate("NavigationScreen", {
                routeCoordinates: routes[selectedRouteIndex],
                source,
                destination,
                polylineColor,
              });
            }}
          >
            <Text style={styles.buttonText}>Navigate Selected Route</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator size="large" color="blue" />}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  inputContainer: {
    position: "absolute",
    top: 20,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 5,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: "white",
  },
  suggestionsList: {
    maxHeight: 150,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  button: {
    backgroundColor: "#002855",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
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

export default RouteScreen;
