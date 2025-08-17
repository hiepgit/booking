import React, { useEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Animated, ImageBackground, StatusBar, StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} translucent={false} />

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
              >/* 12_Home screen */

              position: absolute;
              width: 442px;
              height: 888px;
              left: 6977px;
              top: 3942px;
              
              
              
              /* iPhone 14 Mockup */
              
              position: absolute;
              width: 442px;
              height: 888px;
              left: 0px;
              top: 0px;
              
              
              
              /* Body (3) */
              
              position: absolute;
              width: 432px;
              height: 886px;
              left: 5px;
              top: 1px;
              
              background: #DCD7D8;
              border: 1px solid #201B23;
              border-radius: 70px;
              
              
              /* Body(2) */
              
              position: absolute;
              width: 428px;
              height: 882px;
              left: 7px;
              top: 3px;
              
              background: #4A4355;
              border-radius: 69px;
              
              
              /* Body */
              
              position: absolute;
              width: 420px;
              height: 874px;
              left: 11px;
              top: 7px;
              
              background: #000000;
              border-radius: 65px;
              
              
              /* Speaker */
              
              position: absolute;
              width: 84px;
              height: 4px;
              left: 179px;
              top: 7px;
              
              background: linear-gradient(180deg, #0A0806 0%, #2D2D2D 100%);
              border-radius: 0px 0px 10px 10px;
              
              
              /* Silent Button */
              
              position: absolute;
              width: 4px;
              height: 33px;
              left: 0px;
              top: 171px;
              
              
              
              /* Rectangle 13 */
              
              box-sizing: border-box;
              
              position: absolute;
              width: 4px;
              height: 33px;
              left: 0px;
              top: 171px;
              
              background: #A499AB;
              border: 0.5px solid #4E4354;
              border-radius: 1px 0px 0px 1px;
              
              
              /* Rectangle 14 */
              
              position: absolute;
              width: 2px;
              height: 29px;
              left: 2px;
              top: 173px;
              
              background: #91859B;
              
              
              /* Rectangle 17 */
              
              position: absolute;
              width: 1px;
              height: 29px;
              left: 3px;
              top: 173px;
              
              background: #413947;
              transform: matrix(-1, 0, 0, 1, 0, 0);
              
              
              /* Rectangle 15 */
              
              position: absolute;
              width: 2px;
              height: 1px;
              left: 2px;
              top: 202px;
              
              background: #292230;
              
              
              /* Rectangle 16 */
              
              position: absolute;
              width: 2px;
              height: 1px;
              left: 2px;
              top: 173px;
              
              background: #292230;
              
              
              /* Volume up button */
              
              position: absolute;
              width: 4px;
              height: 65px;
              left: 0px;
              top: 234px;
              
              
              
              /* Rectangle 18 */
              
              box-sizing: border-box;
              
              position: absolute;
              width: 4px;
              height: 65px;
              left: 0px;
              top: 234px;
              
              background: #A499AB;
              border: 0.5px solid #4E4354;
              border-radius: 1px 0px 0px 1px;
              
              
              /* Rectangle 19 */
              
              position: absolute;
              width: 2px;
              height: 57px;
              left: 2px;
              top: 238px;
              
              background: #91859B;
              
              
              /* Rectangle 20 */
              
              position: absolute;
              width: 1px;
              height: 57px;
              left: 3px;
              top: 238px;
              
              background: #413947;
              transform: matrix(-1, 0, 0, 1, 0, 0);
              
              
              /* Rectangle 21 */
              
              position: absolute;
              width: 2px;
              height: 2px;
              left: 2px;
              top: 294px;
              
              background: #292230;
              
              
              /* Rectangle 22 */
              
              position: absolute;
              width: 2px;
              height: 2px;
              left: 2px;
              top: 238px;
              
              background: #292230;
              
              
              /* Volume down button */
              
              position: absolute;
              width: 4px;
              height: 65px;
              left: 0px;
              top: 319px;
              
              
              
              /* Rectangle 18 */
              
              box-sizing: border-box;
              
              position: absolute;
              width: 4px;
              height: 65px;
              left: 0px;
              top: 319px;
              
              background: #A499AB;
              border: 0.5px solid #4E4354;
              border-radius: 1px 0px 0px 1px;
              
              
              /* Rectangle 19 */
              
              position: absolute;
              width: 2px;
              height: 57px;
              left: 2px;
              top: 323px;
              
              background: #91859B;
              
              
              /* Rectangle 20 */
              
              position: absolute;
              width: 1px;
              height: 57px;
              left: 3px;
              top: 323px;
              
              background: #413947;
              transform: matrix(-1, 0, 0, 1, 0, 0);
              
              
              /* Rectangle 21 */
              
              position: absolute;
              width: 2px;
              height: 2px;
              left: 2px;
              top: 379px;
              
              background: #292230;
              
              
              /* Rectangle 22 */
              
              position: absolute;
              width: 2px;
              height: 2px;
              left: 2px;
              top: 323px;
              
              background: #292230;
              
              
              /* Power button */
              
              position: absolute;
              width: 4px;
              height: 100px;
              left: 438px;
              top: 280px;
              
              transform: rotate(-180deg);
              
              
              /* Rectangle 18 */
              
              box-sizing: border-box;
              
              position: absolute;
              width: 4px;
              height: 100px;
              left: 438px;
              top: 280px;
              
              background: #A499AB;
              border: 0.5px solid #4E4354;
              border-radius: 1px 0px 0px 1px;
              transform: rotate(-180deg);
              
              
              /* Rectangle 19 */
              
              position: absolute;
              width: 2px;
              height: 87.69px;
              left: 438px;
              top: 286.15px;
              
              background: #91859B;
              transform: rotate(-180deg);
              
              
              /* Rectangle 20 */
              
              position: absolute;
              width: 1px;
              height: 87.69px;
              left: 438px;
              top: 286.15px;
              
              background: #413947;
              transform: matrix(1, 0, 0, -1, 0, 0);
              
              
              /* Rectangle 21 */
              
              position: absolute;
              width: 2px;
              height: 3.08px;
              left: 438px;
              top: 284.62px;
              
              background: #292230;
              transform: rotate(-180deg);
              
              
              /* Rectangle 22 */
              
              position: absolute;
              width: 2px;
              height: 3.08px;
              left: 438px;
              top: 370.77px;
              
              background: #292230;
              transform: rotate(-180deg);
              
              
              /* Elements */
              
              position: absolute;
              width: 434px;
              height: 888px;
              left: 4px;
              top: 0px;
              
              
              
              /* Element */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 4px;
              top: 94px;
              
              
              
              /* Rectangle 23 */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 4px;
              top: 94px;
              
              background: #46404E;
              
              
              /* Rectangle 24 */
              
              position: absolute;
              width: 2.33px;
              height: 6px;
              left: 4px;
              top: 94px;
              
              background: #837588;
              
              
              /* Element */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 4px;
              top: 788px;
              
              
              
              /* Rectangle 23 */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 4px;
              top: 788px;
              
              background: #46404E;
              
              
              /* Rectangle 24 */
              
              position: absolute;
              width: 2.33px;
              height: 6px;
              left: 4px;
              top: 788px;
              
              background: #837588;
              
              
              /* Element */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 431px;
              top: 788px;
              
              transform: rotate(-180deg);
              
              
              /* Rectangle 23 */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 431px;
              top: 788px;
              
              background: #46404E;
              transform: rotate(-180deg);
              
              
              /* Rectangle 24 */
              
              position: absolute;
              width: 2.33px;
              height: 6px;
              left: 435.67px;
              top: 788px;
              
              background: #837588;
              transform: rotate(-180deg);
              
              
              /* Element */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 431px;
              top: 94px;
              
              transform: rotate(-180deg);
              
              
              /* Rectangle 23 */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 431px;
              top: 94px;
              
              background: #46404E;
              transform: rotate(-180deg);
              
              
              /* Rectangle 24 */
              
              position: absolute;
              width: 2.33px;
              height: 6px;
              left: 435.67px;
              top: 94px;
              
              background: #837588;
              transform: rotate(-180deg);
              
              
              /* Element */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 338px;
              top: 0px;
              
              transform: rotate(90deg);
              
              
              /* Rectangle 23 */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 338px;
              top: 0px;
              
              background: #46404E;
              transform: rotate(90deg);
              
              
              /* Rectangle 24 */
              
              position: absolute;
              width: 2.33px;
              height: 6px;
              left: 338px;
              top: 0px;
              
              background: #837588;
              transform: rotate(90deg);
              
              
              /* Element */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 98px;
              top: 881px;
              
              transform: rotate(-90deg);
              
              
              /* Rectangle 23 */
              
              position: absolute;
              width: 7px;
              height: 6px;
              left: 98px;
              top: 881px;
              
              background: #46404E;
              transform: rotate(-90deg);
              
              
              /* Rectangle 24 */
              
              position: absolute;
              width: 2.33px;
              height: 6px;
              left: 98px;
              top: 885.67px;
              
              background: #837588;
              transform: rotate(-90deg);
              
              
              /* Home Page */
              
              position: absolute;
              width: 390px;
              height: 844px;
              left: 26px;
              top: 22px;
              
              background: #FFFFFF;
              border-radius: 54px;
              
              
              /* Statusbar */
              
              position: absolute;
              width: 390px;
              height: 51px;
              left: 0px;
              top: 0px;
              
              
              
              /* Frame 1000000891 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: flex-start;
              padding: 0px;
              gap: 5px;
              
              position: absolute;
              width: 66.6px;
              height: 11.33px;
              left: 308.67px;
              top: 21.33px;
              
              
              
              /* Cellular */
              
              width: 17px;
              height: 10.67px;
              
              background: #000000;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Cellular_Connection-path */
              
              position: absolute;
              width: 3px;
              height: 4px;
              right: 63.6px;
              top: calc(50% - 4px/2 + 3px);
              
              background: #FFFFFF;
              
              
              /* Cellular_Connection-path */
              
              position: absolute;
              width: 3px;
              height: 6px;
              right: 58.93px;
              top: calc(50% - 6px/2 + 2px);
              
              background: #FFFFFF;
              
              
              /* Cellular_Connection-path */
              
              position: absolute;
              width: 3px;
              height: 8.33px;
              right: 54.27px;
              top: calc(50% - 8.33px/2 + 0.83px);
              
              background: #FFFFFF;
              
              
              /* Cellular_Connection-path */
              
              position: absolute;
              width: 3px;
              height: 10.67px;
              right: 49.6px;
              top: calc(50% - 10.67px/2 - 0.33px);
              
              background: #FFFFFF;
              
              
              /* Wifi */
              
              width: 15.27px;
              height: 10.97px;
              
              background: #000000;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Wifi-path */
              
              position: absolute;
              width: 15.27px;
              height: 4.74px;
              right: 29.33px;
              top: calc(50% - 4.74px/2 - 3.3px);
              
              background: #FFFFFF;
              
              
              /* Wifi-path */
              
              position: absolute;
              width: 9.95px;
              height: 3.63px;
              right: 31.99px;
              top: calc(50% - 3.63px/2 - 0.06px);
              
              background: #FFFFFF;
              
              
              /* Wifi-path */
              
              position: absolute;
              width: 4.63px;
              height: 3.37px;
              right: 34.65px;
              top: calc(50% - 3.37px/2 + 3.61px);
              
              background: #FFFFFF;
              
              
              /* Battery */
              
              width: 24.33px;
              height: 11.33px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              
              
              /* Union */
              
              position: absolute;
              width: 24.33px;
              height: 11.33px;
              left: 42.27px;
              top: 0px;
              
              background: #000000;
              mix-blend-mode: normal;
              opacity: 0.4;
              
              
              /* Border */
              
              box-sizing: border-box;
              
              position: absolute;
              width: 22px;
              height: 11.33px;
              right: 2.33px;
              top: calc(50% - 11.33px/2);
              
              mix-blend-mode: normal;
              opacity: 0.35;
              border: 1px solid #FFFFFF;
              border-radius: 2.66667px;
              
              
              /* Cap */
              
              position: absolute;
              width: 1.33px;
              height: 4px;
              right: 0px;
              top: calc(50% - 4px/2 + 0px);
              
              background: #FFFFFF;
              mix-blend-mode: normal;
              opacity: 0.4;
              
              
              /* Capacity */
              
              position: absolute;
              width: 18px;
              height: 7.33px;
              right: 4.33px;
              top: calc(50% - 7.33px/2 + 0px);
              
              background: #000000;
              border-radius: 1.33333px;
              
              
              /* Time */
              
              position: absolute;
              width: 30px;
              height: 17px;
              left: 23px;
              top: calc(50% - 17px/2 + 3px);
              
              font-family: 'Poppins';
              font-style: normal;
              font-weight: 400;
              font-size: 14px;
              line-height: 21px;
              text-align: center;
              letter-spacing: -0.28px;
              
              color: #000000;
              
              
              
              /* Content */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              gap: 16px;
              
              position: absolute;
              width: 390px;
              height: 717px;
              left: 0px;
              top: 51px;
              
              background: #FFFFFF;
              
              
              /* Top  */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px 24px;
              gap: 14px;
              
              width: 390px;
              height: 277px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Location & Notification */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-end;
              padding: 0px;
              gap: 67px;
              
              width: 342px;
              height: 46px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Location */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 131.75px;
              height: 46px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Location */
              
              width: 57px;
              height: 21px;
              
              /* text-sm/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 14px;
              line-height: 150%;
              /* identical to box height, or 21px */
              text-align: center;
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Frame 1000000926 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 7px;
              
              width: 131.75px;
              height: 21px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 17.75px;
              height: 20.5px;
              
              /* Dark Teal */
              background: #1C2A3A;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Frame 1000000923 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 8px;
              
              width: 107px;
              height: 21px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Seattle, USA */
              
              width: 85px;
              height: 21px;
              
              /* text-sm/font-semibold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 600;
              font-size: 14px;
              line-height: 150%;
              /* identical to box height, or 21px */
              text-align: center;
              
              /* gray/700 */
              color: #374151;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/linear/arrow-down */
              
              width: 14px;
              height: 14px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* vuesax/linear/arrow-down */
              
              position: absolute;
              width: 14px;
              height: 14px;
              left: 0px;
              top: 0px;
              
              
              
              /* arrow-down */
              
              position: absolute;
              width: 14px;
              height: 14px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 17%;
              right: 17%;
              top: 37.29%;
              bottom: 33.13%;
              
              border: 1.5px solid #292D32;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              transform: rotate(-180deg);
              
              
              /* Notification */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 5px;
              gap: 10px;
              isolation: isolate;
              
              margin: 0 auto;
              width: 34px;
              height: 34px;
              
              /* gray/100 */
              background: #F3F4F6;
              border-radius: 72px;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* vuesax/bold/notification-bing */
              
              width: 24px;
              height: 24px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* notification-bing */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 5px;
              top: 5px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 24.82%;
              right: 24.81%;
              top: 20.74%;
              bottom: 29.41%;
              
              /* gray/600 */
              background: #4B5563;
              
              
              /* Vector */
              
              position: absolute;
              left: 41.71%;
              right: 41.68%;
              top: 73.53%;
              bottom: 20.59%;
              
              /* gray/600 */
              background: #4B5563;
              
              
              /* Vector */
              
              position: absolute;
              left: 14.71%;
              right: 14.71%;
              top: 14.71%;
              bottom: 14.71%;
              
              /* gray/600 */
              background: #4B5563;
              opacity: 0;
              transform: rotate(-180deg);
              
              
              /* Ellipse 3 */
              
              box-sizing: border-box;
              
              position: absolute;
              width: 5px;
              height: 5px;
              left: 20px;
              top: 8px;
              
              background: #EF0000;
              border: 0.3px solid #FFFFFF;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Search bar */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 8px 16px;
              gap: 12px;
              
              width: 342px;
              height: 40px;
              
              /* gray/100 */
              background: #F3F4F6;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* vuesax/linear/search-normal */
              
              width: 24px;
              height: 24px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/linear/search-normal */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* search-normal */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 8.33%;
              right: 12.5%;
              top: 8.33%;
              bottom: 12.5%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 83.33%;
              right: 8.33%;
              top: 83.33%;
              bottom: 8.33%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              
              
              /* Search doctor... */
              
              width: 105px;
              height: 21px;
              
              /* text-sm/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 14px;
              line-height: 150%;
              /* identical to box height, or 21px */
              
              /* gray/400 */
              color: #9CA3AF;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Banner */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 8px;
              isolation: isolate;
              
              width: 342px;
              height: 163px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Image */
              
              width: 342px;
              height: 163px;
              
              background: url(behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_7a04bd15-0067-406d-87f7-c3f253dbefb9.png);
              border-radius: 12px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 1;
              z-index: 0;
              
              
              /* Background */
              
              position: absolute;
              width: 154px;
              height: 154px;
              left: -40px;
              top: -55px;
              
              background: rgba(217, 217, 217, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Background */
              
              position: absolute;
              width: 83px;
              height: 83px;
              left: 68px;
              top: 151px;
              
              background: rgba(217, 217, 217, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              z-index: 2;
              
              
              /* Title */
              
              position: absolute;
              width: 172px;
              height: 54px;
              left: 11px;
              top: 31px;
              
              /* text-lg/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 18px;
              line-height: 150%;
              /* or 27px */
              
              /* white */
              color: #FFFFFF;
              
              
              /* Inside auto layout */
              flex: none;
              order: 3;
              flex-grow: 0;
              z-index: 3;
              
              
              /* Description */
              
              position: absolute;
              width: 177px;
              height: 36px;
              left: 11px;
              top: 93px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* or 18px */
              
              /* white */
              color: #FFFFFF;
              
              
              /* Inside auto layout */
              flex: none;
              order: 4;
              flex-grow: 0;
              z-index: 4;
              
              
              /* Carousel  */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: flex-start;
              padding: 0px;
              gap: 4px;
              
              position: absolute;
              width: 60px;
              height: 6px;
              left: 141px;
              bottom: 6px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 5;
              flex-grow: 0;
              z-index: 5;
              
              
              /* Carousel Active 2 */
              
              width: 30px;
              height: 6px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* bg */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              /* white */
              background: #FFFFFF;
              border-radius: 40px;
              
              
              /* Carousel Active 2 */
              
              width: 6px;
              height: 6px;
              
              opacity: 0.8;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* bg */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              /* gray/200 */
              background: #E5E7EB;
              border-radius: 40px;
              
              
              /* Carousel Active 3 */
              
              width: 6px;
              height: 6px;
              
              opacity: 0.8;
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              
              
              /* bg */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              /* gray/200 */
              background: #E5E7EB;
              border-radius: 40px;
              
              
              /* Carousel Active 2 */
              
              width: 6px;
              height: 6px;
              
              opacity: 0.8;
              
              /* Inside auto layout */
              flex: none;
              order: 3;
              flex-grow: 0;
              
              
              /* bg */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              /* gray/200 */
              background: #E5E7EB;
              border-radius: 40px;
              
              
              /* Middle */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px 24px;
              gap: 10px;
              
              width: 390px;
              height: 218px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Title */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              padding: 0px;
              gap: 10px;
              
              width: 342px;
              height: 24px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Title */
              
              margin: 0 auto;
              width: 87px;
              height: 24px;
              
              /* text-base/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 16px;
              line-height: 150%;
              /* identical to box height, or 24px */
              
              /* Dark Teal */
              color: #1C2A3A;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* See All */
              
              margin: 0 auto;
              width: 46px;
              height: 21px;
              
              /* text-sm/font-medium */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 500;
              font-size: 14px;
              line-height: 150%;
              /* identical to box height, or 21px */
              text-align: center;
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Categories */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              gap: 16px;
              
              width: 342px;
              height: 184px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Tabs */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              padding: 0px;
              gap: 32px;
              
              width: 342px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Tab 01 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 62px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Image */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 10px;
              gap: 10px;
              isolation: isolate;
              
              width: 62px;
              height: 62px;
              
              background: #DC9497;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Group 5 */
              
              width: 27.86px;
              height: 34.55px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* _Ã«Ã®Ã©_1 */
              
              position: absolute;
              width: 27.86px;
              height: 34.55px;
              left: 17.07px;
              top: 13.73px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 1.99%;
              right: 1.99%;
              top: 1.61%;
              bottom: 1.61%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 18.87%;
              right: 71.4%;
              top: 16.68%;
              bottom: 59.82%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Ellipse 2 */
              
              position: absolute;
              width: 68px;
              height: 68px;
              left: -33.67px;
              top: -34px;
              
              background: rgba(255, 255, 255, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Dentistry */
              
              width: 55px;
              height: 18px;
              
              /* text-xs/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              text-align: center;
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Tab 02 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 62px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Image */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 10px;
              gap: 10px;
              isolation: isolate;
              
              width: 62px;
              height: 62px;
              
              background: #93C19E;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Ellipse 2 */
              
              position: absolute;
              width: 68px;
              height: 68px;
              left: -34.33px;
              top: -34px;
              
              background: rgba(255, 255, 255, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* Group 4 */
              
              width: 35.33px;
              height: 31.03px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* _Ã«Ã®Ã©_1 */
              
              position: absolute;
              width: 35.33px;
              height: 31.03px;
              left: 13.33px;
              top: 15.48px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 1.81%;
              right: 1.69%;
              top: 28.26%;
              bottom: 28.48%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 1.69%;
              right: 3.86%;
              top: 1.92%;
              bottom: 56.68%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 20.73%;
              right: 22.93%;
              top: 65.92%;
              bottom: 1.92%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Cardiolo.. */
              
              width: 57px;
              height: 18px;
              
              /* text-xs/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              text-align: center;
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Tab 03 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 62px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              
              
              /* Image */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 10px;
              gap: 10px;
              isolation: isolate;
              
              width: 62px;
              height: 62px;
              
              background: #F5AD7E;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Group 6 */
              
              width: 36.6px;
              height: 27.69px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* _Ã«Ã®Ã©_1 */
              
              position: absolute;
              left: 20.48%;
              right: 20.48%;
              top: 27.67%;
              bottom: 27.67%;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 59.34%;
              right: 1.35%;
              top: 9.43%;
              bottom: 1.79%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 1.36%;
              right: 59.33%;
              top: 9.43%;
              bottom: 1.79%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 53%;
              right: 40.92%;
              top: 1.79%;
              bottom: 62.98%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 40.92%;
              right: 53%;
              top: 1.79%;
              bottom: 62.98%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 40.83%;
              right: 50%;
              top: 40.31%;
              bottom: 53.44%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 50%;
              right: 40.83%;
              top: 40.31%;
              bottom: 53.44%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Ellipse 2 */
              
              position: absolute;
              width: 68px;
              height: 68px;
              left: -34px;
              top: -34px;
              
              background: rgba(255, 255, 255, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Pulmono.. */
              
              width: 59px;
              height: 18px;
              
              /* text-xs/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              text-align: center;
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Tab 04 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 62px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 3;
              flex-grow: 0;
              
              
              /* Image */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 10px;
              gap: 10px;
              isolation: isolate;
              
              width: 62px;
              height: 62px;
              
              background: #ACA1CD;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Ellipse 2 */
              
              position: absolute;
              width: 68px;
              height: 68px;
              left: -34px;
              top: -34px;
              
              background: rgba(255, 255, 255, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* Group 3 */
              
              width: 27.64px;
              height: 33.55px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* _Ã«Ã®Ã©_1 */
              
              position: absolute;
              width: 27.64px;
              height: 33.55px;
              left: 17.18px;
              top: 14.22px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 1.9%;
              right: 81.49%;
              top: 5.5%;
              bottom: 49.27%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 16.94%;
              right: 73.99%;
              top: 1.56%;
              bottom: 91.69%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 59.05%;
              right: 31.89%;
              top: 1.56%;
              bottom: 91.69%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 66.55%;
              right: 16.84%;
              top: 5.52%;
              bottom: 49.27%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 1.9%;
              right: 83.15%;
              top: 5.5%;
              bottom: 81.3%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 16.5%;
              right: 31.62%;
              top: 49.72%;
              bottom: 24.94%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 42.68%;
              right: 13.54%;
              top: 75.08%;
              bottom: 1.57%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 79.57%;
              right: 1.89%;
              top: 65.8%;
              bottom: 19.56%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 87.61%;
              right: 9.95%;
              top: 72.16%;
              bottom: 25.83%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* General */
              
              width: 46px;
              height: 18px;
              
              /* text-xs/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              text-align: center;
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Tabs */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-end;
              padding: 0px;
              gap: 26px;
              
              width: 342px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Tab 05 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 62px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Image */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 10px;
              gap: 10px;
              isolation: isolate;
              
              width: 62px;
              height: 62px;
              
              background: #4D9B91;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Group 8 */
              
              width: 35.05px;
              height: 34.59px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* _Ã«Ã®Ã©_1 */
              
              position: absolute;
              width: 35.05px;
              height: 34.59px;
              left: 13.47px;
              top: 13.7px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 1.78%;
              right: 55.78%;
              top: 1.8%;
              bottom: 1.8%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 6.81%;
              right: 68.97%;
              top: 16.64%;
              bottom: 58.14%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 14.71%;
              right: 75.8%;
              top: 73.63%;
              bottom: 19.01%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 23.93%;
              right: 71.51%;
              top: 67.85%;
              bottom: 21.88%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 32.49%;
              right: 55.78%;
              top: 52.33%;
              bottom: 44.57%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 8.36%;
              right: 80.48%;
              top: 56.67%;
              bottom: 39.32%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 55.78%;
              right: 1.78%;
              top: 1.8%;
              bottom: 2.41%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 70.21%;
              right: 7.06%;
              top: 16.59%;
              bottom: 59.34%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 66.48%;
              right: 27.49%;
              top: 38.37%;
              bottom: 53.63%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 77%;
              right: 13.51%;
              top: 76.06%;
              bottom: 16.57%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 72.72%;
              right: 22.71%;
              top: 70.29%;
              bottom: 19.44%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 80.48%;
              right: 8.36%;
              top: 59.6%;
              bottom: 36.88%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 55.78%;
              right: 36.89%;
              top: 63.11%;
              bottom: 34.87%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Ellipse 2 */
              
              position: absolute;
              width: 68px;
              height: 68px;
              left: -34.67px;
              top: -34px;
              
              background: rgba(255, 255, 255, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Neurology */
              
              width: 61px;
              height: 18px;
              
              /* text-xs/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              text-align: center;
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Tab 06 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 62px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Image */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 10px;
              gap: 10px;
              isolation: isolate;
              
              width: 62px;
              height: 62px;
              
              background: #352261;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Group 7 */
              
              width: 30.78px;
              height: 29.27px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* Isolation_Mode */
              
              position: absolute;
              left: 25.18%;
              right: 25.18%;
              top: 26.4%;
              bottom: 26.4%;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 1.83%;
              right: 1.84%;
              top: 1.92%;
              bottom: 1.92%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Ellipse 2 */
              
              position: absolute;
              width: 68px;
              height: 68px;
              left: -34.33px;
              top: -34px;
              
              background: rgba(255, 255, 255, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Gastroen.. */
              
              width: 62px;
              height: 18px;
              
              /* text-xs/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              text-align: center;
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Tab 07 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 62px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              
              
              /* Image */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 10px;
              gap: 10px;
              isolation: isolate;
              
              width: 62px;
              height: 62px;
              
              background: #DEB6B5;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* _Ã«Ã®Ã©_1 */
              
              width: 24px;
              height: 31.72px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* Vector */
              
              position: absolute;
              left: 2.44%;
              right: 2.39%;
              top: 13.22%;
              bottom: 1.84%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 4.35%;
              right: 4.2%;
              top: 62.57%;
              bottom: 30.73%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 29.52%;
              right: 29.53%;
              top: 1.83%;
              bottom: 86.78%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Ellipse 2 */
              
              position: absolute;
              width: 68px;
              height: 68px;
              left: -34px;
              top: -34px;
              
              background: rgba(255, 255, 255, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Laborato.. */
              
              width: 60px;
              height: 18px;
              
              /* text-xs/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              text-align: center;
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Tab 08 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 62px;
              height: 84px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 3;
              flex-grow: 0;
              
              
              /* Image */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 10px;
              gap: 10px;
              isolation: isolate;
              
              width: 62px;
              height: 62px;
              
              background: #89CCDB;
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Group 9 */
              
              width: 35.31px;
              height: 35.21px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              z-index: 0;
              
              
              /* _Ã«Ã®Ã©_1 */
              
              position: absolute;
              left: 21.53%;
              right: 21.53%;
              top: 21.6%;
              bottom: 21.6%;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 10.55%;
              right: 24.09%;
              top: 14.64%;
              bottom: 44.72%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              transform: rotate(-45deg);
              
              
              /* Vector */
              
              position: absolute;
              left: 1.73%;
              right: 68.45%;
              top: 68.37%;
              bottom: 1.74%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 52.65%;
              right: 10.68%;
              top: 10.5%;
              bottom: 52.74%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 78.34%;
              right: 1.73%;
              top: 1.74%;
              bottom: 78.28%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 77.05%;
              right: 5.74%;
              top: 17.7%;
              bottom: 65.04%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 65.14%;
              right: 17.65%;
              top: 5.76%;
              bottom: 76.98%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 45.6%;
              right: 44.72%;
              top: 26.23%;
              bottom: 64.08%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 33.55%;
              right: 56.78%;
              top: 38.32%;
              bottom: 51.98%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Vector */
              
              position: absolute;
              left: 21.49%;
              right: 68.84%;
              top: 50.41%;
              bottom: 39.89%;
              
              /* white */
              border: 1.5px solid #FFFFFF;
              
              
              /* Ellipse 2 */
              
              position: absolute;
              width: 68px;
              height: 68px;
              left: -34px;
              top: -34px;
              
              background: rgba(255, 255, 255, 0.2);
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Vaccinat.. */
              
              width: 59px;
              height: 18px;
              
              /* text-xs/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              text-align: center;
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Bottom */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px 0px 0px 24px;
              gap: 10px;
              
              width: 390px;
              height: 290px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              
              
              /* Title */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              padding: 0px;
              gap: 16px;
              
              width: 342px;
              height: 24px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Title */
              
              margin: 0 auto;
              width: 189px;
              height: 24px;
              
              /* text-base/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 16px;
              line-height: 150%;
              /* identical to box height, or 24px */
              
              /* Dark Teal */
              color: #1C2A3A;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* See All */
              
              margin: 0 auto;
              width: 46px;
              height: 21px;
              
              /* text-sm/font-medium */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 500;
              font-size: 14px;
              line-height: 150%;
              /* identical to box height, or 21px */
              text-align: center;
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Cards */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: flex-start;
              padding: 0px 4px 4px 0px;
              gap: 16px;
              
              width: 366px;
              height: 256px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Card 01 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              isolation: isolate;
              
              width: 232px;
              height: 252px;
              
              background: #FFFFFF;
              box-shadow: 3px 3px 2px rgba(0, 0, 0, 0.05), 1px 1px 2px rgba(0, 0, 0, 0.09), 0px 0px 1px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Image */
              
              width: 232px;
              height: 121px;
              
              background: url(25030.jpg);
              border-radius: 8px 8px 0px 0px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              z-index: 0;
              
              
              /* Content */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 8px 12px 12px;
              gap: 12px;
              
              width: 232px;
              height: 131px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Info */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              gap: 4px;
              
              width: 208px;
              height: 69px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Text */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              gap: 8px;
              
              width: 208px;
              height: 47px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Sunrise Health Clinic */
              
              width: 208px;
              height: 21px;
              
              /* text-sm/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 14px;
              line-height: 150%;
              /* identical to box height, or 21px */
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Frame 1000000930 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              width: 208px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Frame 1000000888 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              width: 14px;
              height: 14px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/linear/location */
              
              width: 14px;
              height: 14px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/linear/location */
              
              position: absolute;
              width: 14px;
              height: 14px;
              left: 0px;
              top: 0px;
              
              
              
              /* location */
              
              position: absolute;
              width: 14px;
              height: 14px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 37%;
              right: 37%;
              top: 29.96%;
              bottom: 44.04%;
              
              /* gray/500 */
              border: 1px solid #6B7280;
              
              
              /* Vector */
              
              position: absolute;
              left: 14.07%;
              right: 14.07%;
              top: 8.33%;
              bottom: 8.35%;
              
              /* gray/500 */
              border: 1px solid #6B7280;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              transform: rotate(-180deg);
              
              
              /* 123 Oak Street, CA 98765 */
              
              width: 148px;
              height: 18px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Rating */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              width: 208px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Frame 1000000931 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              width: 81.34px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* 5.0 */
              
              width: 19px;
              height: 18px;
              
              /* text-xs/font-semibold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 600;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Frame 1000000929 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: flex-end;
              padding: 0px;
              gap: 2px;
              
              width: 58.34px;
              height: 10px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 3;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 4;
              flex-grow: 0;
              
              
              /* (58 Reviews) */
              
              width: 74px;
              height: 18px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Seperator */
              
              width: 208px;
              height: 0px;
              
              /* gray/200 */
              border: 1px solid #E5E7EB;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Location */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              padding: 0px;
              gap: 36px;
              
              width: 208px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Frame 1000000936 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 98px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/bold/routing */
              
              width: 16px;
              height: 16px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/bold/routing */
              
              position: absolute;
              width: 16px;
              height: 16px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 8.21%;
              right: 62.6%;
              top: 8.34%;
              bottom: 58.34%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 62.38%;
              right: 8.29%;
              top: 58.34%;
              bottom: 8.34%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 27.37%;
              right: 27.37%;
              top: 17.71%;
              bottom: 17.71%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              transform: rotate(-180deg);
              
              
              /* 2.5 km/40min */
              
              width: 78px;
              height: 18px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Frame 1000000935 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 67px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* vuesax/bold/hospital */
              
              width: 16px;
              height: 16px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/bold/hospital */
              
              position: absolute;
              width: 16px;
              height: 16px;
              left: 0px;
              top: 0px;
              
              
              
              /* hospital */
              
              position: absolute;
              width: 16px;
              height: 16px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              
              
              /* Vector */
              
              position: absolute;
              left: 5.21%;
              right: 5.21%;
              top: 88.54%;
              bottom: 5.21%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 12.5%;
              right: 12.46%;
              top: 8.33%;
              bottom: 8.33%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Hospital */
              
              width: 47px;
              height: 18px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Frame 1000001036 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 6px;
              gap: 10px;
              
              position: absolute;
              width: 27px;
              height: 25.35px;
              left: 197px;
              top: 8px;
              
              background: rgba(31, 42, 55, 0.2);
              border-radius: 52px;
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              z-index: 2;
              
              
              /* Vector */
              
              box-sizing: border-box;
              
              width: 15px;
              height: 13.35px;
              
              /* white */
              border: 1px solid #FFFFFF;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Card 02 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              isolation: isolate;
              
              width: 232px;
              height: 252px;
              
              background: #FFFFFF;
              box-shadow: 3px 3px 2px rgba(0, 0, 0, 0.05), 1px 1px 2px rgba(0, 0, 0, 0.09), 0px 0px 1px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Image */
              
              width: 232px;
              height: 121px;
              
              background: url(1409.jpg);
              border-radius: 8px 8px 0px 0px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              z-index: 0;
              
              
              /* Content */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 8px 12px 12px;
              gap: 12px;
              
              width: 232px;
              height: 131px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              z-index: 1;
              
              
              /* Info */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              gap: 4px;
              
              width: 208px;
              height: 69px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Text */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0px;
              gap: 8px;
              
              width: 208px;
              height: 47px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Golden Cardiology Center */
              
              width: 208px;
              height: 21px;
              
              /* text-sm/font-bold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-size: 14px;
              line-height: 150%;
              /* identical to box height, or 21px */
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Frame 1000000930 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              width: 208px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Frame 1000000888 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              width: 14px;
              height: 14px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/linear/location */
              
              width: 14px;
              height: 14px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/linear/location */
              
              position: absolute;
              width: 14px;
              height: 14px;
              left: 0px;
              top: 0px;
              
              
              
              /* location */
              
              position: absolute;
              width: 14px;
              height: 14px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 37%;
              right: 37%;
              top: 29.96%;
              bottom: 44.04%;
              
              /* gray/500 */
              border: 1px solid #6B7280;
              
              
              /* Vector */
              
              position: absolute;
              left: 14.07%;
              right: 14.07%;
              top: 8.33%;
              bottom: 8.35%;
              
              /* gray/500 */
              border: 1px solid #6B7280;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              transform: rotate(-180deg);
              
              
              /* 555 Bridge Street, Golden Gate */
              
              width: 178px;
              height: 18px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Rating */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              width: 208px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Frame 1000000931 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              width: 81.34px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* 4.9 */
              
              width: 19px;
              height: 18px;
              
              /* text-xs/font-semibold */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 600;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Frame 1000000929 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: flex-end;
              padding: 0px;
              gap: 2px;
              
              width: 58.34px;
              height: 10px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 3;
              flex-grow: 0;
              
              
              /* Vector */
              
              width: 10.07px;
              height: 10px;
              
              background: #FEB052;
              
              /* Inside auto layout */
              flex: none;
              order: 4;
              flex-grow: 0;
              
              
              /* (108 Reviews) */
              
              width: 80px;
              height: 18px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Seperator */
              
              width: 208px;
              height: 0px;
              
              /* gray/200 */
              border: 1px solid #E5E7EB;
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Location */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              padding: 0px;
              gap: 36px;
              
              width: 208px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              align-self: stretch;
              flex-grow: 0;
              
              
              /* Frame 1000000936 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 98px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/bold/routing */
              
              width: 16px;
              height: 16px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/bold/routing */
              
              position: absolute;
              width: 16px;
              height: 16px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 8.21%;
              right: 62.6%;
              top: 8.34%;
              bottom: 58.34%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 62.38%;
              right: 8.29%;
              top: 58.34%;
              bottom: 8.34%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 27.37%;
              right: 27.37%;
              top: 17.71%;
              bottom: 17.71%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              transform: rotate(-180deg);
              
              
              /* 2.5 km/40min */
              
              width: 78px;
              height: 18px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/500 */
              color: #6B7280;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Frame 1000000935 */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0px;
              gap: 4px;
              
              margin: 0 auto;
              width: 51px;
              height: 18px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* vuesax/bold/hospital */
              
              width: 16px;
              height: 16px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/bold/hospital */
              
              position: absolute;
              width: 16px;
              height: 16px;
              left: 0px;
              top: 0px;
              
              
              
              /* hospital */
              
              position: absolute;
              width: 16px;
              height: 16px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              
              
              /* Vector */
              
              position: absolute;
              left: 5.21%;
              right: 5.21%;
              top: 88.54%;
              bottom: 5.21%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 12.5%;
              right: 12.46%;
              top: 8.33%;
              bottom: 8.33%;
              
              /* gray/400 */
              background: #9CA3AF;
              
              
              /* Clinic */
              
              width: 31px;
              height: 18px;
              
              /* text-xs/font-normal */
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 150%;
              /* identical to box height, or 18px */
              
              /* gray/600 */
              color: #4B5563;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* Frame 1000001036 */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 6px;
              gap: 10px;
              
              position: absolute;
              width: 27px;
              height: 25.35px;
              left: 197px;
              top: 8px;
              
              background: rgba(31, 42, 55, 0.2);
              border-radius: 52px;
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              z-index: 2;
              
              
              /* Vector */
              
              box-sizing: border-box;
              
              width: 15px;
              height: 13.35px;
              
              /* white */
              border: 1px solid #FFFFFF;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* Menu bar */
              
              /* Auto layout */
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              padding: 14px 48px;
              gap: 12px;
              
              position: absolute;
              width: 390px;
              height: 76px;
              left: 0px;
              top: 768px;
              
              background: #FFFFFF;
              box-shadow: inset 0px 1px 0px -7px #F7F7F7;
              
              
              /* Home */
              
              /* Auto layout */
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              padding: 12px;
              gap: 4px;
              
              margin: 0 auto;
              width: 48px;
              height: 48px;
              
              /* gray/100 */
              background: #F3F4F6;
              border-radius: 38px;
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/bold/home */
              
              margin: 0 auto;
              width: 24px;
              height: 24px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 0;
              flex-grow: 0;
              
              
              /* vuesax/bold/home */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* home */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 7.63%;
              right: 7.61%;
              top: 8.33%;
              bottom: 8.33%;
              
              /* gray/600 */
              background: #4B5563;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              transform: rotate(-180deg);
              
              
              /* Search by Location */
              
              margin: 0 auto;
              width: 24px;
              height: 24px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 1;
              flex-grow: 0;
              
              
              /* vuesax/linear/location */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* location */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 37%;
              right: 37%;
              top: 29.96%;
              bottom: 44.04%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 14.07%;
              right: 14.07%;
              top: 8.33%;
              bottom: 8.35%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              transform: rotate(-180deg);
              
              
              /* Appointment */
              
              margin: 0 auto;
              width: 24px;
              height: 24px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 2;
              flex-grow: 0;
              
              
              /* vuesax/linear/calendar */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* calendar */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 33.33%;
              right: 66.67%;
              top: 8.33%;
              bottom: 79.17%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 66.67%;
              right: 33.33%;
              top: 8.33%;
              bottom: 79.17%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 14.58%;
              right: 14.58%;
              top: 37.87%;
              bottom: 62.13%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 12.5%;
              right: 12.5%;
              top: 14.58%;
              bottom: 8.33%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              
              
              /* Vector */
              
              position: absolute;
              left: 63.33%;
              right: 32.51%;
              top: 55%;
              bottom: 40.83%;
              
              /* gray/400 */
              border: 2px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 63.33%;
              right: 32.51%;
              top: 67.5%;
              bottom: 28.33%;
              
              /* gray/400 */
              border: 2px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 47.92%;
              right: 47.92%;
              top: 55%;
              bottom: 40.83%;
              
              /* gray/400 */
              border: 2px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 47.92%;
              right: 47.92%;
              top: 67.5%;
              bottom: 28.33%;
              
              /* gray/400 */
              border: 2px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 32.5%;
              right: 63.34%;
              top: 55%;
              bottom: 40.83%;
              
              /* gray/400 */
              border: 2px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 32.5%;
              right: 63.34%;
              top: 67.5%;
              bottom: 28.33%;
              
              /* gray/400 */
              border: 2px solid #9CA3AF;
              
              
              /* Profile */
              
              margin: 0 auto;
              width: 24px;
              height: 24px;
              
              
              /* Inside auto layout */
              flex: none;
              order: 3;
              flex-grow: 0;
              
              
              /* vuesax/linear/profile */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* profile */
              
              position: absolute;
              width: 24px;
              height: 24px;
              left: 0px;
              top: 0px;
              
              
              
              /* Vector */
              
              position: absolute;
              left: 31.5%;
              right: 31.5%;
              top: 8.33%;
              bottom: 54.71%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 22.27%;
              right: 20.89%;
              top: 54.95%;
              bottom: 9.13%;
              
              /* gray/400 */
              border: 1.5px solid #9CA3AF;
              
              
              /* Vector */
              
              position: absolute;
              left: 0%;
              right: 0%;
              top: 0%;
              bottom: 0%;
              
              opacity: 0;
              transform: rotate(-180deg);
              
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
