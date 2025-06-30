import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import sb from '../config/sendbirdConfig';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      // 🔐 Création du compte Firebase
      await createUserWithEmailAndPassword(auth, email, password);

      // 🧼 Convertir l'email en userId valide pour Sendbird
      const userId = email.replace(/[@.]/g, '_');

      // 🔁 Connexion à Sendbird
      sb.connect(userId, (user, error) => {
        if (error) {
          console.error('Erreur Sendbird:', error);
          Alert.alert('Erreur Sendbird', error.message);
          return;
        }

        // (optionnel) Mettre à jour le profil utilisateur sur Sendbird
        sb.updateCurrentUserInfo(email, null, (updateError) => {
          if (updateError) {
            console.warn('Échec de la mise à jour du profil Sendbird');
          }
        });

        Alert.alert('Succès', 'Compte créé et connecté !');
        navigation.navigate('Home');
      });

    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="S'inscrire" onPress={handleSignUp} />
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
