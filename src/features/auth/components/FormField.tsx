import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ComponentRef,
} from 'react';
import {
  Platform,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, layout } from '../../../theme/authLanding';
import { emailTypography, fieldColors } from '../../../theme/emailSignIn';

type FormFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  leading?: ReactNode;
  trailing?: ReactNode;
  errorMessage?: string;
  helperFontFamily?: string;
};
const FormField = forwardRef<ComponentRef<typeof TextInput>, FormFieldProps>(
  function AuthFormField(
    {
      leading,
      trailing,
      onFocus,
      onBlur,
      onChangeText,
      value,
      errorMessage,
      helperFontFamily = 'Inter-Regular',
      ...props
    },
    ref,
  ) {
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState((value?.length ?? 0) > 0);

    useEffect(() => {
      setFilled((value?.length ?? 0) > 0);
    }, [value]);

    const active = focused || filled;
    return (
      <View style={styles.field}>
        <Pressable
          accessible={false}
          onPressIn={() => inputRef.current?.focus()}
          style={[
            styles.container,
            {
              borderColor: errorMessage
                ? fieldColors.error
                : active
                  ? fieldColors.focusedBorder
                  : fieldColors.border,
            },
          ]}
        >
          {leading}
          <TextInput
            {...props}
            value={value}
            ref={node => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref != null) {
                ref.current = node;
              }
            }}
            style={[emailTypography.input, styles.input]}
            placeholderTextColor={fieldColors.placeholder}
            onFocus={event => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={event => {
              setFocused(false);
              onBlur?.(event);
            }}
            onChangeText={text => {
              setFilled(text.length > 0);
              onChangeText?.(text);
            }}
          />
          {trailing}
        </Pressable>
        {errorMessage ? (
          <Text style={[styles.helper, { fontFamily: helperFontFamily }]}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
    );
  },
);
export default FormField;
const styles = StyleSheet.create({
  field: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    gap: 4,
  },
  container: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    height: 56,
    padding: 16,
    gap: 16,
    borderRadius: 16,
    backgroundColor: colors.socialBackground,
    borderWidth: 1,
    borderColor: fieldColors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 24,
    padding: 0,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    textAlignVertical: 'center',
    lineHeight: Platform.OS === 'ios' ? undefined : 24,
  },
  helper: {
    width: '100%',
    height: 16,
    fontSize: 11,
    fontWeight: '300',
    lineHeight: 16,
    color: fieldColors.error,
    includeFontPadding: false,
  },
});
