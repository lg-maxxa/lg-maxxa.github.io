/**
 * MessageBubble - Individual chat message bubble with status indicators
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SvgIcon} from './SvgIcon';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS} from '../theme';
import {ChatService} from '../services/ChatService';
import type {Message} from '../types';

interface Props {
  message: Message;
  isMine: boolean;
  showTime?: boolean;
}

export const MessageBubble: React.FC<Props> = ({
  message,
  isMine,
  showTime = true,
}) => {
  const {text, status, timestamp, type} = message;

  return (
    <View style={[styles.wrapper, isMine ? styles.wrapperRight : styles.wrapperLeft]}>
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleSent : styles.bubbleReceived,
          isMine ? styles.bubbleRadiusSent : styles.bubbleRadiusReceived,
        ]}>
        {/* Message text */}
        {text ? (
          <Text
            style={[
              styles.text,
              isMine ? styles.textSent : styles.textReceived,
            ]}>
            {text}
          </Text>
        ) : null}

        {/* File attachment */}
        {type === 'file' && (
          <View style={styles.filePreview}>
            <SvgIcon name="attach" size={20} color={isMine ? COLORS.primary : COLORS.textSecondary} />
            <Text style={styles.fileName} numberOfLines={1}>
              {message.fileName ?? 'Attachment'}
            </Text>
          </View>
        )}

        {/* Footer: timestamp + tick */}
        {showTime && (
          <View style={[styles.footer, isMine && styles.footerRight]}>
            <Text style={[styles.timestamp, isMine ? styles.timestampSent : styles.timestampReceived]}>
              {ChatService.formatTime(timestamp)}
            </Text>
            {isMine && (
              <View style={styles.tickIcon}>
                <SvgIcon
                  name="sent"
                  size={14}
                  color={
                    status === 'read'
                      ? COLORS.readTick
                      : status === 'failed'
                      ? COLORS.buttonDanger
                      : COLORS.sentTick
                  }
                />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
    maxWidth: '80%',
  },
  wrapperRight: {
    alignSelf: 'flex-end',
  },
  wrapperLeft: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 60,
  },
  bubbleSent: {
    backgroundColor: COLORS.sentBubble,
  },
  bubbleReceived: {
    backgroundColor: COLORS.receivedBubble,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleRadiusSent: {
    borderRadius: BORDER_RADIUS.messageSent,
    borderBottomRightRadius: 4,
  },
  bubbleRadiusReceived: {
    borderRadius: BORDER_RADIUS.messageReceived,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  textSent: {
    color: COLORS.textPrimary,
  },
  textReceived: {
    color: COLORS.textPrimary,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: 4,
  },
  fileName: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  footerRight: {
    alignSelf: 'flex-end',
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 14,
  },
  timestampSent: {
    color: COLORS.timestamp,
  },
  timestampReceived: {
    color: COLORS.timestamp,
  },
  tickIcon: {
    marginLeft: 3,
  },
});
