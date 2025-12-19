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

    const handleRegister = async () => {
        if (!name || !email || !phone || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            // Step 1: Register user account
            const payload = {
                email,
                password,
                name,
                phone,
            };

            console.log('Step 1: Registering user with payload:', payload);
            const registerResponse: any = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload);
            console.log('Registration response:', registerResponse);

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
                    console.error('Auto-login failed:', loginError);
                    // Nếu login thất bại, dừng lại và báo user đăng nhập thủ công
                    throw new Error('Registration successful, but could not log in automatically. Please log in manually.');
                }
            }

            // Clear any existing data first
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
            
            if (token) {
                await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
                console.log('Token saved to storage');
            } else {
                console.warn('No token retrieved, guest creation might fail.');
            }
            
            // Save user data immediately
            const userData = registerResponse?.user || { email, name, phone };
            console.log('💾 [Register] Saving user data:', userData);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

            // Step 2: Automatically create guest profile for this user
            try {
                console.log('Step 2: Creating guest profile for:', email);
                const guestData = {
                    name: name,
                    email: email,
                    phone: phone,
                };
                
                const guest = await guestService.createGuest(guestData);
                console.log('✅ Guest profile created:', guest.data?.id);
                
                // Auto navigate to main app instead of login
                Alert.alert(
                    'Success', 
                    'Registration successful! Welcome to the app.',
                    [{ text: 'OK', onPress: () => navigation.replace('MainTabs') }]
                );
            } catch (guestError: any) {
                console.error('Guest creation error:', guestError);
                // Even if guest creation fails, still login the user
                Alert.alert(
                    'Account Created',
                    'Your account was created successfully. You can now use the app.',
                    [{ text: 'OK', onPress: () => navigation.replace('MainTabs') }]
                );
            }
        } catch (error: any) {
            console.error('Registration error details:', JSON.stringify(error.response?.data, null, 2));
            const message = error.message || error.response?.data?.message || 'Registration failed. Please try again.';
            Alert.alert('Error', message);
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor={COLORS.text.hint}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
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
                                placeholder="Phone Number"
                                placeholderTextColor={COLORS.text.hint}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={COLORS.text.hint}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
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
                                <Text style={styles.registerButtonText}>Register</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginText}>Login</Text>
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
});

export default RegisterScreen;