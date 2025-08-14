import React, { useEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Animated, ImageBackground, StatusBar, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from '../components/BrandLogo';

type ColorStops = readonly [string, string, ...string[]];

type TileProps = {
  children?: ReactNode;
  bgColor?: string;
  image?: number;
  radius?: number;
  gradientColors?: ColorStops;
};

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isColorStops(v: unknown): v is ColorStops {
  return Array.isArray(v) && v.length >= 2 && v.every((x) => typeof x === 'string');
}

/* ---------- Screen ---------- */
type LandingScreenProps = {
  onLogoPress?: () => void;
};

export default function LandingScreen({ onLogoPress }: LandingScreenProps): ReactElement {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleIn, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [fadeIn, scaleIn]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      

      {/* Background with Doctor Photos */}
      <View style={styles.backgroundContainer}>
        <View style={styles.photoGrid}>
          {/* Row 1 */}
          <View style={styles.photoRow}>
            <PhotoTile bgColor={COLORS.pastel.lilac} />
            <PhotoTile image={require('../../assets/behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_cabe61f6-0a23-4afa-ace2-90d69e11914f.jpg')} />
            <PhotoTile bgColor={COLORS.pastel.pink} />
          </View>
          
          {/* Row 2 */}
          <View style={styles.photoRow}>
            <PhotoTile image={require('../../assets/behnazsabaa_Portrait_of_Smiling_Male_Medical_Doctor__Style_of_H_0996798e-acc5-48e2-9b18-79c922a9f29b.jpg')} />
            <View style={styles.logoTileWrapper}>
              <LinearGradient
                colors={[COLORS.brandStart, COLORS.brandEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.photoTile}
              >
                <Animated.View
                  style={[styles.logoContainer, { opacity: fadeIn, transform: [{ scale: scaleIn }] }]}
                >
                  <BrandLogo size={66} tintColor={COLORS.white} />
                </Animated.View>
              </LinearGradient>
              <TouchableOpacity
                onPress={() => {
                  console.log('Logo pressed!');
                  if (onLogoPress) {
                    onLogoPress();
                  } else {
                    console.log('onLogoPress is undefined');
                  }
                }}
                accessible
                accessibilityLabel="HealthPal - Ấn để tiếp tục"
                style={styles.logoTouchableOverlay}
                activeOpacity={0.7}
              />
            </View>
            <PhotoTile image={require('../../assets/behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_0018eb0f-c5eb-48db-9994-918bde9cd9d4.jpg')} />
          </View>
          
          {/* Row 3 */}
          <View style={styles.photoRow}>
            <PhotoTile bgColor={COLORS.pastel.brown} />
            <PhotoTile image={require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor__Style_of_Her_Fi_bd099184-b9f1-403f-bc9c-766786d0ee9b.jpg')} />
            <PhotoTile bgColor={COLORS.pastel.teal} />
          </View>
        </View>
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)']}
          locations={[0, 1]}
          style={styles.gradientOverlay}
        />
      </View>
    </View>
  );
}

/* ---------- Components ---------- */
function PhotoTile({ children, bgColor, image, gradientColors }: TileProps): ReactElement {
  if (isNumber(image)) {
    return (
      <ImageBackground
        source={image}
        imageStyle={styles.photoTileImage}
        style={styles.photoTile}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    );
  }
  
  if (isColorStops(gradientColors)) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.photoTile}
      >
        {children}
      </LinearGradient>
    );
  }
  
  return (
    <View style={[styles.photoTile, { backgroundColor: bgColor }]}>
      {children}
    </View>
  );
}

/* ---------- Theme & Styles ---------- */
const COLORS = {
  background: '#2B2B2B',
  white: '#FFFFFF',
  brandStart: '#352261',
  brandEnd: '#2C1D47',
  pastel: {
    lilac: '#ACA1CD',
    pink: '#DC9497',
    brown: '#D7A99C',
    teal: '#4D9B91',
  },
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  // Background Grid
  backgroundContainer: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    left: '-10%',
    top: '-10%',
  },
  photoGrid: {
    flex: 1,
    gap: 12,
    paddingVertical: 68,
  },
  photoRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  photoTile: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  photoTileImage: {
    borderRadius: 24,
  },
  
  // Gradient Overlay
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  
  // Logo Container
  logoTileWrapper: {
    flex: 1,
    position: 'relative',
  },
  logoTouchableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    borderRadius: 24,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
