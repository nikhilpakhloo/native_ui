import { StyleSheet, Text, View } from 'react-native';
import { useColorTheme } from '@/hooks/useColorTheme';
import { HomeHeader } from '@/commonui/Header';

export default function SettingsScreen() {
    const { colors } = useColorTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background as any }]}>
            <HomeHeader />
            <View style={styles.content}>
                <Text style={[styles.text, { color: colors.text as any }]}>Settings</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    }
});
