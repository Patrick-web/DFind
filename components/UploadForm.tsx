import { View, Modal, Image, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Pressable, } from 'react-native'
import { formStyles } from "../styles/global"
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { LostItem } from '../types'
import { globalState } from '../store/store'
import { postLostItem } from '../db/db'

// https://tinypng.com/developers
const UploadForm = (props: any) => {
  const [image, setImage] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [errors, setErrors] = useState({ title: '', location: '', image: '' })
  const userID = globalState.loggedInUser?.id || ''
  const [base64Image, setBase64Image] = useState('')
  const [isLoading, setIsLoading] = useState(false);


  async function createPost() {
    setErrors({ title: '', location: '', image: '' })
    let errorEncounter = false;
    if (itemTitle.length < 4) {
      setErrors((err) => ({
        ...err,
        title: 'Item name is too short (at least 4 characters)'
      }))
      errorEncounter = true;
    }
    if (itemLocation.length < 4) {
      setErrors((err) => ({
        ...err,
        location: 'Item name is too short (at least 4 characters)'
      }))
      errorEncounter = true;
    }
    if (!image) {
      setErrors((err) => ({
        ...err,
        image: 'Please provide and image of the item'
      }))
      errorEncounter = true;
    }
    if (errorEncounter) return;

    setIsLoading(true);

    const lostItem: LostItem = {
      id: Date.now().toString(),
      title: itemTitle,
      location: itemLocation,
      localImage: image,
      onlineImage: '',
      finderID: userID,
      finderNumber: globalState.loggedInUser?.user_metadata.phoneNumber,
      datePosted: (new Date()).toISOString(),
      isClaimed: false,
      claimDate: null,
      claimerID: null,
      isDeleted: false
    }
    const { error } = await postLostItem(lostItem, base64Image) as any;
    setIsLoading(false);

    setItemTitle('');
    setItemLocation('');
    setImage(null);

    props.setShowUploadForm(false);
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,

    });

    if (!result.cancelled) {
      setImage(result.uri);
      setBase64Image(result.base64 as string)
    }
  }
  const captureImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've denied the app access to your camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync(
      {
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      }
    );
    if (!result.cancelled) {
      setImage(result.uri);
      setBase64Image(result.base64 as string)
    }
  }
  return (
    <Modal
      style={{ backgroundColor: "rgba(0,0,0,0.5)", }}
      animationType="slide"
      transparent={true}
      visible={props.showUploadForm}>
      <View style={styles.container}>


        <View style={styles.formWrapper}>
          <Pressable style={styles.closeModal} onPress={() => { props.setShowUploadForm(false) }}
          >
            <Image style={{ width: 15, height: 15 }} source={require('../assets/images/xwhite.png')} />
          </Pressable>
          {isLoading &&
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="black" />
              <Text style={{ color: 'black', marginTop: 10, fontWeight: 'bold', fontSize: 15 }}>Sending Post</Text>
            </View>
          }

          <Text style={{ fontSize: 25, marginBottom: 10, fontWeight: "bold", alignSelf: 'center' }}> Post a Lost Item </Text>
          <View style={{ width: '100%', marginBottom: 10 }} >
            <Text style={{ marginBottom: 5 }}>What is the Item 🏮</Text>
            <TextInput value={itemTitle} onChangeText={(text) => setItemTitle(text)} style={formStyles.input} />
            {errors.title != '' && <Text style={{ color: 'red', fontSize: 12, marginLeft: 10 }}>{errors.title}</Text>}
          </View>
          <View style={{ width: '100%', marginBottom: 10 }} >
            <Text style={{ marginBottom: 5 }}>Where did you find it 🗺</Text>
            <TextInput value={itemLocation} onChangeText={(text) => setItemLocation(text)} style={formStyles.input} />
            {errors.location != '' && <Text style={{ color: 'red', fontSize: 12, marginLeft: 10 }}>{errors.location}</Text>}
          </View>
          <View style={{ width: '100%', marginBottom: 20 }} >
            <Text style={{ marginBottom: 5, textAlign: 'center' }}>Add a picture of the item 🖼 (landscape)</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => { pickImage() }} >
                <View style={styles.smallButton} >
                  <Text style={{ color: "white", fontWeight: "900" }} >Select Photo</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { captureImage() }} >
                <View style={[styles.smallButton, { marginLeft: 20 }]} >
                  <Text style={{ color: "white", fontWeight: "900" }} >Take Photo</Text>
                </View>
              </TouchableOpacity>
            </View>
            {errors.image != '' && <Text style={{ color: 'red', textAlign: 'center', fontSize: 12, marginLeft: 10 }}>{errors.image}</Text>}
          </View>
          {image && <Image source={{ uri: image }} style={styles.uploadImage} />}
          <TouchableOpacity onPress={createPost} >
            <View style={formStyles.button} >
              <Text style={{ color: "white", fontWeight: "bold" }} >Post</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    height: "100%",
    width: "100%",
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  formWrapper: {
    elevation: 20,
    backgroundColor: 'white',
    padding: 20,
    width: "100%",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
  form: {
    alignSelf: 'center',
    zIndex: 2,
    width: "100%",
    backgroundColor: "white",
    marginTop: 10,
    paddingTop: 20,
    paddingRight: 40,
    paddingLeft: 40,
    borderRadius: 30,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

  },
  loader: {
    position: 'absolute',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    zIndex: 3,
    bottom: 0,
    left: 0,
    width: '112%',
    height: '112%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  closeModal: {
    position: 'absolute',
    top: 0,
    zIndex: 4,
    // elevation: 10,
    backgroundColor: "crimson",
    borderColor: 'white',
    borderWidth: 4,
    transform: [
      { translateY: -30 }
    ],
    borderRadius: 30,
    padding: 20,
    width: 55,
    height: 55,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButton: {
    borderRadius: 20,
    backgroundColor: "#FF9387",
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadImage: {
    width: '98%',
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  }
})
export default UploadForm;
