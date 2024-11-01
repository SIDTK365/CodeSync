import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";

// Language modes
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";
import "codemirror/mode/ruby/ruby";
import "codemirror/mode/sql/sql";
import "codemirror/mode/shell/shell";
import "codemirror/mode/php/php";
import "codemirror/mode/rust/rust";
import "codemirror/mode/r/r";

// Themes
import "codemirror/theme/dracula.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/material.css";
import "codemirror/theme/material-darker.css";
import "codemirror/theme/material-palenight.css";
import "codemirror/theme/nord.css";
import "codemirror/theme/cobalt.css";
import "codemirror/theme/oceanic-next.css";

import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import { ACTIONS } from "../Actions";

// Language mode mapping
const LANGUAGE_MODES = {
  python3: "python",
  javascript: "javascript",
  java: "text/x-java",
  cpp: "text/x-c++src",
  nodejs: "javascript",
  c: "text/x-csrc",
  ruby: "ruby",
  go: "go",
  scala: "text/x-scala",
  bash: "shell",
  sql: "sql",
  pascal: "pascal",
  csharp: "text/x-csharp",
  php: "php",
  swift: "swift",
  rust: "rust",
  r: "r"
};

function Editor({ socketRef, roomId, onCodeChange, language, theme }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: LANGUAGE_MODES[language] || "python",
          theme: theme || "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.setSize(null, "100%");
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    };

    init();
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption("theme", theme);
    }
  }, [theme]);

  // Update language mode when it changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption("mode", LANGUAGE_MODES[language] || "javascript");
    }
  }, [language]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div style={{ height: "600px" }}>
      <textarea id="realtimeEditor"></textarea>
    </div>
  );
}

export default Editor;