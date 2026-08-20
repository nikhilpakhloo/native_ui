import { useColorTheme } from '@/hooks/useColorTheme';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function HomeHeader() {
    const { colors } = useColorTheme();
    const insets = useSafeAreaInsets();

    const iconColor = colors.text as any;
    const bgColor = colors.background as any;

    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top, backgroundColor: bgColor, borderBottomColor: colors.border as any }]}>
            <View style={styles.leftSection}>
                <SymbolView name={{ ios: 'play.rectangle.fill', android: 'smart_display' }} size={28} tintColor={colors.red as any} />
                <Text style={[styles.logoText, { color: iconColor }]}>YouTube</Text>
            </View>

            <View style={styles.rightSection}>
                <TouchableOpacity style={styles.iconButton}>
                    <SymbolView name={{ ios: 'tv', android: 'cast' }} size={24} tintColor={iconColor} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <SymbolView name={{ ios: 'bell', android: 'notifications' }} size={24} tintColor={iconColor} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <SymbolView name={{ ios: 'magnifyingglass', android: 'search' }} size={24} tintColor={iconColor} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileButton}>
                    <SymbolView name={{ ios: 'person.crop.circle.fill', android: 'account_circle' }} size={26} tintColor={iconColor} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        zIndex: 10,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 6,
        letterSpacing: -0.5,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 16,
    },
    profileButton: {
        marginLeft: 16,
    }
});
