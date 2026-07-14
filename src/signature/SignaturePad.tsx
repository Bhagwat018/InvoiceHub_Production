import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';

export interface SignaturePadRef {
  clear: () => void;
  toBase64: () => Promise<string>;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  style?: ViewStyle;
  penColor?: string;
  backgroundColor?: string;
  penStrokeWidth?: number;
  onChange?: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      style,
      penColor = '#000',
      backgroundColor = '#fff',
      penStrokeWidth = 2.5,
      onChange,
    },
    ref,
  ) => {
    const strokesRef = useRef<Stroke[]>([]);
    const currentStrokeRef = useRef<Stroke | null>(null);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          const { locationX, locationY } = evt.nativeEvent;
          currentStrokeRef.current = {
            points: [{ x: locationX, y: locationY }],
            color: penColor,
            width: penStrokeWidth,
          };
          onChange?.();
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          if (!currentStrokeRef.current) return;
          const { locationX, locationY } = evt.nativeEvent;
          currentStrokeRef.current.points.push({ x: locationX, y: locationY });
        },
        onPanResponderRelease: () => {
          if (currentStrokeRef.current) {
            strokesRef.current.push(currentStrokeRef.current);
            currentStrokeRef.current = null;
          }
        },
      }),
    ).current;

    const clear = useCallback(() => {
      strokesRef.current = [];
      currentStrokeRef.current = null;
    }, []);

    const isEmpty = useCallback(() => {
      return strokesRef.current.length === 0;
    }, []);

    const toBase64 = useCallback(async (): Promise<string> => {
      // In production, use react-native-signature-canvas or
      // react-native-view-shot to capture the canvas
      return '';
    }, []);

    useImperativeHandle(ref, () => ({
      clear,
      toBase64,
      isEmpty,
    }));

    const renderStrokes = () => {
      return strokesRef.current.map((stroke, strokeIndex) => {
        if (stroke.points.length < 2) return null;
        return stroke.points.reduce<React.ReactNode>((acc, point, pointIndex) => {
          if (pointIndex === 0) return acc;
          const prev = stroke.points[pointIndex - 1];
          return (
            <View
              key={`${strokeIndex}-${pointIndex}`}
              style={{
                position: 'absolute',
                left: Math.min(prev.x, point.x),
                top: Math.min(prev.y, point.y),
                width: Math.abs(point.x - prev.x) || 1,
                height: Math.abs(point.y - prev.y) || 1,
                backgroundColor: stroke.color,
              }}
            />
          );
        }, null);
      });
    };

    return (
      <View
        style={[styles.container, { backgroundColor }, style]}
        {...panResponder.panHandlers}
      >
        {renderStrokes()}
        {strokesRef.current.length === 0 && (
          <View style={styles.placeholder}>
            <View style={styles.line} />
          </View>
        )}
      </View>
    );
  },
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  line: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});
