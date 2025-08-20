import React, { useState, useRef, useEffect } from 'react';
import type { ReactElement } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HealthPalLogo } from '../components';
import { verifyOtp, resendOtp } from '../services/auth.service';

type VerifyEmailScreenProps = {
    onVerifySuccess?: () => void;
    onResendCode?: () => void;
    onBack?: () => void;
    email?: string;
};

// Type guard functions để đảm bảo type safety
function isFunction(fn: unknown): fn is (() => void) {
    return typeof fn === 'function';
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export default function VerifyEmailScreen({
    onVerifySuccess,
    onResendCode,
    onBack,
    email = "example@email.com"
}: VerifyEmailScreenProps): ReactElement {
    const [code, setCode] = useState<string[]>(['', '', '', '', '']);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Focus vào input đầu tiên khi component mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleCodeChange = (text: string, index: number): void => {
        if (!isString(text)) return;

        // Chỉ cho phép số
        const numericText = text.replace(/[^0-9]/g, '');

        if (numericText.length <= 1) {
            const newCode = [...code];
            newCode[index] = numericText;
            setCode(newCode);

            // Tự động chuyển sang ô tiếp theo
            if (numericText && index < 4) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (key: string, index: number): void => {
        // Xử lý phím Backspace
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (): Promise<void> => {
        const verificationCode = code.join('');

        if (verificationCode.length !== 5) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã xác thực');
            return;
        }

        if (!email) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔢 Verifying OTP for email:', email);
            const result = await verifyOtp(email, verificationCode);

            if (result.success) {
                console.log('✅ OTP verification successful:', result.data);
                Alert.alert(
                    'Xác thực thành công!',
                    'Tài khoản của bạn đã được xác thực thành công.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                if (isFunction(onVerifySuccess)) {
                                    onVerifySuccess();
                                }
                            }
                        }
                    ]
                );
            } else {
                console.log('❌ OTP verification failed:', result.error);
                let errorMessage = 'Mã xác thực không đúng. Vui lòng thử lại.';

                if (result.error?.message?.includes('Invalid OTP')) {
                    errorMessage = 'Mã xác thực không đúng. Vui lòng kiểm tra lại.';
                } else if (result.error?.message?.includes('OTP expired')) {
                    errorMessage = 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.';
                } else if (result.error?.message?.includes('User not found')) {
                    errorMessage = 'Không tìm thấy tài khoản. Vui lòng đăng ký lại.';
                } else if (result.error?.code === 'NETWORK_ERROR') {
                    errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
                } else if (result.error?.message) {
                    errorMessage = result.error.message;
                }

                Alert.alert('Lỗi xác thực', errorMessage);
            }
        } catch (error: any) {
            console.error('❌ Unexpected OTP verification error:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async (): Promise<void> => {
        if (!email) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        setIsLoading(true);

        try {
            console.log('📧 Resending OTP for email:', email);
            const result = await resendOtp(email);

            if (result.success) {
                console.log('✅ OTP resent successfully:', result.data);

                // Reset code inputs
                setCode(['', '', '', '', '']);
                inputRefs.current[0]?.focus();

                Alert.alert(
                    'Thành công',
                    'Mã xác thực mới đã được gửi đến email của bạn. Vui lòng kiểm tra email.'
                );

                // Call parent callback if provided
                if (isFunction(onResendCode)) {
                    onResendCode();
                }
            } else {
                console.log('❌ Resend OTP failed:', result.error);
                let errorMessage = 'Không thể gửi lại mã xác thực. Vui lòng thử lại.';

                if (result.error?.message?.includes('User not found')) {
                    errorMessage = 'Không tìm thấy tài khoản. Vui lòng đăng ký lại.';
                } else if (result.error?.message?.includes('Too many requests')) {
                    errorMessage = 'Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi một chút.';
                } else if (result.error?.code === 'NETWORK_ERROR') {
                    errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
                } else if (result.error?.message) {
                    errorMessage = result.error.message;
                }

                Alert.alert('Lỗi', errorMessage);
            }
        } catch (error: any) {
            console.error('❌ Unexpected resend OTP error:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = (): void => {
        if (isFunction(onBack)) {
            onBack();
        } else {
            console.log('Back button pressed but no onBack prop provided');
        }
    };

    const isCodeComplete = code.every(digit => digit !== '');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                accessible
                accessibilityLabel="Quay lại"
                activeOpacity={0.7}
            >
                <MaterialIcons name="arrow-back" size={24} color="#292D32" />
            </TouchableOpacity>

            {/* Logo Section */}
            <View style={styles.logoSection}>
                <HealthPalLogo size={66} showText={true} />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {/* Title and Description */}
                <View style={styles.textSection}>
                    <Text style={styles.title}>Xác thực Email</Text>
                    <Text style={styles.description}>
                        Chúng tôi đã gửi mã xác thực đến{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>
                </View>

                {/* Code Input */}
                <View style={styles.codeInputContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                inputRefs.current[index] = ref;
                            }}
                            style={[
                                styles.codeInput,
                                digit ? styles.codeInputFilled : null
                            ]}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            textAlign="center"
                            selectTextOnFocus
                            accessible
                            accessibilityLabel={`Ô nhập mã thứ ${index + 1}`}
                        />
                    ))}
                </View>

                {/* Button and Helper Text */}
                <View style={styles.buttonSection}>
                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[
                            styles.verifyButton,
                            (!isCodeComplete || isLoading) && styles.verifyButtonDisabled
                        ]}
                        onPress={handleVerify}
                        disabled={!isCodeComplete || isLoading}
                        accessible
                        accessibilityLabel="Xác thực"
                    >
                        <Text style={[
                            styles.verifyButtonText,
                            (!isCodeComplete || isLoading) && styles.verifyButtonTextDisabled
                        ]}>
                            {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                        </Text>
                    </TouchableOpacity>

                    {/* Resend Code */}
                    <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
                        <Text style={[styles.resendText, isLoading && styles.resendTextDisabled]}>
                            Không nhận được mã? <Text style={styles.resendLink}>Gửi lại</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // Back Button
    backButton: {
        position: 'absolute',
        top: 10,
        left: 24,
        zIndex: 10,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Logo Section
    logoSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingBottom: 32,
        width: '100%',
    },

    // Content Container
    contentContainer: {
        paddingHorizontal: 24,
        gap: 32,
        flex: 1,
    },

    // Text Section
    textSection: {
        alignItems: 'center',
        gap: 8,
        width: '100%',
    },
    title: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 20,
        lineHeight: 30,
        color: '#1C2A3A',
        textAlign: 'center',
    },
    description: {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 21,
        color: '#6B7280',
        textAlign: 'center',
    },
    emailText: {
        fontWeight: '600',
        color: '#1C2A3A',
    },

    // Code Input
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        width: '100%',
    },
    codeInput: {
        width: 56,
        height: 56,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '600',
        color: '#1C2A3A',
        textAlign: 'center',
    },
    codeInputFilled: {
        backgroundColor: '#FFFFFF',
        borderColor: '#1C64F2',
        borderWidth: 2,
    },

    // Button Section
    buttonSection: {
        gap: 24,
        width: '100%',
    },
    verifyButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#1C2A3A',
        borderRadius: 42,
        height: 48,
        width: '100%',
    },
    verifyButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    verifyButtonText: {
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
        color: '#FFFFFF',
    },
    verifyButtonTextDisabled: {
        color: '#FFFFFF',
        opacity: 0.7,
    },

    // Resend Text
    resendText: {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 21,
        color: '#6B7280',
        textAlign: 'center',
        width: '100%',
    },
    resendTextDisabled: {
        opacity: 0.5,
    },
    resendLink: {
        fontWeight: '600',
        color: '#1C64F2',
    },
});