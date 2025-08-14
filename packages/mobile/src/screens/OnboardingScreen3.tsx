import React from 'react';
import type { ReactElement } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';

type OnboardingScreen3Props = {
  onSkip?: () => void;
  onNext?: () => void;
  hideCarousel?: boolean;
};

// Type guard functions để đảm bảo type safety
function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

export default function OnboardingScreen3({ onSkip, onNext, hideCarousel = false }: OnboardingScreen3Props): ReactElement {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor_male_and_feamale_0a652aa2-f315-4b9e-a050-ab46c6c89db6.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Đội ngũ bác sĩ chuyên nghiệp</Text>
            <Text style={styles.description}>
              Tham khảo ý kiến từ các bác sĩ giàu kinh nghiệm. 
              Nhận tư vấn sức khỏe chất lượng cao mọi lúc, mọi nơi.
            </Text>
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={() => {
                if (isFunction(onNext)) {
                  onNext();
                }
              }}
              accessible
              accessibilityLabel="Bắt đầu"
            >
              <Text style={styles.buttonText}>Bắt đầu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Skip & Carousel Section */}
        {!hideCarousel && (
          <View style={styles.bottomSection}>
            {/* Carousel Indicators - Dot thứ 3 active */}
            <View style={styles.carousel}>
              <View style={styles.carouselDot} />
              <View style={styles.carouselDot} />
              <View style={[styles.carouselDot, styles.carouselActive]} />
            </View>

            {/* Skip Button */}
            <TouchableOpacity 
              onPress={() => {
                if (isFunction(onSkip)) {
                  onSkip();
                }
              }}
              accessible
              accessibilityLabel="Bỏ qua"
            >
              <Text style={styles.skipText}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  
  // Image Section
  imageContainer: {
    width: '100%',
    flex: 1,
    maxHeight: 532,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '110%', // Tăng width để có thể crop và căn giữa
    height: '100%',
    borderRadius: 0, // Để full width như thiết kế
    transform: [{ translateX: -20 }], // Dịch chuyển sang trái để căn giữa người
  },

  // Content Section  
  contentSection: {
    width: '100%',
    maxWidth: 311,
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    color: '#374151',
    width: '100%',
  },
  description: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#6B7280',
    width: '100%',
  },

  // Button Section
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1C2A3A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 78, // Cập nhật theo thiết kế mới (78px)
    width: '100%',
    height: 48,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },

  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    gap: 24,
    width: 58,
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    width: 58,
    height: 8,
  },
  carouselDot: {
    width: 8,
    height: 8,
    backgroundColor: '#9B9B9B',
    borderRadius: 40,
  },
  carouselActive: {
    width: 30,
    backgroundColor: '#26232F',
  },
  skipText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#6B7280',
  },
});
