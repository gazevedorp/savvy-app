import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';

interface WebViewProps {
  url: string;
  style?: object;
}

export default function WebView({ url, style, ...rest }: WebViewProps) {
  // On web, we'll use an iframe instead of the WebView component
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          src={url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Web content"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </View>
    );
  }

  // On native platforms, use the WebView component
  return (
    <View style={[styles.container, style]}>
      <RNWebView
        source={{ uri: url }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#f9f9f9',
  },
});