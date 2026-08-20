import { useBottomSheet } from '@/commonui/BottomSheet';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { useColorTheme } from '@/hooks/useColorTheme';

import { HomeHeader } from '@/commonui/Header';

function DynamicSheetContent() {
    const { colors } = useColorTheme();
    const [index, setIndex] = React.useState(0);

    // React.useEffect(() => {
    //     const interval = setInterval(() => {
    //         setIndex(prevIndex => prevIndex + 1);
    //     }, 1000);
    //     return () => clearInterval(interval);
    // }, []);

    return (
        <View style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: colors.text as any }]}>Categories Content {index}</Text>
            <Text style={[styles.sheetDesc, { color: colors.textSecondary as any }]}>This is custom content passed from the categories screen.</Text>
        </View>
    );
}

export default function CategoriesScreen() {
    const { expand } = useBottomSheet();
    const { colors } = useColorTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background as any }]}>
            <HomeHeader />
            <View style={styles.content}>
                <Button title="Open Bottom Sheet2" onPress={() => expand(<DynamicSheetContent />)} />
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
    sheetContent: {
        padding: 24,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sheetDesc: {
    },
});
