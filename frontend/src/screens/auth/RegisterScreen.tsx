import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../theme/colors';
import { authService } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { login: contextLogin } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    if (!username || username.length < 3) newErrors.username = 'Username must be at least 3 characters.';
    if (!email || !email.includes('@')) newErrors.email = 'Valid email is required.';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await authService.register(username, email, password);
      contextLogin(response.token, response.user);
    } catch (err: any) {
      setErrors({ form: err.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.logo}>PingMe</Text>
          <Text style={styles.tagline}>Create your account.</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={THEME.text.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          {errors.username && <Text style={styles.fieldError}>{errors.username}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={THEME.text.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={THEME.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={THEME.text.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}

          {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#0D1117" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logo: {
    color: THEME.accent.primary,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    color: THEME.text.muted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: THEME.background.surface,
    borderColor: THEME.border.default,
    borderWidth: 1,
    borderRadius: 8,
    color: THEME.text.heading,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  fieldError: {
    color: '#E24B4A',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  button: {
    backgroundColor: THEME.accent.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  buttonText: {
    color: '#0D1117',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#E24B4A',
    marginBottom: 16,
    textAlign: 'center',
  },
  linkText: {
    color: THEME.accent.cyan,
    textAlign: 'center',
    fontSize: 14,
  },
});
