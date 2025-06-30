import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, Button, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import sb from '../config/sendbirdConfig';

// Convertit un email en identifiant Sendbird valide
const emailToUserId = (email) => email.replace(/[@.]/g, '_');

const HomeScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [channels, setChannels] = useState([]);

  // Charger les canaux au chargement
  useEffect(() => {
    if (!sb.currentUser) {
      console.warn('Aucun utilisateur connecté à Sendbird.');
      return;
    }

    const query = sb.GroupChannel.createMyGroupChannelListQuery();
    query.includeEmpty = true;

    query.next((channelList, error) => {
      if (error) {
        console.error('Erreur lors de la récupération des channels :', error);
      } else {
        setChannels(channelList);
      }
    });
  }, []);

  const handleStartChat = () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer un email.');
      return;
    }

    const targetUserId = emailToUserId(email);
    const params = new sb.GroupChannelParams();
    params.addUserIds([targetUserId]);
    params.isDistinct = true;

    sb.GroupChannel.createChannel(params, (channel, error) => {
      if (error) {
        console.error('Erreur lors de la création du canal :', error);
        Alert.alert('Erreur', error.message);
        return;
      }

      console.log('Canal créé :', channel.url);
      navigation.navigate('ChatScreen', { channelUrl: channel.url });
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Entrez l'email de l'utilisateur"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <Button title="Démarrer une discussion" onPress={handleStartChat} />

      <Text style={styles.title}>Discussions existantes :</Text>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatScreen', { channelUrl: item.url })}
          >
            <Text style={styles.chatText}>
              {item.members.map((m) => m.userId).join(', ')}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Aucune discussion</Text>
        }
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 8 },
  title: { marginTop: 20, fontSize: 18, fontWeight: 'bold' },
  chatItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  chatText: { fontSize: 16 },
});
