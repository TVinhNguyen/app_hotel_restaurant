import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thêm import này
import { COLORS, SIZES, API_CONFIG, STORAGE_KEYS } from '../constants'; // Thêm STORAGE_KEYS
import { apiService } from '../services/apiService';
import { guestService } from '../services/guestService';

const normalizeVietnamPhone = (phone: string) => {
    let cleaned = phone.replace(/[^0-9+]/g, '');

    if (cleaned.startsWith('+84')) {
        return cleaned;
    }

    if (cleaned.startsWith('0')) {
        return '+84' + cleaned.substring(1);
    }

    return '+84' + cleaned;
};

const isValidVietnamPhone = (phone: string) => {
    const regex = /^\+84\d{9,10}$/;
    return regex.test(phone);
};

const getRegisterErrorMessageVi = (error: any) => {
    // ❌ Lỗi mạng
    if (!error?.response) {
        return 'Không có kết nối mạng. Vui lòng kiểm tra Internet.';
    }

    const { status, data } = error.response;

    // ✅ Backend trả message là ARRAY (422, 400)
    if (Array.isArray(data?.message)) {
        const messages = data.message.join(' ').toLowerCase();

        if (messages.includes('password')) {
            return 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số.';
        }

        if (messages.includes('email')) {
            return 'Email không hợp lệ.';
        }

        if (messages.includes('phone')) {
            return 'Số điện thoại không hợp lệ.';
        }

        return data.message.join('\n');
    }

    const message = data?.message?.toString().toLowerCase() || '';

    // ❌ 409 – đã tồn tại
    if (status === 409) {
        if (message.includes('email')) {
            return 'Email đã được sử dụng.';
        }
        if (message.includes('phone')) {
            return 'Số điện thoại đã được sử dụng.';
        }
        return 'Tài khoản đã tồn tại.';
    }

    // ❌ 422 – validate
    if (status === 422) {
        return 'Thông tin đăng ký không hợp lệ.';
    }

    // ❌ 500+
    if (status >= 500) {
        return 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
    }

    return 'Đăng ký thất bại. Vui lòng thử lại.';
};



const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !phone || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }


        const normalizedPhone = normalizeVietnamPhone(phone);

        if (!isValidVietnamPhone(normalizedPhone)) {
            Alert.alert(
                'Số điện thoại không hợp lệ.',
                'Vui lòng nhập số điện thoại Việt Nam hợp lệ.'
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Mật khẩu không khớp');
            return;
        }

        setIsLoading(true);
        try {
            // Step 1: Register user account
            const payload = {
                email,
                password,
                name,
                phone : normalizedPhone,
            };

            const registerResponse: any = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload);
           

            // Step 1.5: Handle Authentication (Auto Login)
            // Kiểm tra xem API đăng ký có trả về token không, nếu không thì tự gọi API login
            let token = registerResponse?.access_token || registerResponse?.token;

            if (!token) {
                console.log('Step 1.5: No token in register response, attempting auto-login...');
                try {
                    const loginResponse: any = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                        email,
                        password
                    });
                    token = loginResponse?.access_token || loginResponse?.token;
                    console.log('Auto-login successful, token retrieved.');
                } catch (loginError) {
                    // Nếu login thất bại, dừng lại và báo user đăng nhập thủ công
                    throw new Error('Đăng ký thành công. Vui lòng đăng nhập.');
                }
            }

            if (token) {
                await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
                console.log('Token saved to storage');
            } else {
                console.warn('No token retrieved, guest creation might fail.');
            }

            // Step 2: Automatically create guest profile for this user
            try {
                console.log('Step 2: Creating guest profile for:', email);
                const guestData = {
                    name: name,
                    email: email,
                    phone: normalizedPhone,
                };
                
                const guest = await guestService.createGuest(guestData);
                console.log('✅ Guest profile created:', guest.data?.id);
                
                Alert.alert(
                    'Đăng ký thành công',
                    'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.',
                    [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                );
            } catch (guestError: any) {
                console.error('Guest creation error:', guestError);
                // Even if guest creation fails, still login the user
                Alert.alert(
                    'Đăng ký thành công',
                    'Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.',
                    [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                );
            }
        } catch (error: any) {
            console.error(
                'Registration error:',
                error?.response?.status,
                error?.response?.data
            );

            const message = getRegisterErrorMessageVi(error);

            Alert.alert('Đăng ký thất bại', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* ... giữ nguyên phần UI ... */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Xin Chào Bạn</Text>
                        <Text style={styles.subtitle}>Đăng ký để bắt đầu</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Họ và tên"
                                placeholderTextColor={COLORS.text.hint}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={COLORS.text.hint}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Số điện thoại"
                                placeholderTextColor={COLORS.text.hint}
                                value={phone}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^0-9]/g, '');
                                    setPhone(cleaned);
                                }}
                                keyboardType="phone-pad"
                            />

                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mật Khẩu"
                                placeholderTextColor={COLORS.text.hint}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>

                        {isPasswordFocused && (
                            <Text style={styles.passwordHint}>
                                Mật khẩu phải chứa ít nhất 1 kí tự viết thường, 1 kí tự viết hoa và 1 số.
                                Chiều dài tối thiểu của mật khẩu là 6 kí tự.
                            </Text>
                        )}



                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Xác Nhận Mật Khẩu"
                                placeholderTextColor={COLORS.text.hint}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.surface} />
                            ) : (
                                <Text style={styles.registerButtonText}>Đăng Ký</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginText}>Đăng Nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.spacing.xl,
    },
    backButton: {
        position: 'absolute',
        top: SIZES.spacing.xl,
        left: SIZES.spacing.xl,
        zIndex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: SIZES.spacing.xxl,
        marginTop: SIZES.spacing.xxl,
    },
    title: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SIZES.spacing.xs,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.text.secondary,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius.lg,
        paddingHorizontal: SIZES.spacing.md,
        paddingVertical: Platform.OS === 'ios' ? SIZES.spacing.md : SIZES.spacing.sm,
        marginBottom: SIZES.spacing.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputIcon: {
        marginRight: SIZES.spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: SIZES.md,
        color: COLORS.text.primary,
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius.lg,
        paddingVertical: SIZES.spacing.md,
        alignItems: 'center',
        marginTop: SIZES.spacing.md,
        marginBottom: SIZES.spacing.xl,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: COLORS.surface,
        fontSize: SIZES.lg,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.text.secondary,
        fontSize: SIZES.md,
    },
    loginText: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        fontWeight: 'bold',
    },
    passwordHint: {
    fontSize: SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: -SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
    paddingLeft: SIZES.spacing.md,
    lineHeight: 18,
    },
});

export default RegisterScreen;