import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
    const navigation = useNavigation<any>();

    const handleGetStarted = () => {
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=1200&fit=crop' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    <View style={styles.contentContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>LuxStay</Text>
                            <Text style={styles.subtitle}>Experience Luxury & Comfort</Text>
                        </View>

                        <View style={styles.bottomContainer}>
                            <Text style={styles.description}>
                                Discover the best hotels and restaurants around you. Book your stay and enjoy delicious meals with ease.
                            </Text>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleGetStarted}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>Get Started</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for text readability
        justifyContent: 'flex-end',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        padding: SIZES.spacing.xl,
        paddingTop: SIZES.spacing.xxl * 2,
        paddingBottom: SIZES.spacing.xxl,
    },
    headerContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.surface,
        letterSpacing: 1,
        marginBottom: SIZES.spacing.sm,
    },
    subtitle: {
        fontSize: SIZES.lg,
        color: COLORS.surface,
        opacity: 0.9,
        letterSpacing: 0.5,
    },
    bottomContainer: {
        width: '100%',
    },
    description: {
        fontSize: SIZES.md,
        color: COLORS.surface,
        textAlign: 'center',
        marginBottom: SIZES.spacing.xl,
        opacity: 0.8,
        lineHeight: 24,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.spacing.md,
        borderRadius: SIZES.radius.xl,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonText: {
        color: COLORS.surface,
        fontSize: SIZES.lg,
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
