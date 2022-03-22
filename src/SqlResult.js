import styled from 'styled-components';

import React, { useContext, useEffect, useState, useRef } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco,googlecode } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function SQLResult({ result }) {
    return (
        <>
            {result &&
                <SyntaxHighlighter language="pgsql" style={googlecode}>
                    {result}
                </SyntaxHighlighter>
            }
        </>
    )
}

export default SQLResult;