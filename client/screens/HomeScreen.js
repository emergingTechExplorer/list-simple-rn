import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { SERVER } from "../config";
export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${SERVER}/api/items`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    load();
    (async () => {
      const draft = await AsyncStorage.getItem("draft_name");
      if (draft) setName(draft);
    })();
  }, [load]);
  async function toggleDone(id, done) {
    const res = await fetch(`${SERVER}/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    const updated = await res.json();
    setItems(items.map((i) => (i._id === id ? updated : i)));
  }
  async function remove(id) {
    await fetch(`${SERVER}/api/items/${id}`, { method: "DELETE" });
    setItems(items.filter((i) => i._id !== id));
  }
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.5,
      allowsEditing: true,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }
  async function createItem() {
    setError("");
    if (!name.trim()) {
      setError("Name required");
      return;
    }
    const res = await fetch(`${SERVER}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), imageUrl: imageUri || null }),
    });
    const newItem = await res.json();
    if (newItem.error) {
      setError(newItem.error);
      return;
    }
    setItems([newItem, ...items]);
    setModalVisible(false);
    setName("");
    setImageUri(null);
    await AsyncStorage.removeItem("draft_name");
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Button
          title="Utilities"
          onPress={() => navigation.navigate("Utilities")}
        />
        <Button title="Refresh" onPress={load} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Details", { item })}
              style={{ flex: 1 }}
            >
              <Text style={[styles.name, item.done && styles.done]}>
                {item.name}
              </Text>
              {!!item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ height: 120, borderRadius: 8, marginTop: 6 }}
                />
              )}
            </TouchableOpacity>
            <View style={styles.actions}>
              <Button
                title={item.done ? "Undo" : "Done"}
                onPress={() => toggleDone(item._id, item.done)}
              />
              <Button title="Del" onPress={() => remove(item._id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", padding: 20 }}>
            No items yet.
          </Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        contentContainerStyle={{ paddingVertical: 8 }}
      />
      <View style={styles.fab}>
        <Button title="+" onPress={() => setModalVisible(true)} />
      </View>
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.h1}>New Item</Text>
            <TextInput
              value={name}
              onChangeText={async (t) => {
                setName(t);
                await AsyncStorage.setItem("draft_name", t);
              }}
              placeholder="Item name"
              style={styles.input}
            />
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ height: 140, borderRadius: 8, marginBottom: 8 }}
              />
            )}
            <View style={styles.row}>
              <Button title="Pick Image" onPress={pickImage} />
              <Button
                title="Clear"
                onPress={() => {
                  setImageUri(null);
                  setName("");
                }}
              />
            </View>
            {!!error && (
              <Text style={{ color: "red", marginTop: 6 }}>{error}</Text>
            )}
            <View style={styles.row}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Create" onPress={createItem} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 2,
  },
  actions: { gap: 6 },
  name: { fontSize: 16 },
  done: { textDecorationLine: "line-through", opacity: 0.6 },
  fab: { position: "absolute", right: 16, bottom: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: { backgroundColor: "white", borderRadius: 12, padding: 16 },
});
