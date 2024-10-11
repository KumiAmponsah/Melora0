import {FontAwesome } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
export default function ResultsNotFound() {
  const navigation = useNavigation();
  return (
    <LinearGradient
    colors={['#5e16ec', '#121212']}
    style={styles.viewContainer}
  >
    
     <FontAwesome name="ban" size={width * 0.27} color="#FFFFFF" style={styles.icon}/>
      <Text style={styles.NoResulttext} >No Result</Text>
       <Text style={styles.Messagetext} >We didn't quite catch that</Text>
     
       <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
     
      </LinearGradient>
  );
}
const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
 
  },
  buttonText: {

    color: '#FFF',
    fontSize: 25,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0d5bb3',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 5,
    width:160,
    alignSelf:'center',
    height:50,
    marginTop:50
  },
 
  NoResulttext: {
    fontSize: 29,
    color: '#FFFFFF',
    fontWeight:'bold',
    marginLeft: width * 0.335,
    marginTop: height * 0.34,
  },  icon: {
    marginLeft: width * 0.38,
    top: height * 0.33,
    bottom: height * 0.02,
  },
  Messagetext: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: width * 0.27,
    marginTop: height * 0.01,
},
TryAgaintext: {
    fontSize: 30,
    backgroundColor: '#3660D1',
    marginLeft: width * 0.01,
    marginTop: height * 0.1,
   alignSelf:'center'
  },
  touchableButton:{
    borderRadius:1000,

  }
});