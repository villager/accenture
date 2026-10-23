import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../services";
import { Theme } from "../styles";

type AuthMode = "signin" | "signup" | "forgot";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");

  const handleAuth = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    if (mode !== "forgot" && !password.trim()) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert(
          "Success",
          "Account created! Please check your email to verify your account.",
        );
        setMode("signin");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
        );
        if (error) throw error;
        Alert.alert(
          "Email Sent",
          "Password reset instructions have been sent to your email. Please check your inbox.",
        );
        setMode("signin");
      }
    } catch (error: any) {
      Alert.alert(
        "Authentication Error",
        error.message || "An error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={localStyles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={localStyles.keyboardView}
      >
        <View style={localStyles.card}>
          <Text style={localStyles.title}>TRACK & PREDICT</Text>
          <Text style={localStyles.subtitle}>
            {mode === "signup" && "Create an account to sync your watchlist"}
            {mode === "signin" && "Sign in to access your saved stocks"}
            {mode === "forgot" && "Reset your account password"}
          </Text>

          {/* Email input */}
          <View style={localStyles.inputWrapper}>
            <Text style={localStyles.label}>Email</Text>
            <TextInput
              style={localStyles.input}
              placeholder="e.g. name@example.com"
              placeholderTextColor={Theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password input (oculto en modo forgot) */}
          {mode !== "forgot" && (
            <View style={localStyles.inputWrapper}>
              <View style={localStyles.passwordHeaderRow}>
                <Text style={localStyles.label}>Password</Text>
                {mode === "signin" && (
                  <TouchableOpacity onPress={() => setMode("forgot")}>
                    <Text style={localStyles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={localStyles.input}
                placeholder="••••••••"
                placeholderTextColor={Theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          )}

          {/* Botón principal */}
          <TouchableOpacity
            style={localStyles.button}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Theme.colors.textPrimary} />
            ) : (
              <Text style={localStyles.buttonText}>
                {mode === "signup" && "Sign Up"}
                {mode === "signin" && "Log In"}
                {mode === "forgot" && "Send Reset Link"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Enlaces para cambiar de modo */}
          <View style={localStyles.footerLinks}>
            {mode === "forgot" ? (
              <TouchableOpacity onPress={() => setMode("signin")}>
                <Text style={localStyles.toggleText}>Back to Sign In</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                <Text style={localStyles.toggleText}>
                  {mode === "signin"
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Theme.colors.textPrimary,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  passwordHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.colors.textOff,
  },
  forgotText: {
    fontSize: 12,
    color: Theme.colors.accent,
  },
  input: {
    height: 48,
    backgroundColor: Theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    fontSize: 15,
  },
  button: {
    height: 48,
    backgroundColor: Theme.colors.accent,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  footerLinks: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    color: Theme.colors.accent,
    fontSize: 13,
  },
});

export default AuthScreen;
