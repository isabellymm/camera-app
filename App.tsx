import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission} from 'react-native-vision-camera';
import { useEffect, useState, useRef } from 'react';

export default function App() {

  const device = useCameraDevice("back")
  const { hasPermission, requestPermission } = useCameraPermission()
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission
  const [permission, setPermission] = useState<null| boolean>(null)

  const cameraRef = useRef<Camera>(null)

  useEffect(() => {

    (async () => {

      const status = await requestPermission()
      const statusMic = await requestMicPermission()

      if(status && statusMic){
        setPermission(true)
      }

    })()
  }, [])



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
      ></Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
