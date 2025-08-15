import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { SERVER } from '../config';
export default function DetailsScreen({ route, navigation }){
  const [item,setItem]=useState(route.params.item); const [name,setName]=useState(item.name);
  async function save(){ const res=await fetch(`${SERVER}/api/items/${item._id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})}); const updated=await res.json(); setItem(updated); navigation.setParams({item:updated}); navigation.goBack(); }
  return (<View style={styles.container}><Text style={styles.h1}>Edit Item</Text><TextInput style={styles.input} value={name} onChangeText={setName}/><Button title='Save' onPress={save}/></View>);
}
const styles=StyleSheet.create({ container:{flex:1,padding:16}, h1:{fontSize:20,fontWeight:'600',marginBottom:8}, input:{borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:10,marginBottom:12} });
