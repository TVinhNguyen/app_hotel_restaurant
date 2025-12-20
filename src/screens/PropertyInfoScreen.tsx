import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { propertyService } from '../services/propertyService';
import type { RootStackParamList, Property } from '../types';

type PropertyInfoNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const PropertyInfoScreen = () => {
    const navigation = useNavigation<PropertyInfoNavigationProp>();
    const route = useRoute();
    const { propertyId } = route.params as { propertyId: string };

    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState<Property | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPropertyData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('=== Fetching property details ===');
                console.log('Property ID:', propertyId);

                const response = await propertyService.getPropertyDetails(propertyId);
                console.log('Raw API Response:', JSON.stringify(response, null, 2));

                // Handle different response formats
                let propertyData = null;

                if (response) {
                    // Check if response has success wrapper
                    if (typeof response === 'object' && 'success' in response) {
                        if (response.success && response.data) {
                            propertyData = response.data;
                        } else {
                            setError(response.message || 'Failed to load property');
                            return;
                        }
                    }
                    // Response is the data itself
                    else if ('id' in response && 'name' in response) {
                        propertyData = response;
                    }
                }

                if (propertyData) {
                    console.log('Property data loaded:', propertyData.name);
                    setProperty(propertyData as Property);
                } else {
                    console.error('No valid property data found');
                    setError('Property not found');
                }
            } catch (err: any) {
                console.error('Error fetching property:', err);
                console.error('Error response:', err.response?.data);
                setError(err.message || 'Failed to load property');
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyData();
    }, [propertyId]);

    const handleBookNow = () => {
        if (!property) return;

        navigation.navigate('BookingRequest', {
            hotelId: property.id,
            hotelName: property.name,
            price: 120, // Placeholder
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading property...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !property) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
                    <Text style={styles.errorText}>{error || 'Property not found'}</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Property Details</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="heart-outline" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Property Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop' }}
                        style={styles.propertyImage}
                    />
                </View>

                {/* Property Info */}
                <View style={styles.infoSection}>
                    {/* Name & Type */}
                    <Text style={styles.propertyName}>{property.name}</Text>
                    <View style={styles.typeContainer}>
                        <Ionicons name="business" size={16} color={COLORS.primary} />
                        <Text style={styles.propertyType}>{property.propertyType}</Text>
                    </View>

                    {/* Location */}
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={18} color={COLORS.primary} />
                        <Text style={styles.locationText}>
                            {property.address}, {property.city}, {property.country}
                        </Text>
                    </View>

                    {/* Contact Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>

                        <View style={styles.contactRow}>
                            <Ionicons name="call" size={20} color={COLORS.primary} />
                            <Text style={styles.contactText}>{property.phone}</Text>
                        </View>

                        <View style={styles.contactRow}>
                            <Ionicons name="mail" size={20} color={COLORS.primary} />
                            <Text style={styles.contactText}>{property.email}</Text>
                        </View>

                        {property.website && (
                            <View style={styles.contactRow}>
                                <Ionicons name="globe" size={20} color={COLORS.primary} />
                                <Text style={styles.contactText}>{property.website}</Text>
                            </View>
                        )}
                    </View>

                    {/* Check-in/Check-out */}
                    {(property.checkInTime || property.check_in_time || property.checkOutTime || property.check_out_time) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Check-in & Check-out</Text>
                            <View style={styles.timeRow}>
                                {(property.checkInTime || property.check_in_time) && (
                                    <View style={styles.timeBox}>
                                        <Ionicons name="log-in" size={20} color={COLORS.primary} />
                                        <Text style={styles.timeLabel}>Check-in</Text>
                                        <Text style={styles.timeValue}>{property.checkInTime || property.check_in_time}</Text>
                                    </View>
                                )}
                                {(property.checkOutTime || property.check_out_time) && (
                                    <View style={styles.timeBox}>
                                        <Ionicons name="log-out" size={20} color={COLORS.primary} />
                                        <Text style={styles.timeLabel}>Check-out</Text>
                                        <Text style={styles.timeValue}>{property.checkOutTime || property.check_out_time}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>
                            Welcome to {property.name}, a {(property.propertyType || property.property_type || 'property').toLowerCase()} located in {property.city}, {property.country}.
                            We offer excellent service and comfortable accommodations for your stay.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>Starting from</Text>
                    <Text style={styles.priceValue}>$120</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.spacing.xl,
    },
    loadingText: {
        marginTop: SIZES.spacing.md,
        fontSize: SIZES.md,
        color: COLORS.text.secondary,
    },
    errorText: {
        marginTop: SIZES.spacing.md,
        fontSize: SIZES.md,
        color: COLORS.error,
        textAlign: 'center',
    },
    backButton: {
        marginTop: SIZES.spacing.lg,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.spacing.xl,
        paddingVertical: SIZES.spacing.md,
        borderRadius: SIZES.radius.lg,
    },
    backButtonText: {
        color: COLORS.surface,
        fontSize: SIZES.md,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.spacing.lg,
        paddingVertical: SIZES.spacing.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        width: width,
        height: 250,
    },
    propertyImage: {
        width: '100%',
        height: '100%',
    },
    infoSection: {
        backgroundColor: COLORS.surface,
        padding: SIZES.spacing.lg,
    },
    propertyName: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SIZES.spacing.sm,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.spacing.md,
    },
    propertyType: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        marginLeft: SIZES.spacing.xs,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SIZES.spacing.lg,
    },
    locationText: {
        fontSize: SIZES.md,
        color: COLORS.text.secondary,
        marginLeft: SIZES.spacing.sm,
        flex: 1,
    },
    section: {
        marginTop: SIZES.spacing.lg,
        paddingTop: SIZES.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SIZES.spacing.md,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.spacing.md,
    },
    contactText: {
        fontSize: SIZES.md,
        color: COLORS.text.primary,
        marginLeft: SIZES.spacing.md,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    timeBox: {
        alignItems: 'center',
        padding: SIZES.spacing.md,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius.md,
        minWidth: 120,
    },
    timeLabel: {
        fontSize: SIZES.sm,
        color: COLORS.text.secondary,
        marginTop: SIZES.spacing.xs,
    },
    timeValue: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginTop: SIZES.spacing.xs,
    },
    description: {
        fontSize: SIZES.md,
        color: COLORS.text.secondary,
        lineHeight: 22,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.spacing.lg,
        paddingVertical: SIZES.spacing.lg,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    priceSection: {
        flex: 1,
    },
    priceLabel: {
        fontSize: SIZES.sm,
        color: COLORS.text.secondary,
    },
    priceValue: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SIZES.spacing.xs,
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.spacing.xl,
        paddingVertical: SIZES.spacing.md,
        borderRadius: SIZES.radius.lg,
    },
    bookButtonText: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
});

export default PropertyInfoScreen;
