import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator, StyleSheet, Animated, Easing  } from "react-native";
import { Button, Card, useTheme } from "react-native-paper";
import axios from "axios";
//import { LinearGradient } from "expo-linear-gradient";

const FLASK_API_URL = "http://127.0.0.1:5000/calculate";

export default function Index() {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const slideAnim = useRef(new Animated.Value(300)).current;
  useEffect(() => {
    if (results) {
      Animated.timing(slideAnim, {
        toValue: 0, 
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(300); 
    }
  }, [results]);

  const fetchShippingDetails = async () => {
    if (!destination.trim()) {
      alert("Please enter a destination.");
      return;
    }
    setLoading(true);
    setResults(null);

    try {
      const response = await axios.post(FLASK_API_URL, { destination });
      setResults(response.data);
    } catch (error) {
      alert("Error fetching data.");
    }

    setLoading(false);
  };

  const clearInputs = () => {
    setDestination("");
    setResults(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.header}>🚚 Shipping Calculator</Text>

        <View style={styles.upperSection}>
          <View style={styles.inputSection}>
      
            <TextInput
              style={styles.inputField}
              placeholder="Enter Destination"
              placeholderTextColor="#777"
              value={destination}
              onChangeText={setDestination}
            />

            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={fetchShippingDetails} loading={loading} style={styles.calculateButton} labelStyle={styles.buttonLabel}>
                Calculate
              </Button>
              <Button mode="contained" onPress={clearInputs} style={styles.clearButton} labelStyle={styles.buttonLabel}>
                Clear
              </Button>
            </View>
        </View>

        {results && (
          <Animated.View style={[styles.bestOptionSection, { transform: [{ translateX: slideAnim }] }]}>
            <Text style={styles.resultsTitle}>⭐ Best Options:</Text>
            <Text style={styles.bestOption}>
              💰 Cheapest: {results.cheapest.warehouse} (₹
              {Math.min(results.cheapest.road.cost.toFixed(2), results.cheapest.flight.cost.toFixed(2))}) via 
              {results.cheapest_mode === "road" ? " 🛣️ Road" : " ✈️ Flight"}
            </Text>
            <Text style={styles.bestOption}>
              ⏳ Quickest: {results.quickest.warehouse} (
              {Math.min(results.quickest.road.time.toFixed(2), results.quickest.flight.time.toFixed(2))} hours) via 
              {results.quickest_mode === "road" ? " 🛣️ Road" : " ✈️ Flight"}
            </Text>
            <Text style={styles.bestOption}>
              🏆 Best Overall: {results.best.warehouse}  via 
              {results.best_mode === "road" ? " 🛣️ Road" : " ✈️ Flight"}
            </Text>
          </Animated.View>
        )}
    
      </View>
      </View>

      {loading && <ActivityIndicator size="large" color="#000" style={styles.loader} />}

      {results && (
        <Animated.ScrollView style={[styles.resultsContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.resultsTitle}>📦 Shipping Options:</Text>

          <View style={styles.cardDiv}>
            {results.results.map((option, index) => (
              <Card key={index} style={styles.card}>
                <Text style={styles.cardTitle}>📍 {option.warehouse}</Text>
                <Text style={styles.cardText}>🚗 Distance: {option.distance_km.toFixed(2)} km</Text>
                <Text style={styles.cardText}>🛣️ Road - ₹{option.road.cost.toFixed(2)}, {option.road.time.toFixed(2)} hours </Text>
                <Text style={styles.cardText}>✈️ Flight - ₹{option.flight.cost.toFixed(2)}, {option.flight.time.toFixed(2)} hours</Text>
              </Card>
            ))}
          </View>

        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  display: {
    width: "100%",
  },
  header: {
    color: "#000",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Roboto",
  },
  upperSection: {
    display: "flex",
    flexDirection: "row",
    gap: "10rem",
  },
  inputSection : {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    marginLeft: "5rem",
    marginRight: "5rem",
  },
  bestOptionSection : {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid black",
    borderRadius: "100%",
    height: "20rem",
    backgroundImage: "linear-gradient(rgb(68, 68, 68), rgb(0, 0, 0))",
    width: "25rem",
    marginRight: "10rem",
    padding: "0rem",
  },
  inputField: {
    backgroundColor: "#fff",
    color: "#000",
    padding: 15,
    fontSize: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    width: "100%",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  calculateButton: {
    marginVertical: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: "#000",
    width: "48%",
  },
  clearButton: {
    marginVertical: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderColor: "#666",
    backgroundColor: "#888",
    width: "48%",
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  loader: {
    marginTop: 20,
  },
  resultsContainer: {
    flexDirection: "column",
    width: "100%",
    marginTop: 20,
  },
  resultsTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardDiv: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    gap: "2rem",
  },
  card: {
    backgroundColor: "#333",
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    width: "30%",
    elevation: 5,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardText: {
    color: "#ddd",
    fontSize: 16,
    marginBottom: 5,
  },
  bestCardGradient: {
    width: "90%",
    borderRadius: 12,
    marginVertical: 15,
    padding: 2,
    alignSelf: "center",
  },
  bestCard: {
    backgroundColor: "transparent",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  bestOption: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
