import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig'; // adapte le chemin

const generateChatId = (email1, email2) => {
  return [email1, email2].sort().join('_'); // unique ID pour une paire
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const currentUserEmail = auth.currentUser.email;

  const [email, setEmail] = useState('');
  const [chats, setChats] = useState([]);

  // 🔁 Charger les discussions existantes
  useEffect(() => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('users', 'array-contains', currentUserEmail));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
    });

    return unsubscribe;
  }, []);

  // ➕ Démarrer une nouvelle discussion
  const handleStartChat = async () => {
    if (!email || email === currentUserEmail) return;

    const chatId = generateChatId(currentUserEmail, email);
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        users: [currentUserEmail, email],
        createdAt: serverTimestamp(),
      });
    }

    navigation.navigate('ChatScreen', { chatId });
    setEmail(''); // reset
  };

  const openChat = (chatId) => {
    navigation.navigate('ChatScreen', { chatId });
  };

  const getOtherUserEmail = (users) => {
    return users.find(u => u !== currentUserEmail);
  };

  return (
    <View style={styles.container}>
      {/* ➕ Formulaire pour démarrer une nouvelle discussion */}
      <TextInput
        placeholder="Entrez l'email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <Button title="Démarrer une discussion" onPress={handleStartChat} />

      {/* 📜 Liste des discussions existantes */}
      <Text style={styles.title}>Discussions existantes :</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => openChat(item.id)}
          >
            <Text style={styles.chatText}>
              {getOtherUserEmail(item.users)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune discussion pour le moment</Text>}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  chatText: {
    fontSize: 16,
  },
  emptyText: {
    marginTop: 20,
    color: '#888',
    textAlign: 'center',
  },
});
