import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, FlatList, Pressable, Modal } from 'react-native';
import { SERVER } from './config';

export default function App() {
  // data
  const [items, setItems] = useState([]);
  // create
  const [text, setText] = useState('');
  // edit (modal)
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  // --- CRUD ---
  async function load() {
    const r = await fetch(SERVER + '/api/items');
    setItems(await r.json());
  }

  async function add() {
    const name = text.trim();
    if (!name) return;
    const r = await fetch(SERVER + '/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const item = await r.json();
    setItems([item, ...items]);
    setText('');
  }

  async function toggle(item) {
    const r = await fetch(SERVER + '/api/items/' + item._id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !item.done })
    });
    const updated = await r.json();
    setItems(items.map(i => (i._id === updated._id ? updated : i)));
  }

  function openEdit(item) {
    setEditId(item._id);
    setEditText(item.name);
    setEditOpen(true);
  }
  function closeEdit() {
    setEditOpen(false);
    setEditId(null);
    setEditText('');
  }
  async function saveEdit() {
    const name = editText.trim();
    if (!name || !editId) return;
    const r = await fetch(SERVER + '/api/items/' + editId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const updated = await r.json();
    setItems(items.map(i => (i._id === updated._id ? updated : i)));
    closeEdit();
  }

  async function remove(id) {
    await fetch(SERVER + '/api/items/' + id, { method: 'DELETE' });
    setItems(items.filter(i => i._id !== id));
  }

  useEffect(() => { load(); }, []);

  // row
  const Row = ({ item }) => (
    <View style={styles.row}>
      <Pressable onPress={() => toggle(item)} style={{ flex: 1, paddingRight: 10 }}>
        <Text style={[styles.name, item.done && styles.done]}>{item.name}</Text>
      </Pressable>
      <Button title="Edit" onPress={() => openEdit(item)} />
      <View style={{ width: 8 }} />
      <Button title="Del" onPress={() => remove(item._id)} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, marginBottom: 4 }}>Items</Text>
      <Text style={{ color: '#666', marginBottom: 10 }}>Tap an item to toggle done.</Text>

      {/* Create */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add item..."
          style={[styles.input, { flex: 1, marginRight: 8 }]}
        />
        <Button title="Add" onPress={add} />
      </View>

      <Button title="Refresh" onPress={load} />

      {/* Read + Delete */}
      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        renderItem={Row}
        contentContainerStyle={{ paddingTop: 8 }}
      />

      {/* Update in a Modal */}
      <Modal visible={editOpen} animationType="slide" onRequestClose={closeEdit}>
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Edit Item</Text>
          <TextInput
            value={editText}
            onChangeText={setEditText}
            placeholder="New name..."
            style={[styles.input, { marginBottom: 12 }]}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Button title="Save" onPress={saveEdit} />
            <View style={{ width: 12 }} />
            <Button title="Cancel" onPress={closeEdit} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  row: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e5e5e5',
         flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
  name: { fontSize: 16 },
  done: { textDecorationLine: 'line-through', color: '#888' }
};