import React , { useState, useCallback, useEffect, useRef } from 'react';

import {Pane} from "evergreen-ui";
import Editor from "@monaco-editor/react";

const CodeEditor = ({lang,code,setCode}) => {
    const editorRef = React.useRef(null);

    return (
            <Pane ref={editorRef} className="editor" >
                <Pane className="code-mirror" >
                    <Editor
                        value={code}
                        language={lang}
                        theme="vs-dark"
                        options={{
                            minimap: {enabled: false},
                        }}
                        onChange={(value, viewUpdate) => {
                            setCode(value);
                        }}
                    />
                </Pane>
            </Pane>
    );
};

export default CodeEditor;
