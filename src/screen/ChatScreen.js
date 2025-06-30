import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import sb from '../config/sendbirdConfig';

export default function ChatScreen() {
  const route = useRoute();
  const { channelUrl } = route.params;

  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    // 🔁 Charger le canal existant
    sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
      if (error) {
        console.error('Erreur lors de la récupération du canal:', error);
        return;
      }

      setChannel(groupChannel);

      // 📥 Charger les messages existants
      const messageListQuery = groupChannel.createPreviousMessageListQuery();
      messageListQuery.load(30, false, (fetchedMessages, err) => {
        if (err) {
          console.error('Erreur lors du chargement des messages:', err);
          return;
        }

        setMessages(fetchedMessages);
      });

      // ⚡ Écouter les nouveaux messages en temps réel
      const ChannelHandler = new sb.ChannelHandler();
      ChannelHandler.onMessageReceived = (incomingChannel, message) => {
        if (incomingChannel.url === channelUrl) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      };

      sb.addChannelHandler('ChatScreenHandler', ChannelHandler);
    });

    // 🔚 Nettoyage du listener quand on quitte l'écran
    return () => {
      sb.removeChannelHandler('ChatScreenHandler');
    };
  }, [channelUrl]);

  const handleSend = () => {
    if (!channel || text.trim() === '') return;

    // 📤 Envoyer le message
    channel.sendUserMessage(text, (message, error) => {
      if (error) {
        console.error('Erreur lors de l’envoi:', error);
        return;
      }

      setMessages((prev) => [...prev, message]);
      setText('');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.messageId.toString()}
              renderItem={({ item }) => (
                <Text style={styles.message}>
                  <Text style={styles.sender}>{item.sender?.userId || 'inconnu'} : </Text>
                  {item.message}
                </Text>
              )}
              contentContainerStyle={styles.messageList}
            />
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Écrire un message..."
                value={text}
                onChangeText={setText}
                style={styles.input}
              />
              <Button title="Envoyer" onPress={handleSend} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messageList: {
    padding: 16,
  },
  message: {
    marginBottom: 10,
    fontSize: 16,
  },
  sender: {
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
});
