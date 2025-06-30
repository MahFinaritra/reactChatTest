import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import sb from '../config/sendbirdConfig'; // ✅ import Sendbird

export default function SigninScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      // 🔐 Connexion Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // 💬 Connexion Sendbird (avec l'email comme userId)
      const userId = email.replace(/[@.]/g, '_');
      sb.connect(userId, (user, error) => {

        if (error) {
          console.error('Erreur Sendbird:', error);
          Alert.alert('Erreur Sendbird', error.message);
          return;
        }

        // (optionnel) mettre un nom d'utilisateur visible
        sb.updateCurrentUserInfo(email, null, (responseError) => {
          if (responseError) {
            console.warn('Échec de la mise à jour du profil Sendbird');
          }
        });

        Alert.alert('Succès', 'Connexion réussie !');
        navigation.navigate('Home'); // ✅ après Sendbird
      });
    } catch (error) {
      console.error('Erreur Firebase:', error);
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Button title="Se connecter" onPress={handleSignIn} />
      <Button title="Créer un compte" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});
