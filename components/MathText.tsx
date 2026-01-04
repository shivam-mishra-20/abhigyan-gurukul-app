/**
 * MathText Component
 * Renders text with LaTeX mathematical equations using KaTeX
 * Supports both inline ($...$) and display ($$...$$) math
 */

import { getColors } from "@/constants/colors";
import { useAppTheme } from "@/lib/context";
import katex from "katex";
import { useMemo } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

interface MathTextProps {
  text: string;
  style?: any;
  fontSize?: number;
}

export default function MathText({
  text,
  style,
  fontSize = 14,
}: MathTextProps) {
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);

  const html = useMemo(() => {
    if (!text) return "";

    let result = "";
    let lastIndex = 0;

    // Handle display math $$...$$
    const displayMathRegex = /\$\$(.*?)\$\$/g;
    const displayMatches: { start: number; end: number; content: string }[] =
      [];
    let displayMatch: RegExpExecArray | null;

    while ((displayMatch = displayMathRegex.exec(text)) !== null) {
      displayMatches.push({
        start: displayMatch.index,
        end: displayMatch.index + displayMatch[0].length,
        content: displayMatch[1],
      });
    }

    // Handle inline math $...$
    const inlineMathRegex = /\$([^$]+?)\$/g;
    const inlineMatches: { start: number; end: number; content: string }[] = [];
    let inlineMatch: RegExpExecArray | null;

    while ((inlineMatch = inlineMathRegex.exec(text)) !== null) {
      // Check if this inline match is inside a display match
      const isInDisplay = displayMatches.some(
        (dm) => inlineMatch!.index >= dm.start && inlineMatch!.index < dm.end
      );
      if (!isInDisplay) {
        inlineMatches.push({
          start: inlineMatch.index,
          end: inlineMatch.index + inlineMatch[0].length,
          content: inlineMatch[1],
        });
      }
    }

    // Combine and sort all matches
    const allMatches = [
      ...displayMatches.map((m) => ({ ...m, type: "display" as const })),
      ...inlineMatches.map((m) => ({ ...m, type: "inline" as const })),
    ].sort((a, b) => a.start - b.start);

    // Build result with rendered math
    allMatches.forEach((match) => {
      // Add text before math
      if (lastIndex < match.start) {
        const textPart = text
          .substring(lastIndex, match.start)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>");
        result += textPart;
      }

      // Render math
      try {
        const html = katex.renderToString(match.content, {
          displayMode: match.type === "display",
          throwOnError: false,
          output: "html",
        });
        result += html;
      } catch {
        // If rendering fails, just show the original text
        result +=
          match.type === "display"
            ? `$$${match.content}$$`
            : `$${match.content}$`;
      }

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      const textPart = text
        .substring(lastIndex)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");
      result += textPart;
    }

    const finalHtml =
      result ||
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: ${fontSize}px;
              line-height: 1.6;
              color: ${isDark ? colors.gray100 : colors.gray900};
              background: transparent;
              padding: 0;
              overflow-x: hidden;
            }
            .katex { 
              font-size: 1em;
            }
            .katex-display { 
              margin: 0.75em 0;
              text-align: center;
            }
            .katex-html {
              text-align: left;
            }
          </style>
        </head>
        <body>
          ${finalHtml}
        </body>
      </html>
    `;
  }, [text, isDark, colors, fontSize]);

  // If no math content, return null (parent can show plain text)
  if (!text.includes("$")) {
    return null;
  }

  return (
    <View style={[{ width: "100%", backgroundColor: "transparent" }, style]}>
      <WebView
        source={{ html }}
        style={{
          backgroundColor: "transparent",
          minHeight: 50,
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        automaticallyAdjustContentInsets={false}
        contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
      />
    </View>
  );
}
