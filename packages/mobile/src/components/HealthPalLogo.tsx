import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HealthPalLogoProps {
  size?: number;
  showText?: boolean;
}

export default function HealthPalLogo({ size = 66, showText = true }: HealthPalLogoProps) {
  // Tính toán tỷ lệ dựa trên viewBox gốc 95x107
  const aspectRatio = 95 / 107;
  const logoWidth = size * aspectRatio;
  const logoHeight = size;

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width: logoWidth, height: logoHeight }]}>
        <Svg width={logoWidth} height={logoHeight} viewBox="0 0 95 107" fill="none">
          <Path
            d="M53.3207 52.7392V59.2363H41.2522V27.1923H46.558V20.4286H34.5174V39.2277H21.2547V27.1923H27.7626V20.4286H20.7691C19.1071 20.4307 17.5137 21.0916 16.3385 22.2663C15.1633 23.441 14.5021 25.0337 14.5 26.695V39.7409C14.5021 41.4022 15.1633 42.9949 16.3385 44.1696C17.5137 45.3443 19.1071 46.0052 20.7691 46.0073H34.5174V59.7456C34.5226 61.4041 35.1846 62.9931 36.3587 64.1651C37.5327 65.3372 39.1232 65.9969 40.7825 66H53.8023C55.4643 65.9979 57.0577 65.337 58.2329 64.1623C59.4081 62.9876 60.0693 61.3949 60.0714 59.7337V52.7392H53.3207Z"
            fill="#1C2A3A"
          />
          <Path
            d="M74.2305 19.9997H60.485V6.26856C60.4829 4.60668 59.8217 3.01347 58.6463 1.83834C57.471 0.663218 55.8775 0.00210631 54.2154 0H41.1944C39.5329 0.00315883 37.9404 0.664734 36.766 1.83975C35.5915 3.01476 34.9308 4.60737 34.9287 6.26856V13.2575H41.6641V6.7382H53.7218V38.8054H48.4314V45.5714H60.485V26.7498H73.7488V38.8054H67.2363V45.5714H74.2305C75.8927 45.5693 77.4861 44.9082 78.6615 43.7331C79.8368 42.558 80.498 40.9648 80.5001 39.3029V26.2682C80.498 24.6064 79.8368 23.0132 78.6615 21.838C77.4861 20.6629 75.8927 20.0018 74.2305 19.9997Z"
            fill="#1C2A3A"
          />
        </Svg>
      </View>
      {showText && (
        <Text style={styles.brandName}>HealthPal</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 25,
    color: '#6B7280',
  },
});