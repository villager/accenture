import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { resetPasswordStyles as styles, Theme } from '../styles';

interface Props {
    visible: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ResetPasswordModal({ visible, onSuccess, onCancel }: Props) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (!newPassword.trim() || newPassword.length < 6) {
            Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Validation Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            Alert.alert('Success', 'Your password has been reset successfully.');
            setNewPassword('');
            setConfirmPassword('');
            onSuccess();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not update your password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <SafeAreaView style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Set New Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your new password to complete the account recovery process.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="New password"
                        placeholderTextColor="#64748B"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirm new password"
                        placeholderTextColor="#64748B"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleUpdatePassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Theme.colors.background} />
                        ) : (
                            <Text style={styles.submitBtnText}>Update Password</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
