import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { 
  View, 
  ScrollView, 
  Dimensions, 
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  Text,
  Image,
  StatusBar
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingContainerProps = {
  onSkip?: () => void;
  onComplete?: () => void;
};

type OnboardingScreenContentProps = {
  imageSource: number;
  title: string;
  description: string;
  buttonText: string;
  onNext?: () => void;
  isLastScreen?: boolean;
};

// Type guard functions để đảm bảo type safety
function isFunction(fn: unknown): fn is (() => void) {
  return typeof fn === 'function';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// OnboardingScreenContent component
function OnboardingScreenContent({ 
  imageSource, 
  title, 
  description, 
  buttonText, 
  onNext,
  isLastScreen = false
}: OnboardingScreenContentProps): ReactElement {
  return (
    <View style={styles.screenContent}>
              {/* Hero Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image 
              source={imageSource}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.nextButton,
              isLastScreen && styles.lastScreenButton
            ]}
            onPress={() => {
              if (isFunction(onNext)) {
                onNext();
              }
            }}
            accessible
            accessibilityLabel={buttonText}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function OnboardingContainer({ onSkip, onComplete }: OnboardingContainerProps): ReactElement {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollX = useSharedValue(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const offsetX = event.nativeEvent.contentOffset.x;
    if (isNumber(offsetX)) {
      scrollX.value = offsetX;
      const newIndex = Math.round(offsetX / SCREEN_WIDTH);
      setCurrentIndex(newIndex);
    }
  };

  const goToNext = (): void => {
    if (currentIndex < 2) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else if (isFunction(onComplete)) {
      onComplete();
    }
  };

  const handleSkip = (): void => {
    if (isFunction(onSkip)) {
      onSkip();
    }
  };

  // Animated style cho carousel indicators
  const getCarouselStyle = (index: number) => useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 30, 8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );

    return {
      width: width,
      backgroundColor: width > 15 ? '#26232F' : '#9B9B9B',
      opacity: opacity,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        decelerationRate="fast"
      >
        {/* Onboarding Screen 1 */}
        <View style={styles.screenContainer}>
          <OnboardingScreenContent
            imageSource={require('../../assets/behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_cabe61f6-0a23-4afa-ace2-90d69e11914f.jpg')}
            title="Chào mừng đến với HealthPal"
            description="Đặt lịch khám bệnh dễ dàng với các bác sĩ uy tín. Quản lý sức khỏe của bạn một cách thông minh và tiện lợi."
            buttonText="Tiếp tục"
            onNext={goToNext}
          />
        </View>

        {/* Onboarding Screen 2 */}
        <View style={styles.screenContainer}>
          <OnboardingScreenContent
            imageSource={require('../../assets/behnazsabaa_Smiling_Medical_Doctor__Style_of_Her_Film_with_Soft_0e7d0aac-3a9a-442d-a536-7af3e937c1a6.jpg')}
            title="Đặt lịch dễ dàng"
            description="Chọn thời gian phù hợp, đặt lịch nhanh chóng với các bác sĩ chuyên khoa hàng đầu. Quản lý lịch hẹn một cách thông minh."
            buttonText="Tiếp tục"
            onNext={goToNext}
          />
        </View>

        {/* Onboarding Screen 3 */}
        <View style={styles.screenContainer}>
          <OnboardingScreenContent
            imageSource={require('../../assets/behnazsabaa_Portrait_of_Smiling_Medical_Doctor_male_and_feamale_0a652aa2-f315-4b9e-a050-ab46c6c89db6.jpg')}
            title="Đội ngũ bác sĩ chuyên nghiệp"
            description="Tham khảo ý kiến từ các bác sĩ giàu kinh nghiệm. Nhận tư vấn sức khỏe chất lượng cao mọi lúc, mọi nơi."
            buttonText="Bắt đầu"
            onNext={goToNext}
            isLastScreen={true}
          />
        </View>
      </ScrollView>

      {/* Global Skip & Carousel Section */}
      <View style={styles.bottomContainer}>
        {/* Carousel Indicators */}
        <View style={styles.carousel}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.carouselDot,
                getCarouselStyle(index),
              ]}
            />
          ))}
        </View>

        {/* Skip Button */}
        <TouchableOpacity 
          onPress={handleSkip}
          accessible
          accessibilityLabel="Bỏ qua"
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  screenContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    overflow: 'hidden', // Ngăn ảnh overflow sang screen khác
  },
  
  // Screen Content
  screenContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 120, // Tăng padding để tạo khoảng cách rõ ràng với carousel
    paddingHorizontal: 0,
  },
  
  // Image Section
  imageContainer: {
    width: '100%',
    flex: 1,
    maxHeight: 520, // Giảm maxHeight một chút để tối ưu space
    marginBottom: 8, // Thêm margin bottom nhỏ
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Đảm bảo ảnh không overflow
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },

  // Content Section  
  contentSection: {
    width: '100%',
    maxWidth: 311,
    alignItems: 'center',
    gap: 20, // Giảm gap để content gần nhau hơn
    paddingHorizontal: 24,
    marginTop: 10, // Đẩy content section xuống một chút
  },
  textContainer: {
    alignItems: 'center',
    gap: 6, // Giảm gap giữa title và description
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
    gap: 12, // Giảm gap
    marginTop: 8, // Thêm margin top nhỏ
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
    borderRadius: 63,
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
  lastScreenButton: {
    borderRadius: 78, // Border radius cho màn hình cuối theo thiết kế
  },
  
  // Global Bottom Section
  bottomContainer: {
    position: 'absolute',
    bottom: 40, // Di chuyển xuống xa hơn nữa để tách biệt hoàn toàn
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 14, // Giảm gap nhỏ hơn
    zIndex: 10,
    // Loại bỏ backgroundColor để không đè lên nút
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Chỉ carousel có nền nhẹ
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  carouselDot: {
    height: 8,
    backgroundColor: '#9B9B9B',
    borderRadius: 40,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
