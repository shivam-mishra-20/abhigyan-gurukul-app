import React, { memo } from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

interface MathTextProps {
  text: string;
  style?: object;
  fontSize?: number;
}

// Detect if text contains LaTeX/math patterns
const hasLatex = (text: string): boolean => {
  if (!text) return false;
  return (
    // LaTeX delimiters
    text.includes("\\(") ||
    text.includes("\\)") ||
    text.includes("\\[") ||
    text.includes("\\]") ||
    text.includes("$$") ||
    text.includes("$") ||
    // Common LaTeX commands
    text.includes("\\frac") ||
    text.includes("\\sqrt") ||
    text.includes("\\sum") ||
    text.includes("\\int") ||
    text.includes("\\prod") ||
    text.includes("\\lim") ||
    text.includes("\\infty") ||
    text.includes("\\pm") ||
    text.includes("\\times") ||
    text.includes("\\div") ||
    text.includes("\\cdot") ||
    text.includes("\\alpha") ||
    text.includes("\\beta") ||
    text.includes("\\gamma") ||
    text.includes("\\theta") ||
    text.includes("\\pi") ||
    text.includes("\\sigma") ||
    text.includes("\\delta") ||
    text.includes("\\Delta") ||
    text.includes("\\lambda") ||
    text.includes("\\mu") ||
    text.includes("\\omega") ||
    text.includes("\\phi") ||
    text.includes("\\epsilon") ||
    text.includes("\\leq") ||
    text.includes("\\geq") ||
    text.includes("\\neq") ||
    text.includes("\\approx") ||
    text.includes("\\rightarrow") ||
    text.includes("\\leftarrow") ||
    text.includes("\\Rightarrow") ||
    text.includes("\\sin") ||
    text.includes("\\cos") ||
    text.includes("\\tan") ||
    text.includes("\\log") ||
    text.includes("\\ln") ||
    text.includes("\\exp") ||
    text.includes("\\vec") ||
    text.includes("\\hat") ||
    text.includes("\\bar") ||
    text.includes("\\overline") ||
    text.includes("\\underline") ||
    text.includes("\\text") ||
    text.includes("\\mathrm") ||
    text.includes("\\mathbf") ||
    // Subscript/superscript patterns
    text.includes("^{") ||
    text.includes("_{") ||
    text.includes("^") ||
    text.includes("_") ||
    // Other common patterns
    /\\[a-zA-Z]+/.test(text)
  );
};

// Generate HTML with KaTeX for math rendering
const generateMathHtml = (text: string, fontSize: number): string => {
  // Escape HTML but preserve LaTeX delimiters
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: ${fontSize}px;
          line-height: 1.5;
          color: #1f2937;
          padding: 8px 4px;
          background: transparent;
        }
        .katex { font-size: 1.1em; }
        .katex-display { margin: 0.5em 0; overflow-x: auto; overflow-y: hidden; }
        p { margin-bottom: 0.5em; }
        p:last-child { margin-bottom: 0; }
      </style>
    </head>
    <body>
      <div id="content">${escapedText}</div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          renderMathInElement(document.getElementById("content"), {
            delimiters: [
              {left: "$$", right: "$$", display: true},
              {left: "\\\\[", right: "\\\\]", display: true},
              {left: "$", right: "$", display: false},
              {left: "\\\\(", right: "\\\\)", display: false}
            ],
            throwOnError: false
          });
          
          // Send height to React Native
          setTimeout(function() {
            const height = document.body.scrollHeight;
            window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
          }, 100);
        });
      </script>
    </body>
    </html>
  `;
};

/**
 * MathText component for rendering text with LaTeX equations
 * Falls back to plain Text for non-math content
 */
function MathTextComponent({ text, style, fontSize = 16 }: MathTextProps) {
  const [webViewHeight, setWebViewHeight] = React.useState(50);

  if (!text) {
    return null;
  }

  // If no LaTeX, render as plain text for better performance
  if (!hasLatex(text)) {
    return (
      <Text
        style={[
          { fontSize, color: "#1f2937", lineHeight: fontSize * 1.5 },
          style,
        ]}
      >
        {text}
      </Text>
    );
  }

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height) {
        setWebViewHeight(Math.max(data.height + 16, 50));
      }
    } catch (e) {
      // Ignore parse errors
    }
  };

  return (
    <View style={[{ minHeight: webViewHeight }, style]}>
      <WebView
        source={{ html: generateMathHtml(text, fontSize) }}
        style={{ height: webViewHeight, backgroundColor: "transparent" }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        originWhitelist={["*"]}
        onMessage={handleMessage}
        injectedJavaScript="window.ReactNativeWebView.postMessage(JSON.stringify({ height: document.body.scrollHeight }));"
      />
    </View>
  );
}

export const MathText = memo(MathTextComponent);
export default MathText;
