import React, { useState, useEffect, useRef } from 'react';

interface Props {
    initialText?: string[];
}


const renderPrompt = (cmd = '') => {
    return [
        <span key="user" className="text-cyan-400">edwardvaisman</span>,
        <span key="in" className="text-white/90"> in </span>,
        <span key="path" className="text-green-400">~/public_html </span>,
        <span key="lambda" className="text-yellow-400">λ </span>,
        <span key="cmd" className="text-white/90"> {cmd}</span>
    ];
};

const initText = `
Welcome to My Terminal
Name: Edward Vaisman
Role: Software Developer
Location: 🍁 Toronto, ON

Contact: vaismanedward@gmail.com
Github: github.com/eddyv

Ask me anything!

Type the slash command '/help' to see available commands
`;

const Terminal: React.FC<Props> = ({ initialText = [initText] }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<(string | React.ReactNode)[]>(initialText);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    const commands: { [key: string]: () => string } = {
        '/help': () => 'Available commands: /help, /about, /clear, /contact, /projects',
        '/about': () => 'I am a Software Engineer based in Toronto, specializing in Event-Driven Architectures and Microservices.',
        '/clear': () => {
            setHistory([]);
            return '';
        },
        '/contact': () => 'Email: vaismanedward@gmail.com\nGitHub: github.com/eddyv',
        '/projects': () => 'Visit github.com/eddyv to see my projects'
    };

    const handleCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim().toLowerCase();
        if (trimmedCmd === '') return;

        const output = commands[trimmedCmd]
            ? commands[trimmedCmd]()
            : `Command not found: ${trimmedCmd}. Type 'help' for available commands.`;

        setHistory(prev => [...prev, <div key={prev.length} className="flex">{renderPrompt(cmd)}</div>, ...(output ? [output] : [])]);
        setCommandHistory(prev => [...prev, cmd]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
            setHistoryIndex(-1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
            } else {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <div className="fixed inset-x-0 bottom-30 top-20 mx-auto max-w-6xl overflow-hidden rounded-lg bg-[#1C1C1C]/90 shadow-2xl">
            <div className="flex h-10 items-center gap-2 rounded-t-lg bg-[#1c1c1c]/90 px-4">
                <div className="flex gap-2">
                    <div className="size-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="size-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="size-3 rounded-full bg-[#27C93F]"></div>
                </div>
                <div className="flex-1 text-center">
                    <span className="text-sm text-white/60">terminal</span>
                </div>
            </div>
            
            <div className="flex h-[calc(100%-5rem)] flex-col">
                <div 
                    ref={terminalRef}
                    className="flex-1 overflow-auto p-4 font-mono text-sm text-white/90"
                >
                    {history.map((line, i) => (
                        <div key={i} className="mb-1 leading-relaxed whitespace-pre-wrap">
                            {typeof line === 'string' ? line : line}
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 p-4">
                    <div className="flex items-center font-mono text-sm">
                        <div className="flex items-center gap-2">
                            {renderPrompt()}
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="ml-2 flex-1 bg-transparent text-white/90 outline-none"
                            autoFocus
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terminal;
