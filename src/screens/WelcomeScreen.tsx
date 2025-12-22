import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    FlatList,
    ViewToken,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        title: 'LuxStay',
        subtitle: 'Chào mừng bạn đến với LuxStay',
        description: 'Khám phá và đặt phòng khách sạn cao cấp, nhà hàng sang trọng chỉ với vài thao tác đơn giản.',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=1200&fit=crop',
        icon: 'home',
    },
    {
        id: '2',
        title: 'Đặt phòng dễ dàng',
        subtitle: 'Tìm kiếm & đặt phòng nhanh chóng',
        description: 'Cung cấp nhiều dịch vụ khách sạn đẳng cấp với đầy đủ tiện nghi, giá cả cạnh tranh và dịch vụ chu đáo.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=1200&fit=crop',
        icon: 'bed',
    },
    {
        id: '3',
        title: 'Nhà hàng cao cấp',
        subtitle: 'Trải nghiệm ẩm thực đỉnh cao',
        description: 'Chúng tôi cũng cấp các dịch vụ nhà hàng nổi tiếng, sang trọng, thưởng thức những món ăn ngon hàng đầu.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200&fit=crop',
        icon: 'restaurant',
    },
    {
        id: '4',
        title: 'Thanh toán an toàn',
        subtitle: 'Thanh toán tiện lợi & bảo mật',
        description: '',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=1200&fit=crop',
        icon: 'card',
    },
];

const WelcomeScreen = () => {
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleGetStarted = () => {
        navigation.replace('Login');
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            handleGetStarted();
        }
    };

    const handleSkip = () => {
        navigation.replace('MainTabs');
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={styles.slideContainer}>
            <ImageBackground
                source={{ uri: item.image }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    <View style={styles.contentContainer}>
                        <View style={styles.headerContainer}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon} size={60} color={COLORS.surface} />
                            </View>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                        </View>

                        <View style={styles.bottomContainer}>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Skip Button */}
            {currentIndex < slides.length - 1 && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Bỏ qua</Text>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentIndex && styles.paginationDotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Next/Get Started Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === slides.length - 1 ? 'Đăng nhập' : 'Tiếp theo'}
                    </Text>
                    <Ionicons 
                        name={currentIndex === slides.length - 1 ? 'log-in' : 'arrow-forward'} 
                        size={20} 
                        color={COLORS.surface} 
                        style={{ marginLeft: 8 }}
                    />
                </TouchableOpacity>

                {/* Browse as Guest Button */}
                {currentIndex === slides.length - 1 && (
                    <TouchableOpacity
                        style={styles.guestButton}
                        onPress={() => navigation.replace('MainTabs')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.guestButtonText}>
                            Khám phá ngay (Không cần đăng nhập)
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slideContainer: {
        width: width,
        height: height,
    },
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'space-between',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 80,
        paddingBottom: 120,
        paddingHorizontal: SIZES.spacing.xl,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.spacing.lg,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.surface,
        textAlign: 'center',
        marginBottom: SIZES.spacing.sm,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: SIZES.lg,
        color: COLORS.surface,
        textAlign: 'center',
        opacity: 0.95,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    bottomContainer: {
        alignItems: 'center',
    },
    description: {
        fontSize: SIZES.md,
        color: COLORS.surface,
        textAlign: 'center',
        marginBottom: SIZES.spacing.xl,
        lineHeight: 26,
        paddingHorizontal: SIZES.spacing.md,
        opacity: 0.95,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 20,
    },
    skipText: {
        color: COLORS.surface,
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        paddingHorizontal: SIZES.spacing.xl,
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        marginBottom: SIZES.spacing.lg,
        gap: 10,
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    paginationDotActive: {
        backgroundColor: COLORS.surface,
        width: 28,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        paddingHorizontal: 50,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        width: '100%',
    },
    buttonText: {
        color: COLORS.surface,
        fontSize: SIZES.lg,
        fontWeight: 'bold',
    },
    guestButton: {
        marginTop: SIZES.spacing.md,
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        borderColor: COLORS.surface,
        width: '100%',
        alignItems: 'center',
    },
    guestButtonText: {
        color: COLORS.surface,
        fontSize: SIZES.md,
        fontWeight: '600',
    },
});

export default WelcomeScreen;
