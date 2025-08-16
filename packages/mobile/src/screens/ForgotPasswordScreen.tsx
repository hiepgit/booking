import React, { useState } from 'react';
import type { ReactElement } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HealthPalLogo, EmailIcon } from '../components';

type ForgotPasswordScreenProps = {
    onSendSuccess?: (email: string) => void;
    onBack?: () => void;
};

// Type guard functions để đảm bảo type safety
function isFunction(fn: unknown): fn is (() => void) {
    return typeof fn === 'function';
}

function isFunctionWithEmail(fn: unknown): fn is ((email: string) => void) {
    return typeof fn === 'function';
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

// Email validation function
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export default function ForgotPasswordScreen({
    onSendSuccess,
    onBack
}: ForgotPasswordScreenProps): ReactElement {
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleEmailChange = (text: string): void => {
        if (isString(text)) {
            setEmail(text);
        }
    };

    const handleSendResetLink = async (): Promise<void> => {
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email');
            return;
        }

        if (!isValidEmail(email.trim())) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Reset password link sent to:', email);

            Alert.alert(
                'Thành công',
                `Chúng tôi đã gửi liên kết đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra email của bạn.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (isFunctionWithEmail(onSendSuccess)) {
                                onSendSuccess(email);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
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

    const isEmailValid = email.trim() && isValidEmail(email.trim());

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
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
                        <Text style={styles.title}>Quên mật khẩu</Text>
                        <Text style={styles.description}>
                            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
                        </Text>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputField}>
                        <View style={styles.inputContainer}>
                            <EmailIcon size={18} color="#9CA3AF" />
                            <TextInput
                                style={styles.input}
                                placeholder="Email của bạn"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={handleEmailChange}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                selectionColor="#1C64F2"
                                underlineColorAndroid="transparent"
                                editable={!isLoading}
                                accessible
                                accessibilityLabel="Nhập địa chỉ email"
                            />
                        </View>
                    </View>

                    {/* Send Button */}
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!isEmailValid || isLoading) && styles.sendButtonDisabled
                        ]}
                        onPress={handleSendResetLink}
                        disabled={!isEmailValid || isLoading}
                        accessible
                        accessibilityLabel="Gửi liên kết đặt lại mật khẩu"
                    >
                        <Text style={[
                            styles.sendButtonText,
                            (!isEmailValid || isLoading) && styles.sendButtonTextDisabled
                        ]}>
                            {isLoading ? 'Đang gửi...' : 'Gửi liên kết'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardContainer: {
        flex: 1,
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
        width: '100%',
    },

    // Input Field
    inputField: {
        gap: 8,
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        minHeight: 48,
    },
    input: {
        flex: 1,
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 21,
        color: '#1C2A3A',
        paddingVertical: 0,
        includeFontPadding: false,
    },

    // Send Button
    sendButton: {
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
    sendButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    sendButtonText: {
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
        color: '#FFFFFF',
    },
    sendButtonTextDisabled: {
        color: '#FFFFFF',
        opacity: 0.7,
    },
});