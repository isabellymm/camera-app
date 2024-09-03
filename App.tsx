import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import { useEffect, useState, useRef } from 'react';
import React from 'react';
import * as MediaLibary from 'expo-media-library'
import { Video, ResizeMode } from 'expo-av'

const { width: widthScreen, height: heightScreen } = Dimensions.get('screen')

export default function App() {

  const device = useCameraDevice("back")
  const { hasPermission, requestPermission } = useCameraPermission()
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission
  const [permission, setPermission] = useState<null | boolean>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [videoUri, setvideoUri] = useState<string | null>(null)
  const [modalVisable, setmodalVisable] = useState(false)


  const cameraRef = useRef<Camera>(null)
  useEffect(() => {

    (async () => {

      const status = await requestPermission()
      const statusMic = await requestMicPermission()

      if (status && statusMic) {
        setPermission(true)
      }

      const { status: statusMediaLibrary } = await MediaLibary.requestPermissionsAsync()
      if (statusMediaLibrary !== "granted") {
        console.log('Nao autorizado')
        setPermission(false)
        return
      }

    })()
  }, [])


  const startRecording = () => {
    if (!cameraRef.current || !device) return
    setIsRecording(true)

    cameraRef.current.startRecording({
      onRecordingFinished: (video) => {
        setIsRecording(false)
        setvideoUri(video.path)
        setmodalVisable(true)
      },
      onRecordingError: (error) => {
        console.log('ERROR:' + error)
      }
    })
  }

  const stopRecording = async () => {
    if (cameraRef.current) {
      await cameraRef.current.stopRecording()
      setIsRecording(false)
    }
  }

  function handleCloseModal() {
    setmodalVisable(false)
  }

  const handleSaveVideo = async () => {
    if (videoUri) {
      try {
        await MediaLibary.createAssetAsync(videoUri)
        console.log('salvo com sucesso!')

      } catch (error) {
        console.log('Erro ao salvar video')
        console.log('ERROR:' + error)
      }
    }
  }

  if (!permission) return <View></View>

  if (!device || device === null) return <View></View>


  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Camera
        style={StyleSheet.absoluteFill}
        ref={cameraRef}
        device={device}
        isActive={true}
        video={true}
        audio={true}
        orientation="portrait"
        resizeMode="cover"
      />

      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}

        style={{
          width: 70,
          height: 70,
          borderRadius: 99,
          borderWidth: 8,
          borderColor: "white",
          position: "absolute",
          alignSelf: "center"
        }}
      />

      {videoUri && (
        <Modal
          animationType='slide'
          transparent={false}
          visible={modalVisable}
          onRequestClose={handleCloseModal}>

          <View style={styles.videoContainer}>
            <Video
              source={{ uri: videoUri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              shouldPlay
              isLooping
              resizeMode={ResizeMode.COVER}
              style={{ width: widthScreen, height: heightScreen }}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleCloseModal}>
                <Text style={{ color: '#000' }}>Fechar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleSaveVideo}>
                <Text style={{ color: '#000' }}>Salvar video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    zIndex: 99,
    flexDirection: 'row',
    gap: 14,
  },
  button: {
    backgroundColor: '#FFF',
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 8,
    paddingBottom: 8,
    top: 24,
    left: 24,
    borderRadius: 4
  }
});
