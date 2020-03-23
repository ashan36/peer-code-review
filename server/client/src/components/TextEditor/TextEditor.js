import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import Toolbar from "./components/Toolbar";

import {
  Editor,
  getDefaultKeyBinding,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw
} from "draft-js";

import CodeUtils from "draft-js-code";
import Prism from "prismjs";
import PrismDecorator from "draft-js-prism";
import "prismjs/themes/prism-okaidia.css";
import { languageGrammar } from "../../utils";

const useStyles = makeStyles({
  root: {
    width: "100%"
  },
  editorEdit: {
    border: "2px solid grey",
    padding: "10px",
    margin: "0",
    minHeight: "40vh",
    maxHeight: "60vh",
    overflow: "auto"
  },
  editorRead: {
    padding: "10px",
    margin: "0",
    minHeight: "10vh",
    maxHeight: "50vh",
    overflow: "auto"
  }
});

const editorStyleMap = {
  CODE: {
    background: "#414239",
    fontFamily: "'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace",
    fontSize: "1em",
    textShadow: "0 1px rgba(0, 0, 0, 0.3)",
    color: "#f8f8f2"
  }
};

const inlineStyles = {
  BOLD: "BOLD",
  ITALIC: "ITALIC",
  UNDERLINE: "UNDERLINE",
  CODE: "CODE"
};

const TextEditor = ({
  selectedLanguage,
  onSubmit,
  didSubmit,
  hasContent,
  readOnly,
  existingContent,
  postId
}) => {
  const classes = useStyles();
  var editorStyle;
  var mappedLanguage;

  if (selectedLanguage === "") {
    mappedLanguage = null;
  } else {
    mappedLanguage = languageGrammar[selectedLanguage];
  }

  const decorator = new PrismDecorator({
    prism: Prism,
    defaultSyntax: mappedLanguage
  });

  //Create initial editor state depending on mode
  const createEditorState = () => {
    if (readOnly) {
      editorStyle = classes.editorRead;
    } else {
      editorStyle = classes.editorEdit;
    }
    if (existingContent) {
      const currentContent = convertFromRaw(existingContent);
      return EditorState.createWithContent(currentContent, decorator);
    }
    return EditorState.createEmpty(decorator);
  };
  const [editorState, setEditorState] = useState(createEditorState());

  //Switch between edit and read only styles
  useEffect(() => {
    if (readOnly) {
      editorStyle = classes.editorRead;
    } else {
      editorStyle = classes.editorEdit;
    }
  }, [readOnly]);

  //Editor style states
  const [currentInlineStyles, setInlineStyles] = useState([]);
  const [currentBlockType, setBlockType] = useState("");

  //Pass language data through into the editor state
  useEffect(() => {
    const selection = editorState.getSelection();
    const block = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());
    const data = block.getData().merge({ syntax: mappedLanguage });
    const newBlock = block.merge({ data });
    const newContentState = editorState.getCurrentContent().merge({
      blockMap: editorState
        .getCurrentContent()
        .getBlockMap()
        .set(selection.getStartKey(), newBlock),
      selectionAfter: selection
    });
    setEditorState(
      EditorState.push(editorState, newContentState, "change-block-data")
    );
  });

  //Triggers editor's focus method
  const editor = React.useRef(null);
  const focusEditor = () => {
    editor.current.focus();
  };
  useEffect(() => {
    focusEditor();
  }, []);

  //Takes input from toolbar and updates editor state with new styles
  const handleFormatChange = style => {
    if (inlineStyles.hasOwnProperty(style)) {
      setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    } else {
      setEditorState(RichUtils.toggleBlockType(editorState, style));
    }
  };

  //Sets content block type state to send to toolbar if editor exited a block style
  useEffect(() => {
    const prevContentState = editorState.getCurrentContent();
    if (!prevContentState.hasText()) {
      setBlockType(RichUtils.getCurrentBlockType(editorState));
    }
  }, [editorState]);

  //Run on any change to the editor, updates the editorState
  const handleChange = newEditorState => {
    const prevContentState = editorState.getCurrentContent();
    const currentContentState = newEditorState.getCurrentContent();

    if (currentContentState.hasText()) {
      hasContent(true);
    } else {
      hasContent(false);
    }

    if (!prevContentState.hasText()) {
      setEditorState(EditorState.set(newEditorState, { decorator }));
      return;
    } //Update toolbar buttons
    else {
      setInlineStyles(newEditorState.getCurrentInlineStyle().toArray());
      setBlockType(RichUtils.getCurrentBlockType(newEditorState));
      setEditorState(EditorState.set(newEditorState, { decorator }));
    }
  };

  //Add CSS class to code-blocks
  const getBlockStyle = block => {
    switch (block.getType()) {
      case "code-block":
        return "language-".concat(mappedLanguage);
      default:
        return null;
    }
  };

  //Key press handlers
  const handleKeyCommand = command => {
    let newState;
    if (CodeUtils.hasSelectionInBlock(editorState)) {
      newState = CodeUtils.handleKeyCommand(editorState, command);
    }

    if (!newState && command === "soft-return") {
      newState = RichUtils.insertSoftNewline(editorState);
    }

    if (!newState) {
      newState = RichUtils.handleKeyCommand(editorState, command);
    }

    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const bindKeys = event => {
    if (event.shiftKey && event.key === "Enter") {
      return "soft-return";
    }

    if (!CodeUtils.hasSelectionInBlock(editorState)) {
      return getDefaultKeyBinding(event);
    }
    return getDefaultKeyBinding(event);
  };

  const onTab = event => {
    if (!CodeUtils.hasSelectionInBlock(editorState)) return "not-handled";

    setEditorState(CodeUtils.onTab(event, editorState));
    return "handled";
  };

  //Send data to parent page if button was pressed and no errors
  useEffect(() => {
    if (didSubmit) {
      const content = editorState.getCurrentContent();
      const rawJs = convertToRaw(content);
      if (postId) {
        //submitting an edit
        onSubmit({ postId: postId, data: rawJs });
      } else {
        // submitting a reply
        onSubmit({ data: rawJs });
        setEditorState(EditorState.createEmpty(decorator));
      }
    }
  }, [didSubmit]);

  return (
    <div className={classes.root}>
      <Toolbar
        onChange={handleFormatChange}
        inlineStyle={currentInlineStyles}
        blockStyle={currentBlockType}
        readOnly={readOnly}
      />
      <div className={editorStyle} onClick={focusEditor}>
        <Editor
          ref={editor}
          editorState={editorState}
          onChange={handleChange}
          customStyleMap={editorStyleMap}
          keyBindingFn={bindKeys}
          handleKeyCommand={handleKeyCommand}
          onTab={onTab}
          blockStyleFn={getBlockStyle}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default TextEditor;
