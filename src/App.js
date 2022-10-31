import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import {Button, Pane, Popover, TextInput, InlineAlert} from "evergreen-ui";
import Editor from "./Editor";

function PenInput({value, onChange, onClick, invalid,action}) {
    return <Pane padding={4} display={"grid"} gridTemplateColumns="1fr" gap={4} gridTemplateRows="1fr 1fr">
        <TextInput value={value} onChange={onChange} name="pen-name"
                   placeholder="Enter Pen Name..."/>
        {invalid && <InlineAlert intent="danger"> Please enter pen name</InlineAlert>}
        <Button appearance="primary" small onClick={onClick}>{action.toUpperCase()}</Button>
    </Pane>;
}


function Sidebar({setHtmlCode, setCssCode, setJsCode, htmlCode, cssCode, jsCode}) {
    const [penName, setPenName] = useState('');
    const [item, setItem] = useState({})
    const [isInvalid, setIsInvalid] = useState(false)
    const resetCode = () => {
        setHtmlCode('');
        setCssCode('');
        setJsCode('');
    }
    const handleChange = (e) => {
        e.preventDefault();
        setPenName(e.target.value);
    }
    const handleSubmit = (e,action) => {
        e.preventDefault();
        if(penName != '' && penName != null ) {
            if (action === 'save') {
                const pen = {
                    html: htmlCode,
                    css: cssCode,
                    js: jsCode
                }
                localStorage.setItem(penName, JSON.stringify(pen));
                setItem(pen);
                setPenName('');
            } else {
                try{
                    const data = JSON.parse(localStorage.getItem(penName));
                    setHtmlCode(data.html);
                    setCssCode(data.css);
                    setJsCode(data.js);
                    setItem(data);
                    setPenName('');
                }catch (e) {
                    console.log(e)
                    setPenName('');
                }
            }
        }else{
            setIsInvalid(true);
        }
    }
    return (
        <Pane background='black' padding={4}>
            <Pane display={"flex"} justifyContent={"space-between"} width={250} padding={4}>
                <Popover content={
                    <PenInput value={penName} action={'save'} onChange={(e) => handleChange(e)} invalid={isInvalid}
                              onClick={(e) => handleSubmit(e, 'save')}/>
                }>
                    <Button small appearance="primary">Save</Button>
                </Popover>
                <Popover content={
                    <PenInput value={penName} action={'load'} onChange={(e) => handleChange(e)} invalid={isInvalid}
                              onClick={(e) => handleSubmit(e, 'load')}/>
                }>
                    <Button small appearance="primary">Load</Button>
                </Popover>
                <Button onClick={resetCode} small appearance="primary" intent="danger">Reset Code</Button>
            </Pane>
        </Pane>
    )
}

const createHeaders = (headers) => {
    return headers.map((item) => ({
        text: item, ref: useRef(),
    }));
}

function App({minCellWidth}) {

    const [htmlCode, setHtmlCode] = useState('');
    const [cssCode, setCssCode] = useState('');
    const [jsCode, setJsCode] = useState('');
    const [srcDoc, setSrcDoc] = useState('');
    const [tableHeight, setTableHeight] = useState('auto');
    const [activeIndex, setActiveIndex] = useState(null);
    const tableElement = useRef(null);
    const headers = ['html', 'css', 'javascrpt'];
    const editors = [{lang: "html", code: htmlCode, setCode: setHtmlCode}, {
        lang: "css", code: cssCode, setCode: setCssCode
    }, {lang: "javascript", code: jsCode, setCode: setJsCode},]

    const columns = createHeaders(headers);
    useEffect(() => {
        const srcDoc = `<html><body>${htmlCode}</body><style>${cssCode}</style><script>${jsCode}</script></html>`
        setSrcDoc(srcDoc);
    }, [htmlCode, cssCode, jsCode]);

    useEffect(() => {
        setTableHeight(tableElement.current.offsetHeight);
    }, []);

    const mouseDown = (index) => {
        setActiveIndex(index);
    };

    const mouseMove = useCallback((e) => {
        const gridColumns = columns.map((col, i) => {
            if (i === activeIndex) {
                const width = e.clientX - col.ref.current.offsetLeft;

                if (width >= minCellWidth) {
                    return `${width}px`;
                }
            }
            return `${col.ref.current.offsetWidth}px`;
        });
        gridColumns[2] = 'auto';
        tableElement.current.style.gridTemplateColumns = `${gridColumns.join(" ")}`;
    }, [activeIndex, columns, minCellWidth]);
    const removeListeners = useCallback(() => {
        window.removeEventListener("mousemove", mouseMove);
        window.removeEventListener("mouseup", removeListeners);
    }, [mouseMove]);

    const mouseUp = useCallback(() => {
        setActiveIndex(null);
        removeListeners();
    }, [setActiveIndex, removeListeners]);
    useEffect(() => {
        if (activeIndex !== null) {
            window.addEventListener("mousemove", mouseMove);
            window.addEventListener("mouseup", mouseUp);
        }

        return () => {
            removeListeners();
        };
    }, [activeIndex, mouseMove, mouseUp, removeListeners]);

    return (<>
            <Sidebar cssCode={cssCode} htmlCode={htmlCode} jsCode={jsCode} setHtmlCode={setHtmlCode}
                     setCssCode={setCssCode} setJsCode={setJsCode}/>
            <Pane className="codepen">
                <div className="table-wrapper">
                    <table className="resizeable-table" ref={tableElement}>
                        <thead>
                        <tr>
                            {columns.map(({ref, text}, i) => (<th ref={ref} key={text} className='editor-header'>
                                <div className="editor-span">{text.toUpperCase()}</div>
                                <div
                                    style={{height: tableHeight}}
                                    onMouseDown={() => mouseDown(i)}
                                    className={`resize-handle ${activeIndex === i ? "active" : "idle"}`}
                                />
                            </th>))}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            {editors.map(({lang, code, setCode}, i) => (
                                <td key={lang}>
                                    <div className="editor-span">
                                        <Editor lang={lang} code={code} setCode={setCode}/>
                                    </div>
                                </td>
                            ))}
                        </tr>
                        </tbody>
                    </table>
                </div>
                <hr className="separator"/>
                <iframe id="editor-preview" srcDoc={srcDoc} title="output" sandbox="allow-scripts" width="100%" height="100%" />
            </Pane>
        </>
    );
}

export default App;
