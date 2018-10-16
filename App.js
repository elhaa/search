import React from "react";
    import { GiftedChat } from "react-native-gifted-chat";
    import Chatkit from "@pusher/chatkit";
    import { Platform } from 'react-native';
    import PropTypes from 'prop-types';
    import emojiUtils from 'emoji-utils';

    import SlackMessage from './SlackMessage';


    const CHATKIT_TOKEN_PROVIDER_ENDPOINT = "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/7099fd9f-7831-4f12-a0fc-048486ca043a/token";
    const CHATKIT_INSTANCE_LOCATOR = "v1:us1:7099fd9f-7831-4f12-a0fc-048486ca043a";
    const CHATKIT_ROOM_ID = 18709143;
    const CHATKIT_USER_NAME = "user2"; 

    export default class MyChat extends React.Component {
      state = {
        messages: []
      };

      componentWillMount() {
        this.setState({
          messages: [
            {
              _id: 1,
              text: 'Hello developer',
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'Elha',
                avatar: 'https://placeimg.com/140/140/any',
              },
            },
          ],
        })
      }

      componentDidMount() {
        // This will create a `tokenProvider` object. This object will be later used to make a Chatkit Manager instance.
      const tokenProvider = new Chatkit.TokenProvider({
        url: CHATKIT_TOKEN_PROVIDER_ENDPOINT
      });

      // This will instantiate a `chatManager` object. This object can be used to subscribe to any number of rooms and users and corresponding messages.
      // For the purpose of this example we will use single room-user pair.
      const chatManager = new Chatkit.ChatManager({
        instanceLocator: CHATKIT_INSTANCE_LOCATOR,
        userId: CHATKIT_USER_NAME,
        tokenProvider: tokenProvider
      });

      // In order to subscribe to the messages this user is receiving in this room, we need to `connect()` the `chatManager` and have a hook on `onNewMessage`. There are several other hooks that you can use for various scenarios. A comprehensive list can be found [here](https://docs.pusher.com/chatkit/reference/javascript#connection-hooks).
      chatManager.connect().then(currentUser => {
        this.currentUser = currentUser;
        this.currentUser.subscribeToRoom({
          roomId: CHATKIT_ROOM_ID,
          hooks: {
            onNewMessage: this.onReceive.bind(this)
          }
        });
      });
    }

    onSend([message]) {
      this.currentUser.sendMessage({
        text: message.text,
        roomId: CHATKIT_ROOM_ID
      });
    }

    onReceive(data) {
      const { id, senderId, text, createdAt } = data;
      const incomingMessage = {
        _id: id,
        text: text,
        createdAt: new Date(createdAt),
        user: {
          _id: senderId,
          name: senderId,
          avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmXGGuS_PrRhQt73sGzdZvnkQrPXvtA-9cjcPxJLhLo8rW-sVA"
        }
      };

      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, incomingMessage)
      }));
    }

    renderMessage(props) {
      const { currentMessage: { text: currText } } = props;
  
      let messageTextStyle;
  
      // Make "pure emoji" messages much bigger than plain text.
      if (currText && emojiUtils.isPureEmojiString(currText)) {
        messageTextStyle = {
          fontSize: 28,
          // Emoji get clipped if lineHeight isn't increased; make it consistent across platforms.
          lineHeight: Platform.OS === 'android' ? 34 : 30,
        };
      }
  
      return (
        <SlackMessage {...props} messageTextStyle={messageTextStyle} />
      );
    }

    render() {
      return (
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: CHATKIT_USER_NAME,
          }}
          renderMessage={this.renderMessage}
        />
      );
    }
  }