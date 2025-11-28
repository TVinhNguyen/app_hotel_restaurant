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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, API_CONFIG, STORAGE_KEYS } from '../constants';
import { apiService } from '../services/apiService';

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                email,
                password,
            };

            console.log('Logging in with:', payload);
            const response: any = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, payload);
            console.log('Login response:', response);

            if (response.access_token) {
                await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, response.access_token);
                if (response.user) {
                    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
                }
                navigation.replace('MainTabs');
            } else {
                // Fallback if token is not directly in response root, adjust based on actual API response structure
                // For now assuming response IS the data object as per apiService interceptor
                Alert.alert('Error', 'Login failed: No token received');
            }

        } catch (error: any) {
            console.error('Login error details:', JSON.stringify(error.response?.data, null, 2));
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="bed" size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    <View style={styles.form}>
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

                        <TouchableOpacity 
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.surface} />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.signupText}>Sign Up</Text>
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
    header: {
        alignItems: 'center',
        marginBottom: SIZES.spacing.xxl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.spacing.lg,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SIZES.spacing.lg,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: SIZES.sm,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius.lg,
        paddingVertical: SIZES.spacing.md,
        alignItems: 'center',
        marginBottom: SIZES.spacing.xl,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
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
    signupText: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
