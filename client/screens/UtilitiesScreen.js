import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
export default function UtilitiesScreen(){
  const [coords,setCoords]=useState(null); const [photo,setPhoto]=useState(null); const [msg,setMsg]=useState('');
  async function getLocation(){ setMsg(''); const {status}=await Location.requestForegroundPermissionsAsync(); if(status!=='granted'){ setMsg('Permission denied'); return;} const loc=await Location.getCurrentPositionAsync({}); setCoords({lat:loc.coords.latitude,lng:loc.coords.longitude}); }
  async function takePhoto(){ setMsg(''); const {status}=await ImagePicker.requestCameraPermissionsAsync(); if(status!=='granted'){ setMsg('Camera permission denied'); return;} const result=await ImagePicker.launchCameraAsync({quality:0.5}); if(!result.canceled) setPhoto(result.assets[0].uri); }
  return (<View style={styles.container}><Text style={styles.h1}>Utilities</Text><Button title='Get Location' onPress={getLocation}/>{coords&&<Text style={{marginVertical:8}}>lat: {coords.lat.toFixed(5)}, lng: {coords.lng.toFixed(5)}</Text>}<Button title='Take Photo' onPress={takePhoto}/>{photo&&<Image source={{uri:photo}} style={{width:180,height:180,borderRadius:8,marginTop:8}}/>}{!!msg&&<Text style={{color:'red',marginTop:8}}>{msg}</Text>}</View>);}
const styles=StyleSheet.create({ container:{flex:1,padding:16}, h1:{fontSize:20,fontWeight:'600',marginBottom:8} });
