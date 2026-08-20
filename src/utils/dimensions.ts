import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const screenWidth = width;
export const screenHeight = height;

// Optional: you can also export the screen dimensions (includes notch/navbar area on Android)
export const windowWidth = Dimensions.get('screen').width;
export const windowHeight = Dimensions.get('screen').height;
